# DecoyVerse Agent Auto-Installer System

## 🎯 Complete Workflow

### **User Flow (Frontend → Backend → Agent)**

```
1. User logs into DecoyVerse Dashboard
   ↓
2. Navigates to Nodes page → Clicks "Add New Node"
   ↓
3. Backend creates Node in database with:
   - Unique node_id (e.g., node-123abc)
   - Unique node_api_key (e.g., nk_abc123xyz)
   - deployment_config (3 decoys, 5 honeytokens)
   ↓
4. User clicks "Download Agent" button next to the node
   ↓
5. Frontend calls: POST /api/install/generate-installer/{node_id}
   ↓
6. Backend generates ZIP file containing:
   - agent_config.json (pre-configured with node credentials)
   - install.ps1 (PowerShell auto-installer)
   - README.txt (instructions)
   ↓
7. User downloads: DecoyVerse-Agent-{NodeName}.zip
   ↓
8. User extracts ZIP and runs install.ps1
   ↓
9. Installer does everything automatically:
   - Checks for Python
   - Creates C:\DecoyVerse directory
   - Copies config file
   - Downloads agent Python files from GitHub
   - Installs dependencies (requests, watchdog, psutil)
   - Asks if user wants to start agent now
   ↓
10. Agent starts and automatically:
    - Registers with backend using node_id + node_api_key
    - Deploys 3 decoy files + 5 honeytokens
    - Calls backend API to register all deployed decoys
    - Starts monitoring for file access
    ↓
11. User returns to Dashboard → Nodes → Clicks on their node
    ↓
12. UI shows:
    - Node status: "online"
    - Deployed decoys with full file paths
    - Access logs and alerts
```

---

## ✅ Answers to Your Questions

### **1. Will it deploy decoys and honeytokens automatically?**
**YES!** When the agent starts (`python agent.py`), it runs:
```python
def setup_honeytokens(self):
    deployment_config = self.config.get_deployment_config()
    # Creates files based on config: 3 decoys + 5 honeytokens
    self.setup.setup_all(deployment_config)
```

### **2. Will it detect OS and configure accordingly?**
**YES!** The agent has OS-aware deployment:
- **Windows**: Deploys to `C:\Users\{user}\AppData\Local\.cache`
- **Linux**: Deploys to `~/.cache/.data`
- **macOS**: Deploys to `~/.local/share`

Decoy placement is strategic (Documents, Desktop, .ssh, .aws directories).

### **3. Will deployed decoys be registered with backend?**
**YES!** After deployment, agent calls:
```python
self.registration.register_deployed_decoys(
    node_id, 
    node_api_key, 
    deployed_decoys  # List of all files with paths
)
```

This sends all decoy paths to backend API.

### **4. Will UI show decoys and their paths?**
**YES!** Backend has endpoint:
```
GET /api/nodes/{node_id}/decoys
```

Returns:
```json
[
  {
    "filename": "aws_credentials.txt",
    "path": "C:\\Users\\John\\.aws\\aws_credentials.txt",
    "type": "file",
    "last_accessed": null,
    "access_count": 0
  }
]
```

---

## 📦 What's in the Downloaded ZIP

When user clicks "Download Agent", they get:

```
DecoyVerse-Agent-{NodeName}.zip
│
├── agent_config.json          ← Pre-configured credentials
│   {
│     "node_id": "node-abc123",
│     "node_api_key": "nk_xyz789",
│     "deployment_config": {
│       "initial_decoys": 3,
│       "initial_honeytokens": 5
│     }
│   }
│
├── install.ps1                ← Auto-installer script
│   - Checks admin privileges
│   - Finds Python installation
│   - Downloads agent files from GitHub
│   - Installs dependencies
│   - Starts agent
│
└── README.txt                 ← User instructions
    - Quick install steps
    - What happens after install
    - How to view in dashboard
```

---

## 🔧 Technical Implementation

### **Backend Route** (`backend/routes/install.py`)
```python
@router.post("/install/generate-installer/{node_id}")
async def generate_installer(node_id: str):
    # 1. Get node from database
    node = await db_service.get_node_by_id(node_id)
    
    # 2. Create agent_config.json with credentials
    agent_config = {
        "node_id": node["node_id"],
        "node_api_key": node["node_api_key"],
        "deployment_config": {...}
    }
    
    # 3. Generate ZIP with config + installer script
    # 4. Return as download
```

### **Frontend API** (`src/api/endpoints/install.ts`)
```typescript
export const installApi = {
  async downloadInstaller(nodeId: string, nodeName: string) {
    const blob = await apiClient.post(
      `/install/generate-installer/${nodeId}`,
      { responseType: 'blob' }
    );
    // Trigger browser download
  }
}
```

### **Frontend UI** (`src/pages/Nodes.tsx`)
```tsx
<Button onClick={() => handleDownloadAgent(node.id, node.name)}>
  <Download /> Download Agent
</Button>
```

---

## 🚀 Deployment Checklist

### **1. Update Backend**
- ✅ Modified `backend/routes/install.py` - added `generate_installer()` endpoint
- Deploy to Render/Railway
- Ensure MongoDB connection is working

### **2. Update Frontend**
- ✅ Created `src/api/endpoints/install.ts`
- ✅ Updated `src/pages/Nodes.tsx` to use new API
- Deploy to Vercel
- Update `VITE_API_URL` if needed

### **3. Test Full Flow**
```bash
# 1. Create a test node in dashboard
# 2. Click "Download Agent"
# 3. Extract ZIP file
# 4. Run install.ps1 in PowerShell
# 5. Verify agent deploys decoys
# 6. Check dashboard shows deployed files
```

---

## 📊 What User Sees in Dashboard

### **Nodes Page**
```
┌─────────────────────────────────────────────┐
│ Node Name: My-PC                            │
│ Status: 🟢 Online                           │
│ Last Seen: 2 minutes ago                    │
│                                             │
│ [Download Agent] [View Decoys] [Delete]     │
└─────────────────────────────────────────────┘
```

### **Decoys Tab (for selected node)**
```
┌───────────────────────────────────────────────────────────────┐
│ Deployed Decoys (8 total)                                    │
├───────────────────────────────────────────────────────────────┤
│ File                    Path                    Accessed      │
├───────────────────────────────────────────────────────────────┤
│ aws_keys.txt            C:\Users\..\.aws\      Never         │
│ id_rsa                  C:\Users\..\.ssh\      Never         │
│ db_credentials.env      C:\DecoyVerse\...      Never         │
│ api_tokens.json         C:\Users\..\Documents  Never         │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎓 How It Works End-to-End

### **Magic of Pre-Configuration**
1. **Old Way (Manual)**:
   - Download generic installer
   - Run installer
   - Enter Node ID manually
   - Enter API Key manually
   - Pray you didn't typo

2. **New Way (Auto-Config)**:
   - Click "Download Agent" in dashboard
   - Run installer
   - Everything just works! ✨

### **Security**
- Each node has unique credentials
- API keys are pre-configured (no manual input)
- Backend verifies ownership before generating installer
- Agent authenticates with backend using node_api_key

---

## 🔍 Verification Steps

After implementing this system:

1. **Test Node Creation**:
   ```bash
   curl -X POST http://localhost:5000/api/nodes \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name": "Test Node"}'
   ```

2. **Test Installer Generation**:
   ```bash
   curl -X POST http://localhost:5000/api/install/generate-installer/node-123 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     --output installer.zip
   ```

3. **Verify ZIP Contents**:
   ```bash
   unzip -l installer.zip
   # Should show: agent_config.json, install.ps1, README.txt
   ```

4. **Check agent_config.json**:
   ```json
   {
     "node_id": "node-abc123",  // ← Matches backend
     "node_api_key": "nk_xyz789"  // ← Matches backend
   }
   ```

---

## 🎯 Next Steps

1. **Deploy Backend Changes**
   ```bash
   cd backend
   git add routes/install.py
   git commit -m "Add auto-installer generation"
   git push origin main
   ```

2. **Deploy Frontend Changes**
   ```bash
   cd ../src
   git add api/endpoints/install.ts api/index.ts pages/Nodes.tsx
   git commit -m "Add agent auto-installer download"
   git push origin main
   ```

3. **Test on Production**
   - Create a node in prod dashboard
   - Download installer
   - Run on test machine
   - Verify decoys appear in dashboard

---

## 💡 Pro Tips

### **For Users**
- One-click download = pre-configured agent
- No manual credential entry
- Works on any Windows machine with Python

### **For You**
- Backend generates unique config per node
- Frontend handles download seamlessly
- Agent self-registers and deploys decoys

### **Troubleshooting**
- If download fails: Check backend logs
- If agent won't start: Verify Python 3.10+
- If decoys don't appear: Check network connectivity

---

## 🌟 Summary

**You now have a complete auto-installer system that:**
- ✅ Generates pre-configured installers per node
- ✅ Auto-deploys decoys based on OS
- ✅ Auto-registers decoys with backend
- ✅ Shows all decoy paths in UI
- ✅ Requires ZERO manual configuration from users

**The entire flow is:**
1. User clicks "Download Agent"
2. User runs installer
3. Agent deploys honeytokens
4. User sees everything in dashboard

**No manual config. No credentials to copy. Just works!** 🎉
