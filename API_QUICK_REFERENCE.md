# DecoyVerse API Integration - Quick Reference

## 🎯 Core Flow
```
User → Nodes → Agents → Events → ML → Alerts → Insights
        ↑                              ↓
        └──────────── ALL LINKED BY node_id ──────────┘
```

---

## 📡 Backend Endpoints

### Dashboard
```bash
GET /api/stats              # { total_nodes, online_nodes, alerts, risk_score }
GET /api/alerts?limit=10    # [{ id, node_id, severity, message, status, timestamp }]
GET /api/recent-attacks?limit=20  # [{ id, node_id, event_type, source_ip, risk_score }]
```

### Nodes (Agent Management)
```bash
GET  /nodes                 # List all nodes
POST /nodes                 # Create node { name }
DELETE /nodes/:id           # Delete node
GET  /agent/download/:node_id  # Download config
PATCH /nodes/:id            # Update status
```

### Alerts
```bash
GET  /api/alerts?limit=10&offset=0      # List alerts
PATCH /api/alerts/:id { status }        # Update status
```

### Decoys
```bash
GET  /api/decoys                    # All decoys
GET  /nodes/:node_id/decoys         # Decoys for node
PATCH /api/decoys/:id { status }    # Toggle active/inactive
```

### Logs (Events)
```bash
GET /api/recent-attacks?limit=20&node_id=node-1  # Filter by node
```

### AI Insights
```bash
GET /api/attacker-profile/:ip       # Threat analysis for IP
```

---

## 🧠 Frontend API Modules

### Usage Examples

```typescript
// Dashboard
import { dashboardApi } from '@/api/endpoints/dashboard'
const stats = await dashboardApi.getStats()
const alerts = await dashboardApi.getAlerts(10)
const attacks = await dashboardApi.getRecentAttacks(20)

// Nodes
import { nodesApi } from '@/api/endpoints/nodes'
await nodesApi.createNode('Node-Name')
const nodes = await nodesApi.listNodes()
const blob = await nodesApi.downloadAgent(nodeId)
await nodesApi.deleteNode(nodeId)

// Alerts
import { alertsApi } from '@/api/endpoints/alerts'
const alerts = await alertsApi.getAlerts(10, 0)
await alertsApi.updateAlertStatus(alertId, 'resolved')

// Decoys
import { decoysApi } from '@/api/endpoints/decoys'
const decoys = await decoysApi.getDecoys()
const nodeDecoys = await decoysApi.getNodeDecoys(nodeId)
await decoysApi.updateDecoyStatus(decoyId, 'active')

// Logs
import { logsApi } from '@/api/endpoints/logs'
const events = await logsApi.getRecentEvents(20, nodeId)

// AI Insights
import { aiInsightsApi } from '@/api/endpoints/ai-insights'
const profile = await aiInsightsApi.getAttackerProfile('192.168.1.45')
```

---

## 📊 Data Models

### Alert
```typescript
{
  id: string
  node_id: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  created_at: string  // ISO timestamp
  status: 'open' | 'investigating' | 'resolved'
}
```

### Decoy
```typescript
{
  id: string
  node_id: string
  name: string
  type: 'service' | 'file' | 'honeytoken' | 'configuration' | 'port'
  status: 'active' | 'inactive'
  triggers: number
  last_triggered?: string  // ISO timestamp
  port?: number
  format?: string
}
```

### Event
```typescript
{
  id: string
  node_id: string
  timestamp: string  // ISO
  event_type: string
  source_ip: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  decoy_name: string
  risk_score: number  // 0-100
}
```

### AttackerProfile
```typescript
{
  ip: string
  threat_name: string
  confidence: number  // 0-1
  ttps: string[]     // MITRE ATT&CK tags
  description: string
  activity_count: number
  last_seen?: string // ISO
}
```

### DashboardStats
```typescript
{
  total_nodes: number
  online_nodes: number
  total_alerts: number
  critical_alerts: number
  total_attacks_detected: number
  avg_risk_score: number  // 0-100
}
```

### Node
```typescript
{
  id: string
  name: string
  status: 'online' | 'offline'
  ip?: string
  os?: string
  version?: string
  lastSeen?: string  // ISO
  node_api_key?: string
  created_at?: string
}
```

---

## 🔐 Authentication

All API endpoints require JWT bearer token:
```bash
Authorization: Bearer {token}
```

Token stored in localStorage and auto-added by Axios interceptor:
```typescript
// src/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 🚀 Page Components Using APIs

| Page | Component | APIs Used |
|------|-----------|-----------|
| Dashboard | Dashboard.tsx | getStats, getAlerts, getRecentAttacks |
| Nodes | Nodes.tsx | listNodes, createNode, deleteNode, downloadAgent |
| Alerts | Alerts.tsx | getAlerts, updateAlertStatus |
| Decoys | Decoys.tsx | getDecoys, updateDecoyStatus |
| Honeytokels | Honeytokens.tsx | getDecoys (filtered) |
| Logs | Logs.tsx | getRecentEvents |
| AI Insights | AIInsights.tsx | getAttackerProfile |
| Onboarding | Onboarding.tsx | createNode, downloadAgent |

---

## 🔄 Auto-Refresh Pattern

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.getData()
      setData(response.data)
    } catch (err) {
      setError('Failed to load')
    }
  }

  fetchData()
  const interval = setInterval(fetchData, 30000) // 30 seconds
  return () => clearInterval(interval)
}, [])
```

---

## 🛠️ Common Tasks

### Add New Alert Type
1. Update `/server/src/routes/alerts.ts` mock data
2. Component will auto-display in Alerts.tsx

### Add New Decoy Type
1. Update `/server/src/routes/decoys.ts` mock data
2. Update `type` enum in `Decoy` interface

### Create Real Database Integration
1. Replace mock arrays with MongoDB queries
2. Keep same API response signatures
3. Frontend code works unchanged

### Add Real ML Integration
1. Replace `/api/attacker-profile/:ip` mock responses
2. Call ML API to get threat scores
3. Return same `AttackerProfile` shape

### Implement Real Payment
1. Add Stripe/Razorpay to Configuration page
2. Hook into `/api/subscription` endpoint
3. Update user plan on success

---

## 📝 Error Handling

All API calls use try/catch:
```typescript
try {
  const response = await apiFunction()
  setData(response.data)
} catch (err) {
  setError('Failed to load data')
}
```

Components display error cards:
```tsx
{error && (
  <Card className="bg-status-danger/10 border-status-danger/50">
    <CardContent>
      <p className="text-status-danger">{error}</p>
    </CardContent>
  </Card>
)}
```

---

## 🔍 Search & Filter Examples

### Log Search (Client-Side)
```typescript
const filtered = events.filter(e =>
  e.event_type.toLowerCase().includes(term) ||
  e.source_ip.toLowerCase().includes(term) ||
  e.decoy_name.toLowerCase().includes(term)
)
```

### Alert Status Filter
```typescript
const openAlerts = alerts.filter(a => a.status === 'open')
const investigating = alerts.filter(a => a.status === 'investigating')
const resolved = alerts.filter(a => a.status === 'resolved')
```

### Honeytoken Filter
```typescript
const tokens = decoys.filter(d => d.type === 'honeytoken')
```

---

## 📦 Import Patterns

```typescript
// Standard imports
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// API imports
import { nodesApi } from '@/api/endpoints/nodes'
import { alertsApi } from '@/api/endpoints/alerts'

// Component imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

// Type imports
import type { Node, Alert, Decoy, Event } from '@/api/endpoints/{module}'
```

---

## 🎨 UI Patterns

### Loading State
```tsx
{loading ? (
  <div className="text-center py-8 text-themed-muted">
    Loading...
  </div>
) : (
  // Content
)}
```

### Empty State
```tsx
{data.length === 0 ? (
  <div className="text-center py-8 text-themed-muted">
    No data found
  </div>
) : (
  // List
)}
```

### Error State
```tsx
{error && (
  <Card className="bg-status-danger/10">
    <CardContent>
      <p className="text-status-danger">{error}</p>
    </CardContent>
  </Card>
)}
```

---

## 🚦 Status Codes & Responses

```
200 OK         { success: true, data: {...} }
201 Created    { success: true, data: {...} }
400 Bad Request { error: "Invalid input" }
401 Unauthorized { error: "Token expired" }
404 Not Found   { error: "Resource not found" }
500 Server Error { error: "Internal error" }
```

---

## 💡 Next Steps

1. **Replace Mock Data with MongoDB**
   - Models: Alert, Decoy, Event, User, Node
   - Queries in routes instead of mock arrays

2. **Add Real ML Processing**
   - Risk score calculation from event patterns
   - Threat profiling from attack history
   - Anomaly detection

3. **Implement WebSocket**
   - Real-time alerts push
   - Live node heartbeat
   - Event streaming

4. **Add Payment Processing**
   - Stripe integration
   - Usage-based billing
   - Subscription tiers

5. **Deploy to Production**
   - Backend: Railway or Render
   - Frontend: Vercel
   - Database: MongoDB Atlas
   - ML: AWS SageMaker or custom server

---

**Status: ✅ All Frontend Pages Connected to Working Backend APIs**
