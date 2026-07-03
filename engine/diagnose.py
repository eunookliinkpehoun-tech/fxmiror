"""
FXMIRROR MT5 Deep Diagnostic
Run from the RDP session on the VPS where MetaTrader 5 is installed:

    & "C:\Python314\python.exe" diagnose.py

This script tests every layer independently and tells you exactly what is wrong.
"""
import os
import sys
import ctypes
import subprocess

SEP = "=" * 60

def section(title):
    print(f"\n{SEP}")
    print(f"  {title}")
    print(SEP)

# ── 1. Python environment ────────────────────────────────────────
section("1. Python environment")
print(f"  Python version : {sys.version}")
print(f"  Executable     : {sys.executable}")
print(f"  Platform       : {sys.platform}")
arch = "64-bit" if sys.maxsize > 2**32 else "32-bit *** WRONG - MT5 needs 64-bit Python ***"
print(f"  Architecture   : {arch}")

# ── 2. MetaTrader5 package ───────────────────────────────────────
section("2. MetaTrader5 package")
try:
    import MetaTrader5 as mt5
    print(f"  Package version: {mt5.__version__}")
    print(f"  Package file   : {mt5.__file__}")
except ImportError as e:
    print(f"  *** NOT INSTALLED: {e}")
    print("  Run: C:\\Python314\\python.exe -m pip install MetaTrader5")
    sys.exit(1)

# ── 3. Windows session & privilege ──────────────────────────────
section("3. Windows session & privilege")
try:
    import ctypes.wintypes
    session_id = ctypes.wintypes.DWORD()
    pid = os.getpid()
    ctypes.windll.kernel32.ProcessIdToSessionId(pid, ctypes.byref(session_id))
    sid = session_id.value
    print(f"  Python PID     : {pid}")
    print(f"  Session ID     : {sid}  (must be >= 1 for RDP; 0 = SSH/service session)")
    if sid == 0:
        print("  *** SESSION 0 DETECTED — Python is running in a service/SSH session.")
        print("  *** MetaTrader5 IPC requires an interactive desktop session (RDP).")
        print("  *** Open PowerShell INSIDE the RDP window, not via SSH.")
    else:
        print(f"  OK — interactive session {sid}")
except Exception as e:
    print(f"  Could not determine session ID: {e}")

is_admin = ctypes.windll.shell32.IsUserAnAdmin()
print(f"  Running as admin: {bool(is_admin)}")

# ── 4. terminal64.exe process & session ─────────────────────────
section("4. terminal64.exe process & session")
try:
    result = subprocess.run(
        ["powershell", "-Command",
         "Get-Process terminal64 -ErrorAction SilentlyContinue | "
         "Select-Object Id,SessionId,WorkingSet,Path | Format-Table -AutoSize"],
        capture_output=True, text=True, timeout=10
    )
    out = result.stdout.strip()
    if out:
        print(out)
        # Check if session IDs match
        lines = [l for l in out.splitlines() if l.strip() and not l.startswith("Id")]
        for line in lines:
            parts = line.split()
            if len(parts) >= 2:
                t_session = parts[1]
                if str(sid) != t_session:
                    print(f"\n  *** SESSION MISMATCH: Python session={sid}, terminal64 session={t_session}")
                    print("  *** This is the root cause of IPC timeout.")
                    print("  *** Open PowerShell inside RDP (not via SSH/remote).")
                else:
                    print(f"\n  OK — same session {t_session}")
    else:
        print("  *** terminal64.exe is NOT running. Open MetaTrader 5 first.")
except Exception as e:
    print(f"  Could not query processes: {e}")

# ── 5. MT5_TERMINAL_PATH from .env ──────────────────────────────
section("5. MT5_TERMINAL_PATH")
env_path = None
env_file = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            if line.startswith("MT5_TERMINAL_PATH="):
                env_path = line.split("=", 1)[1].strip()
                break
if env_path:
    exists = os.path.exists(env_path)
    print(f"  MT5_TERMINAL_PATH = {env_path}")
    print(f"  File exists       : {exists}")
    if not exists:
        print("  *** PATH DOES NOT EXIST — check your .env file.")
else:
    print("  MT5_TERMINAL_PATH not set in .env")
    # Try to auto-detect
    candidates = [
        r"C:\Program Files\MetaTrader 5\terminal64.exe",
        r"C:\Program Files (x86)\MetaTrader 5\terminal64.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            print(f"  Auto-detected: {c}")
            env_path = c
            break
    else:
        # Check AppData
        appdata = os.environ.get("APPDATA", "")
        mq_base = os.path.join(appdata, "MetaQuotes", "Terminal")
        if os.path.exists(mq_base):
            for folder in os.listdir(mq_base):
                t = os.path.join(mq_base, folder, "terminal64.exe")
                if os.path.exists(t):
                    print(f"  Auto-detected in AppData: {t}")
                    env_path = t
                    break

# ── 6. mt5.initialize() — step by step ──────────────────────────
section("6. mt5.initialize() — step by step with 30s timeout")

def try_init(label, **kwargs):
    print(f"\n  Trying: mt5.initialize({', '.join(f'{k}={v!r}' for k,v in kwargs.items())})")
    ok = mt5.initialize(**kwargs)
    if ok:
        info = mt5.terminal_info()
        acc  = mt5.account_info()
        print(f"  SUCCESS via '{label}'")
        if info:
            print(f"    Terminal : {info.name} build={info.build}")
            print(f"    Connected: {info.connected}")
            print(f"    Trade OK : {info.trade_allowed}")
            print(f"    Data path: {info.data_path}")
        if acc:
            print(f"    Account  : {acc.login} @ {acc.server} ({acc.company})")
        mt5.shutdown()
        return True
    err = mt5.last_error()
    print(f"  FAILED via '{label}': {err}")
    mt5.shutdown()
    return False

timeout = 30000

# Attempt A: plain attach
if not try_init("plain attach", timeout=timeout):
    # Attempt B: with path
    if env_path:
        if not try_init("path only", path=env_path, timeout=timeout):
            print("\n  *** Both strategies failed. See session/privilege info above.")
    else:
        print("\n  *** No terminal path available to try path strategy.")

# ── 7. Summary ──────────────────────────────────────────────────
section("7. Summary & next steps")
try:
    import ctypes.wintypes
    session_id2 = ctypes.wintypes.DWORD()
    ctypes.windll.kernel32.ProcessIdToSessionId(os.getpid(), ctypes.byref(session_id2))
    sid2 = session_id2.value
    if sid2 == 0:
        print("  ROOT CAUSE: Python is in session 0 (SSH/service).")
        print("  FIX: Open PowerShell directly in your RDP window (not via SSH).")
    else:
        print(f"  Python session : {sid2} (OK - interactive)")
        print("  If still failing after this script:")
        print("  a) Reinstall MT5 to get build 5735 (matching the Python package 5.0.5735)")
        print("     Download: https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe")
        print("  b) Or wait for MetaQuotes to publish Python package 5.0.5836 on PyPI")
        print("  c) Make sure 'Allow DLL imports' AND 'Allow algorithmic trading' are")
        print("     both checked in MT5 > Tools > Options > Expert Advisors")
except Exception:
    pass

print(f"\n{SEP}")
print("  Diagnostic complete.")
print(SEP)
