# DecoyVerse Agent - Verification & Management Guide

## 1. How to Verify the Agent is Running

The DecoyVerse agent runs automatically in the background. Here are multiple ways to check its status:

### Method 1: Check Running Processes (Recommended)
```powershell
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*DecoyVerse*" } | Select-Object Id, ProcessName, Path, StartTime
```

**Expected Output:**
```
Id ProcessName Path                      StartTime
-- ----------- ----                      ---------
1234 python    C:\DecoyVerse\agent.py    2/5/2026 10:30:15 AM
```

If **no output** appears, the agent isn't running.

### Method 2: Check Scheduled Task
```powershell
Get-ScheduledTask -TaskName "DecoyVerseAgent" | Select-Object TaskName, State, LastRunTime
```

**Expected Output:**
```
TaskName        State LastRunTime
--------        ----- -----------
DecoyVerseAgent Ready 2/5/2026 10:30:15 AM
```

- **State: Ready** = Task exists and can run
- **State: Running** = Task is currently executing  
- **LastRunTime** = Last time the agent started

### Method 3: Check Agent Logs
```powershell
Get-Content C:\DecoyVerse\agent.log -Tail 50
```

Look for recent log entries like:
```
INFO:AgentConfig:✓ Heartbeat sent - node is now active
🟢 AGENT ACTIVE
   Node ID: node-xxxxxxxxxx
   Honeytokens: 5 files deployed
```

### Method 4: Check Dashboard
1. Open DecoyVerse Dashboard
2. Go to **Nodes** page
3. Look for your node (e.g., "HP-360-elite")
4. **Status should show "Active"** with green indicator
5. **Last Seen** should be within last 30 seconds

---

## 2. How the Agent Starts Automatically

The agent uses **Windows Task Scheduler** to start automatically at user login.

### Verify Auto-Start Configuration:
```powershell
$task = Get-ScheduledTask -TaskName "DecoyVerseAgent"
$task.Triggers | Select-Object TriggerType, UserId
```

**Expected Output:**
```
TriggerType UserId
----------- ------
AtLogon     COMPUTERNAME\YourUsername
```

### Manual Start (if not running):
```powershell
Start-ScheduledTask -TaskName "DecoyVerseAgent"
```

### Or run directly:
```powershell
cd C:\DecoyVerse
python agent.py
```

---

## 3. Decoys vs Honeytokens - What's the Difference?

### **Decoys** (File/Service/Port Decoys)
- **Purpose:** Fake files, services, or open ports that attackers might interact with
- **Types:**
  - **File Decoys**: Fake documents, scripts, configuration files
  - **Service Decoys**: Fake network services (SSH, RDP, etc.)
  - **Port Decoys**: Open ports listening for connections
- **Location:** Strategic directories like Documents, Downloads, Desktop
- **Trigger:** File access, service connection, port scan
- **UI Page:** **Decoys** page in dashboard

### **Honeytokens** (Credential Traps)
- **Purpose:** Fake credentials, API keys, and authentication tokens that can be tracked
- **Types:**
  - **AWS/Azure/GCP credentials** - Cloud service keys
  - **Database credentials** - MySQL, PostgreSQL passwords
  - **API tokens** - Stripe, Twilio, GitHub tokens
  - **SSH keys** - Fake private keys
- **Location:** Hidden in config files, `.aws`, `.ssh`, environment variables
- **Trigger:** When credentials are used/transmitted anywhere
- **UI Page:** **Honeytokens** page in dashboard

### Key Differences:

| Aspect | Decoys | Honeytokens |
|--------|--------|-------------|
| **What they are** | Fake files/services | Fake credentials |
| **Detection method** | File access monitoring | Credential usage tracking |
| **Deployment count** | 3-10 files typical | 5-50 tokens typical |
| **Risk level** | Medium - indicates reconnaissance | High - indicates active attack |
| **Dashboard page** | Decoys | Honeytokens |

---

## 4. Creating Nodes with Custom Configuration

When you create a new node from the **Nodes** page, you can now configure:

### Configuration Options:

1. **Node Name** (Required)
   - Example: "Production-DB-01", "HR-Workstation", "Marketing-Laptop"
   - Use descriptive names to identify the machine

2. **Operating System** (Default: Windows)
   - **Windows** - For Windows 10/11, Server 2019/2022
   - **Linux** - For Ubuntu, CentOS, RHEL, Debian
   - **macOS** - For Mac computers
   
   The agent will deploy OS-appropriate decoys to common directories.

3. **Decoy Files** (Default: 3)
   - Range: 1-20 files
   - These are fake files deployed to strategic locations
   - Higher numbers = more coverage but more clutter
   - **Recommended:** 3-5 for workstations, 5-10 for servers

4. **Honeytokens** (Default: 5)
   - Range: 1-50 tokens
   - Fake credentials embedded in config files
   - Higher numbers = better coverage of credential types
   - **Recommended:** 5-10 for workstations, 10-30 for servers

### Example Configurations:

**Developer Workstation:**
```
OS: Windows
Decoys: 5 (fake source code, API docs)
Honeytokens: 10 (AWS, GitHub, database creds)
```

**Production Server:**
```
OS: Linux
Decoys: 8 (config backups, data dumps)
Honeytokens: 20 (database, cloud, API keys)
```

**HR Department Computer:**
```
OS: Windows
Decoys: 3 (employee data, payroll files)
Honeytokens: 5 (basic credentials)
```

---

## 5. Verifying Deployment

After creating a node and installing the agent:

### Step 1: Wait 1-2 Minutes
The agent needs time to:
1. Start up
2. Deploy honeytokens to file system
3. Register with backend
4. Send first heartbeat

### Step 2: Check Node Status
1. Go to **Dashboard** → **Nodes**
2. Find your node
3. Status should show **"Active"** (green)
4. **Last Seen** should be recent (< 30 seconds)

### Step 3: Verify Decoys Deployed
1. Go to **Decoys** page
2. Filter by your node name (dropdown at top)
3. You should see your configured number of decoy files
4. Each entry shows:
   - File name (e.g., "credentials.txt", "config.env")
   - Type (file/service/port)
   - Location (full file path)
   - Status (active/inactive)

### Step 4: Verify Honeytokens Deployed
1. Go to **Honeytokens** page
2. Filter by your node name
3. You should see your configured number of honeytokens
4. Each entry shows:
   - Token type (AWS, database, SSH, etc.)
   - Trigger count (should be 0 initially)
   - Last triggered (should be "Never")

### Step 5: Check Deployed Files (Optional)
You can manually verify files were created:

**Windows:**
```powershell
Get-ChildItem -Path "$env:USERPROFILE\Documents" -Filter "*.env" -ErrorAction SilentlyContinue
Get-ChildItem -Path "$env:USERPROFILE\.aws" -ErrorAction SilentlyContinue
Get-ChildItem -Path "$env:USERPROFILE\.ssh" -ErrorAction SilentlyContinue
```

**Linux/macOS:**
```bash
ls -la ~/Documents/*.env 2>/dev/null
ls -la ~/.aws/ 2>/dev/null
ls -la ~/.ssh/ 2>/dev/null
```

---

## 6. Troubleshooting

### Agent Not Running?

**Check #1: Scheduled Task**
```powershell
Get-ScheduledTask -TaskName "DecoyVerseAgent" | Format-List *
```

If missing, reinstall the agent.

**Check #2: Python Installation**
```powershell
python --version
```

Should show Python 3.10+. If not installed, download from [python.org](https://python.org).

**Check #3: Agent Files Exist**
```powershell
Test-Path "C:\DecoyVerse\agent.py"
Test-Path "C:\DecoyVerse\agent_config.json"
```

Both should return `True`. If not, run installer again.

**Check #4: Agent Logs for Errors**
```powershell
Get-Content "C:\DecoyVerse\agent.log" -Tail 100 | Select-String "ERROR"
```

Look for syntax errors, permission errors, network errors.

### No Decoys Showing in Dashboard?

**Check #1: Agent Actually Deployed Them**
```powershell
Get-Content "C:\DecoyVerse\agent.log" | Select-String "Successfully deployed"
```

Look for: `✓ Successfully deployed 5/5 honeytokens`

**Check #2: Registration with Backend**
```powershell
Get-Content "C:\DecoyVerse\agent.log" | Select-String "Registered.*decoys"
```

Look for: `✓ Registered 5 decoys with backend`

**Check #3: Login to Dashboard**
Make sure you're logged in. The API requires authentication to view decoys.

**Check #4: Node Filter**
On Decoys/Honeytokens page, check the node dropdown. Select your specific node instead of "All Nodes".

### Agent Deployed Wrong Number of Decoys?

The agent configuration is stored in `agent_config.json`. Check it:
```powershell
Get-Content "C:\DecoyVerse\agent_config.json" | ConvertFrom-Json | Select-Object initial_decoys, initial_honeytokens
```

If wrong, you can manually edit it (requires agent restart):
```powershell
Stop-Process -Name python -Force
# Edit C:\DecoyVerse\agent_config.json
Start-ScheduledTask -TaskName "DecoyVerseAgent"
```

---

## 7. Quick Reference Commands

### Check if agent is running:
```powershell
Get-Process python | Where-Object { $_.Path -like "*DecoyVerse*" }
```

### Start agent manually:
```powershell
Start-ScheduledTask -TaskName "DecoyVerseAgent"
```

### Stop agent:
```powershell
Stop-Process -Name python -Force
```

### View recent logs:
```powershell
Get-Content "C:\DecoyVerse\agent.log" -Tail 50
```

### Check deployed files:
```powershell
Get-ChildItem -Path "$env:USERPROFILE\Documents","$env:USERPROFILE\.aws","$env:USERPROFILE\.ssh" -Recurse -File | Where-Object { $_.Name -match "env|cred|secret|key|token|backup" } | Select-Object Name, DirectoryName
```

### Restart agent:
```powershell
Stop-Process -Name python -Force
Start-ScheduledTask -TaskName "DecoyVerseAgent"
```

---

## 8. Security Best Practices

1. **Don't share the node API key** - It's stored in `agent_config.json` and should remain secret
2. **Don't delete deployed decoys manually** - Let the agent manage them
3. **Monitor the dashboard regularly** - Check for triggered decoys/honeytokens
4. **Investigate any triggers immediately** - Even one trigger indicates suspicious activity
5. **Update the agent** - Run the installer again to get the latest fixes

---

**Questions?** Check the dashboard logs or review the agent output for detailed information about what's happening.
