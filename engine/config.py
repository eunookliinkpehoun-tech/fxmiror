"""Configuration loaded from environment variables / .env file."""
import os
from dotenv import load_dotenv

load_dotenv()


def _req(name: str) -> str:
    val = os.getenv(name)
    if not val:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val


# ---- MySQL (same database the Next.js app uses) ----
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "fxmirror")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "fxmirror")

# ---- Encryption key (MUST be identical to the Next.js MT5_ENC_KEY) ----
MT5_ENC_KEY = _req("MT5_ENC_KEY")  # base64 of 32 random bytes

# ---- Master account (the single global account whose trades are copied) ----
MASTER_LOGIN = int(_req("MASTER_LOGIN"))
MASTER_PASSWORD = _req("MASTER_PASSWORD")
MASTER_SERVER = _req("MASTER_SERVER")

# Path to the MT5 terminal64.exe. Leave empty to use the default installation.
MT5_TERMINAL_PATH = os.getenv("MT5_TERMINAL_PATH", "") or None
# Connection timeout for mt5.initialize() in milliseconds (default 60s).
MT5_TIMEOUT = int(os.getenv("MT5_TIMEOUT", "60000"))
# Set to "1" only if you run a PORTABLE MT5 install (terminal64.exe /portable).
MT5_PORTABLE = os.getenv("MT5_PORTABLE", "0") == "1"

# ---- Copy behaviour ----
# Lot sizing mode:
#   "fixed"       -> always COPY_FIXED_LOT on each slave
#   "multiplier"  -> master_volume * COPY_MULTIPLIER
#   "balance"     -> scale by slave_balance / master_balance
COPY_MODE = os.getenv("COPY_MODE", "balance")
COPY_FIXED_LOT = float(os.getenv("COPY_FIXED_LOT", "0.01"))
COPY_MULTIPLIER = float(os.getenv("COPY_MULTIPLIER", "1.0"))
MIN_LOT = float(os.getenv("MIN_LOT", "0.01"))
MAX_LOT = float(os.getenv("MAX_LOT", "50.0"))

# Loop timing (seconds)
SYNC_INTERVAL = float(os.getenv("SYNC_INTERVAL", "5"))

# Order execution
DEVIATION = int(os.getenv("DEVIATION", "30"))   # max price slippage in points
MAGIC = int(os.getenv("MAGIC", "770077"))       # identifies FXMIRROR-copied trades
