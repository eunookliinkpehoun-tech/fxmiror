"""Thin wrapper around the MetaTrader5 Python library.

IMPORTANT: the MetaTrader5 library controls ONE terminal and is logged into
ONE account at a time. To service many users we log in sequentially with
mt5.login(...) and switch accounts one after another inside each loop tick.
For higher throughput, run several portable MT5 terminals (one engine process
each) and shard the accounts between them.
"""
import MetaTrader5 as mt5
import config


def initialize_terminal() -> bool:
    """Start the MT5 terminal once (logged into the master by default)."""
    kwargs = dict(
        login=config.MASTER_LOGIN,
        password=config.MASTER_PASSWORD,
        server=config.MASTER_SERVER,
    )
    if config.MT5_TERMINAL_PATH:
        ok = mt5.initialize(config.MT5_TERMINAL_PATH, **kwargs)
    else:
        ok = mt5.initialize(**kwargs)
    if not ok:
        print("[MT5] initialize failed:", mt5.last_error())
    return ok


def login(account_login: int, password: str, server: str) -> bool:
    """Switch the terminal to a specific account."""
    ok = mt5.login(account_login, password=password, server=server)
    if not ok:
        print(f"[MT5] login failed for {account_login}@{server}:", mt5.last_error())
    return ok


def account_snapshot() -> dict | None:
    info = mt5.account_info()
    if info is None:
        return None
    return {
        "broker": info.company,
        "account_type": "Demo" if info.trade_mode == 0 else "Real",
        "leverage": info.leverage,
        "currency": info.currency,
        "balance": round(info.balance, 2),
        "equity": round(info.equity, 2),
        "free_margin": round(info.margin_free, 2),
        "daily_profit": round(info.profit, 2),
    }


def get_open_positions() -> list:
    positions = mt5.positions_get()
    if positions is None:
        return []
    return list(positions)


def _filling_mode(symbol: str):
    info = mt5.symbol_info(symbol)
    if info is None:
        return mt5.ORDER_FILLING_IOC
    # Prefer the symbol's allowed filling type.
    if info.filling_mode & 1:
        return mt5.ORDER_FILLING_FOK
    if info.filling_mode & 2:
        return mt5.ORDER_FILLING_IOC
    return mt5.ORDER_FILLING_RETURN


def ensure_symbol(symbol: str) -> bool:
    info = mt5.symbol_info(symbol)
    if info is None:
        return False
    if not info.visible:
        return mt5.symbol_select(symbol, True)
    return True


def open_market_order(symbol: str, side: str, volume: float):
    """side: 'BUY' or 'SELL'. Returns the mt5 order result (or None)."""
    if not ensure_symbol(symbol):
        print(f"[MT5] symbol not available: {symbol}")
        return None
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        return None
    is_buy = side == "BUY"
    price = tick.ask if is_buy else tick.bid
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": float(volume),
        "type": mt5.ORDER_TYPE_BUY if is_buy else mt5.ORDER_TYPE_SELL,
        "price": price,
        "deviation": config.DEVIATION,
        "magic": config.MAGIC,
        "comment": "FXMIRROR copy",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(symbol),
    }
    return mt5.order_send(request)


def close_position(position) -> bool:
    """Close an open position by sending the opposite market order."""
    symbol = position.symbol
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        return False
    is_long = position.type == mt5.POSITION_TYPE_BUY
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": position.volume,
        "type": mt5.ORDER_TYPE_SELL if is_long else mt5.ORDER_TYPE_BUY,
        "position": position.ticket,
        "price": tick.bid if is_long else tick.ask,
        "deviation": config.DEVIATION,
        "magic": config.MAGIC,
        "comment": "FXMIRROR close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(symbol),
    }
    result = mt5.order_send(request)
    return result is not None and result.retcode == mt5.TRADE_RETCODE_DONE


def shutdown():
    mt5.shutdown()
