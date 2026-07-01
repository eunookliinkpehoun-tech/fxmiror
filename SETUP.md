# FXMIRROR — Full Setup Guide (Windows Server)

FXMIRROR is a MetaTrader 5 copy-trading platform. Multiple users each connect
their own MT5 account, and a single **global master** account's trades are
copied to every connected **slave** account.

Everything runs on **your Windows server** (the one that already has MySQL):

```
                         ┌─────────────────────────────────────────┐
                         │            WINDOWS SERVER                 │
                         │                                           │
   Browser  ───HTTP────► │  Next.js web app  (port 3000)            │
   (users)               │      │                                   │
                         │      │ reads/writes                      │
                         │      ▼                                   │
                         │   MySQL  ◄────reads/writes────┐          │
                         │      ▲                        │          │
                         │      │ writes balances        │          │
                         │      │ + copied trades        │          │
                         │  ┌───┴──────────────────┐     │          │
                         │  │  Python MT5 engine    │─────┘          │
                         │  │  (main.py)            │                │
                         │  └───────┬───────────────┘                │
                         │          │ MetaTrader5 library            │
                         │          ▼                                │
                         │   MT5 terminal(s)  ──► brokers            │
                         └─────────────────────────────────────────┘
```

**Why two programs?** The `MetaTrader5` Python library is the only way to talk to
MT5, and it only works on Windows. A browser or Node.js **cannot** connect to MT5.
So the web app and the Python engine never talk directly — they communicate
**only through the MySQL database**.

---

## 1. Prerequisites (install once on the Windows server)

- **MySQL** — already installed. Good.
- **Node.js 20+** — https://nodejs.org (LTS)
- **Python 3.11+** — https://python.org (tick **"Add Python to PATH"**)
- **MetaTrader 5 terminal** — installed and able to log in manually at least once.

---

## 2. Create the database

Open a terminal in the project folder and run:

```bash
mysql -u root -p < db/schema.sql
```

This creates the `fxmirror` database and all tables.

(Optional) create a dedicated MySQL user:

```sql
CREATE USER 'fxmirror'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON fxmirror.* TO 'fxmirror'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Generate the shared encryption key

MT5 passwords are encrypted (AES-256-GCM) in the database. The web app encrypts
them; the Python engine decrypts them. **Both must use the exact same key.**

Generate it once:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the printed value — you'll paste it into BOTH env files below as `MT5_ENC_KEY`.

---

## 4. Configure and run the web app

```bash
# in the project root
copy .env.example .env.local        # (Windows)  — then edit .env.local
pnpm install
pnpm build
pnpm start                          # serves on http://localhost:3000
```

Fill `.env.local` with your MySQL credentials, the `MT5_ENC_KEY` from step 3,
and `NEXT_PUBLIC_APP_URL` (your public URL for referral links).

Users can now open the site, sign up, log in, and save their MT5 credentials.
Saved accounts start with status **pending** — the engine verifies them next.

---

## 5. Configure and run the Python engine

```bash
cd engine
copy .env.example .env              # then edit .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

In `engine/.env` set:

- the **same MySQL** connection as the web app,
- the **same `MT5_ENC_KEY`** from step 3,
- `MT5_TERMINAL_PATH` — full path to `terminal64.exe`,
- the **MASTER account** credentials (`MASTER_LOGIN`, `MASTER_PASSWORD`, `MASTER_SERVER`).

The engine loops forever and, on every cycle:

1. Logs in to the **master** account and reads its open positions.
2. For each connected user account (status `pending` / `connected`):
   - logs in with the user's decrypted credentials,
   - writes the live **balance / equity / free margin** back to MySQL,
   - **copies** the master's positions (opens missing ones, closes removed ones),
   - records each copied trade in `copied_trades`.
3. Flips finished 24h cycles to `payment_due` when profit is positive.

Keep this window running. To run it 24/7, install it as a Windows service with
**NSSM** (https://nssm.cc):

```bash
nssm install FxMirrorEngine "C:\path\to\engine\.venv\Scripts\python.exe" "C:\path\to\engine\main.py"
nssm start FxMirrorEngine
```

---

## 6. How multi-user copying works

- Each user row in `users` owns exactly one row in `mt5_accounts` (their slave account).
- The **master** lives only in `engine/.env` — never in the web app or database.
- The engine processes accounts **sequentially** because the MT5 library controls
  one terminal at a time. Lot sizes are scaled per slave (see `COPY_LOT_MODE` in
  `engine/.env`: `fixed`, `multiplier`, or `balance` proportional).

---

## 7. Daily checklist

- MySQL running ✔
- Web app running (`pnpm start`) ✔
- MT5 terminal open and logged in at least once ✔
- Python engine running (`python main.py` or NSSM service) ✔
