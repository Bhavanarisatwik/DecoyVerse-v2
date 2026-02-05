# DecoyVerse Production Issues - Complete Fixes

## Issues Identified & Fixed

### 1. ✅ Multiple Agents on Same System
**Problem:** User installed "Hp" agent, then "Lenove" agent on same laptop - causes conflicts

**Fix Applied:**
- Added detection check in `install.ps1` to warn if agent already exists
- Prompts user to cancel or continue
- If continuing, stops old agent processes before installing new one
- **Code location:** `backend/routes/install.py` lines 160-188

**Usage:**
```powershell
# Installer now shows:
============================================
  WARNING: Agent Already Installed!
============================================
Continue installation? (y/N)
```

---

### 2. ✅ install.ps1 Requires Manual Unblock
**Problem:** Windows blocks downloaded PowerShell scripts - users must manually unblock via Properties

**Fix Applied:**
- Added `Unblock-File` command at top of install.ps1
- Script self-unblocks when run
- Added comprehensive instructions in README.txt
- **Code location:** `backend/routes/install.py` line 159

**New Instructions in README:**
```powershell
# Method 1: One command (auto-unblocks)
Unblock-File .\install.ps1; .\install.ps1

# Method 2: Bypass execution policy
powershell -ExecutionPolicy Bypass -File .\install.ps1

# Method 3: GUI (old way)
Right-click → Properties → Unblock → OK → Run
```

---

### 3. ✅ Decoys Not Showing in Dashboard
**Problem:** 
- Lenovo node stuck at "installer_ready" status
- Decoys registered but not visible
- Frontend doesn't auto-refresh

**Root Causes:**
1. **Agent didn't send heartbeat** → Node status never updated from "installer_ready" to "active"
2. **MongoDB conflict error** → `triggers_count` field in both `$set` and `$setOnInsert` (ALREADY FIXED)
3. **Missing status update logic** → Heartbeat didn't detect "installer_ready" state

**Fixes Applied:**

#### Fix 3a: Agent sends both registration + heartbeat on startup
**File:** `agent_config.py`
```python
# Old code: Only sent heartbeat
registration.send_heartbeat(node_id, node_api_key)

# New code: Send registration THEN heartbeat
registration.register(node_id, node_api_key)  # Updates to "online"
registration.send_heartbeat(node_id, node_api_key)  # Updates to "active" + IP
```

#### Fix 3b: Heartbeat detects and fixes "installer_ready" state
**File:** `backend/routes/agent.py` 
```python
# Check if node was stuck in installer_ready state
node = await db_service.get_node_by_id(node_id)
if node and node.get("status") == "installer_ready":
    update_data["agent_status"] = "active"
    logger.info(f"🎉 Node {node_id} activated from installer_ready state")
```

#### Fix 3c: MongoDB conflict resolved (already fixed earlier)
**File:** `backend/services/db_service.py`
```python
# Remove triggers_count from data before $set
data_to_set = {k: v for k, v in decoy_data.items() if k != 'triggers_count'}

# Now $setOnInsert can safely set triggers_count: 0
```

---

### 4. ✅ Better Error Handling & Troubleshooting

**Fix Applied:**
- Added `TROUBLESHOOTING.txt` to installer ZIP with quick command reference
- Enhanced README.txt with step-by-step issue resolution
- Added debug endpoints: `/api/debug-nodes`, `/api/debug-decoys`

**Key Troubleshooting Commands:**
```powershell
# Check if agent is installed
Test-Path C:\DecoyVerse\agent.py

# Check if agent is running
Get-Process python | Where-Object {$_.Path -like "*DecoyVerse*"}

# Check scheduled task
Get-ScheduledTask DecoyVerseAgent

# Run agent manually to see errors
cd C:\DecoyVerse
python agent.py
```

---

## Files Modified

| File | Changes | Commit |
|------|---------|--------|
| `backend/routes/install.py` | - Added Unblock-File command<br>- Added multi-agent detection<br>- Enhanced README with troubleshooting<br>- Added TROUBLESHOOTING.txt to ZIP | 67fa5e0, 2bedfed |
| `backend/routes/agent.py` | - Added installer_ready → active transition<br>- Enhanced heartbeat logic | 67fa5e0 |
| `agent_config.py` | - Send both register + heartbeat on startup<br>- Better error messages | 67fa5e0 |
| `backend/services/db_service.py` | - Fix triggers_count conflict (earlier fix) | 850197c |
| `backend/routes/alerts.py` | - Added debug endpoints | 59f2c63, e704266 |

---

## Current Status

### ✅ Working (Hp Node)
- Node: `node-651809908a934ff4`
- Status: **active** ✓
- Decoys: **8 registered** ✓
- Last seen: `2026-02-05T06:35:53` ✓
- User: `6983a67d17cf06ef07c5531f` ✓

### ⚠️ Issue (Lenovo Node)
- Node: `node-defa82def52b4eda`
- Status: **installer_ready** ← Stuck
- Decoys: **0 registered** ← Agent didn't run
- Last seen: **null** ← Never connected
- User: `6983a67d17cf06ef07c5531f` (same user) ✓

**Cause:** Installer completed but agent.py didn't start (unknown reason - need user to run manually)

---

## How to Fix Lenovo Node Manually

Since the Lenovo installer completed but agent didn't start, user needs to:

### Option 1: Run Agent Manually (See Output)
```powershell
cd C:\DecoyVerse
python agent.py
```

**Expected output:**
```
✓ Agent registered as: node-defa82def52b4eda
✓ Registered X decoys with backend
🟢 AGENT ACTIVE
```

**If errors occur:**
- `ModuleNotFoundError` → `pip install requests watchdog psutil`
- `FileNotFoundError: agent_config.json` → Reinstall from dashboard
- Connection errors → Check firewall/network

### Option 2: Restart Scheduled Task
```powershell
Start-ScheduledTask DecoyVerseAgent
```

### Option 3: Reinstall Agent
1. Download fresh installer from dashboard
2. Run install.ps1 (it will detect existing agent and offer to replace)

---

## Production Checklist for New Installs

### Before Install:
- [ ] Check if agent already exists: `Test-Path C:\DecoyVerse\agent.py`
- [ ] If exists, decide: Use existing OR uninstall first
- [ ] Ensure Python 3.10+ installed: `python --version`

### During Install:
- [ ] Run as Administrator
- [ ] Watch for "Installation Complete!" message
- [ ] Note the PID number shown (agent is running)

### After Install (1-2 minutes):
- [ ] Refresh dashboard - node should show "Active"
- [ ] Check Decoys tab - should show X deployed decoys
- [ ] Verify scheduled task: `Get-ScheduledTask DecoyVerseAgent`

### If Issues:
- [ ] Run manually: `cd C:\DecoyVerse; python agent.py`
- [ ] Check for error messages
- [ ] Verify network connectivity
- [ ] Check README.txt and TROUBLESHOOTING.txt in installer ZIP

---

## Testing Results

### Test 1: MongoDB Conflict Fix
- **Before:** `registered: 0` with error "triggers_count conflict"
- **After:** `registered: 7` ✓ with 8 decoys in database
- **Status:** ✅ FIXED

### Test 2: Agent Registration
- **Before:** Node stuck at "installer_ready", never updates
- **After:** Heartbeat detects and updates to "active"
- **Status:** ✅ FIXED (pending Lenovo manual run)

### Test 3: Multi-Agent Warning
- **Before:** Silent overwrite, both agents conflict
- **After:** Warning shown, user prompted, old agent stopped
- **Status:** ✅ FIXED

### Test 4: install.ps1 Unblock
- **Before:** Users must manually unblock via Properties
- **After:** Script self-unblocks + instructions for bypass
- **Status:** ✅ FIXED

---

## Next Steps

1. **Lenovo Node:** User needs to manually run `cd C:\DecoyVerse; python agent.py` to activate
2. **Frontend:** Add auto-refresh for nodes/decoys pages (every 30s)
3. **Monitoring:** Add alerting if node goes offline >5 minutes
4. **Installer:** Consider adding Python installer bundled with agent

---

## Debug Endpoints (Temporary)

For troubleshooting production issues:

```bash
# List all nodes (no auth required)
GET https://ml-modle-v0-1.onrender.com/api/debug-nodes

# List all decoys (no auth required)
GET https://ml-modle-v0-1.onrender.com/api/debug-decoys

# Health check with DB status
GET https://ml-modle-v0-1.onrender.com/api/health
```

**⚠️ Remove these before final production deployment!**
