import { apiClient } from '../client';
import type { DashboardStats, Attack } from './dashboard';
import type { Node } from './nodes';
import type { SecurityReport } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttackerProfile {
    source_ip: string;
    attack_count: number;
    threat_score: number;
    mitre_tags: string[];
    last_seen?: string;
}

export interface BlockedIP {
    id: string;
    ip_address: string;
    status: 'pending' | 'active' | 'failed';
    node_id: string;
    blocked_at: string;
}

export interface AnalyticsAlert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
    created_at: string;
    attack_type?: string;
}

export interface AnalyticsData {
    stats: DashboardStats | null;
    attacks: Attack[];
    alerts: AnalyticsAlert[];
    nodes: Node[];
    decoys: any[];
    honeytokels: any[];
    attackerProfiles: AttackerProfile[];
    blockedIPs: BlockedIP[];
    report: SecurityReport | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch (_e) { return fallback; }
};

const isDemoMode = () => localStorage.getItem('isDemo') === 'true';

// ─── API ──────────────────────────────────────────────────────────────────────

export const analyticsApi = {
    async fetchAll(): Promise<AnalyticsData> {
        if (isDemoMode()) return buildDemoData();

        const [stats, attacks, rawAlerts, rawNodes, decoys, honeytokels, insightsRaw, blockedIPsRaw, reportRaw] =
            await Promise.all([
                safe(() => apiClient.get('/api/stats').then(r => r.data as DashboardStats), null),
                safe(() => apiClient.get('/api/recent-attacks', { params: { limit: 100 } }).then(r => Array.isArray(r.data) ? r.data as Attack[] : []), []),
                safe(() => apiClient.get('/api/alerts', { params: { limit: 200 } }).then(r => Array.isArray(r.data) ? r.data : []), []),
                safe(() => apiClient.get('/nodes').then(r => Array.isArray(r.data) ? r.data : []), []),
                safe(() => apiClient.get('/api/decoys').then(r => Array.isArray(r.data) ? r.data : []), []),
                safe(() => apiClient.get('/api/honeytokels').then(r => Array.isArray(r.data) ? r.data : []), []),
                safe(() => apiClient.get('/api/ai/insights').then(r => {
                    const d = r.data;
                    if (Array.isArray(d)) return d;
                    return d?.attacker_profiles ?? [];
                }), []),
                safe(() => apiClient.get('/api/blocked-ips').then(r => Array.isArray(r.data) ? r.data : []), []),
                safe(() => apiClient.get('/api/ai/report').then(r => {
                    if (r.data?.exists === false) return null;
                    return r.data?.report ?? r.data ?? null;
                }), null),
            ]);

        const alerts: AnalyticsAlert[] = rawAlerts.map((a: any) => ({
            id: a.id || a._id || '',
            severity: (a.severity as AnalyticsAlert['severity']) || 'low',
            risk_score: a.risk_score ?? 0,
            status: (a.status as AnalyticsAlert['status']) || 'open',
            created_at: a.created_at || a.timestamp || '',
            attack_type: a.alert_type || a.attack_type,
        }));

        const nodes: Node[] = rawNodes.map((n: any) => ({
            id: n.id || n.node_id || '',
            node_id: n.node_id || n.id,
            name: n.name || 'Unnamed Node',
            status: n.status || 'offline',
            ip: n.ip_address || n.ip,
            os: n.os_type || n.os,
            version: n.version,
            decoys: n.decoys || n.decoy_count || 0,
            lastSeen: n.lastSeen || n.last_seen,
        }));

        return { stats, attacks, alerts, nodes, decoys, honeytokels, attackerProfiles: insightsRaw, blockedIPs: blockedIPsRaw, report: reportRaw };
    },
};

// ─── Chart Data Builders ──────────────────────────────────────────────────────

export function buildChartData(data: AnalyticsData) {
    const { attacks, alerts, nodes, decoys, honeytokels, attackerProfiles, blockedIPs } = data;
    const now = Date.now();

    // Risk Score Timeline (last 30 events, sorted by time)
    const riskTimeline = [...attacks]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-30)
        .map(a => ({
            time: new Date(a.timestamp).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            risk_score: a.risk_score,
        }));

    // Attack Type Distribution
    const typeCounts: Record<string, number> = {};
    attacks.forEach(a => { typeCounts[a.attack_type] = (typeCounts[a.attack_type] || 0) + 1; });
    const attackTypeChart = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Alert Severity
    const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    alerts.forEach(a => { if (a.severity in sevCounts) sevCounts[a.severity as keyof typeof sevCounts]++; });
    const severityChart = [
        { name: 'Critical', value: sevCounts.critical, fill: '#ef4444' },
        { name: 'High', value: sevCounts.high, fill: '#f97316' },
        { name: 'Medium', value: sevCounts.medium, fill: '#f59e0b' },
        { name: 'Low', value: sevCounts.low, fill: '#22c55e' },
    ];

    // 24-Hour Heatmap
    const hourCounts = Array(24).fill(0);
    attacks.forEach(a => { hourCounts[new Date(a.timestamp).getHours()]++; });
    const hourlyActivityChart = hourCounts.map((count, h) => ({
        hour: `${h.toString().padStart(2, '0')}h`,
        count,
    }));

    // Alert Resolution Pipeline
    const resCounts = { open: 0, acknowledged: 0, investigating: 0, resolved: 0 };
    alerts.forEach(a => { if (a.status in resCounts) resCounts[a.status as keyof typeof resCounts]++; });
    const alertResolutionChart = [
        { name: 'Open', value: resCounts.open, fill: '#ef4444' },
        { name: 'Acknowledged', value: resCounts.acknowledged, fill: '#f59e0b' },
        { name: 'Investigating', value: resCounts.investigating, fill: '#3b82f6' },
        { name: 'Resolved', value: resCounts.resolved, fill: '#22c55e' },
    ];

    // Decoy Coverage per Node
    const nodeMap: Record<string, { active: number; inactive: number; name: string }> = {};
    nodes.forEach(n => { nodeMap[n.id] = { active: 0, inactive: 0, name: n.name }; });
    decoys.forEach((d: any) => {
        const key = d.node_id;
        if (!nodeMap[key]) nodeMap[key] = { active: 0, inactive: 0, name: key.slice(0, 12) };
        if (d.status === 'active') nodeMap[key].active++;
        else nodeMap[key].inactive++;
    });
    const decoyCoverageChart = Object.values(nodeMap).map(v => ({
        name: v.name.length > 14 ? v.name.slice(0, 14) + '…' : v.name,
        active: v.active,
        inactive: v.inactive,
    }));

    // Honeytoken Trigger Leaderboard
    const honeytokenLeaderboard = [...honeytokels]
        .map((h: any) => ({
            name: (h.name || h.file_name || 'Unknown').slice(0, 22),
            triggers: h.triggers ?? h.trigger_count ?? 0,
        }))
        .sort((a, b) => b.triggers - a.triggers)
        .slice(0, 10);

    // Top Attacking IPs
    const topAttackers = [...attackerProfiles]
        .sort((a, b) => b.attack_count - a.attack_count)
        .slice(0, 8)
        .map(p => ({ ip: p.source_ip, count: p.attack_count }));

    // MITRE ATT&CK Tag Frequency
    const mitreCounts: Record<string, number> = {};
    attackerProfiles.forEach(p => {
        (p.mitre_tags || []).forEach(tag => { mitreCounts[tag] = (mitreCounts[tag] || 0) + 1; });
    });
    const mitreTagsChart = Object.entries(mitreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([tag, count]) => ({ tag, count }));

    // Blocked IP Status
    const blkCounts = { pending: 0, active: 0, failed: 0 };
    blockedIPs.forEach((b: any) => { if (b.status in blkCounts) blkCounts[b.status as keyof typeof blkCounts]++; });
    const blockedIPChart = [
        { name: 'Active', value: blkCounts.active },
        { name: 'Pending', value: blkCounts.pending },
        { name: 'Failed', value: blkCounts.failed },
    ];

    // Risk Score Histogram (buckets 1–10)
    const riskBuckets = Array(10).fill(0);
    alerts.forEach(a => {
        const bucket = Math.min(Math.max(Math.floor(a.risk_score) - 1, 0), 9);
        riskBuckets[bucket]++;
    });
    const riskHistogram = riskBuckets.map((count, i) => ({ range: `${i + 1}`, count }));

    // Attack Activity (14 days, two series: all detections + high-risk only)
    const actDayMap: Record<string, { total: number; highRisk: number }> = {};
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86_400_000);
        actDayMap[d.toLocaleDateString('en', { month: 'short', day: 'numeric' })] = { total: 0, highRisk: 0 };
    }
    attacks.forEach(a => {
        const key = new Date(a.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        if (key in actDayMap) {
            actDayMap[key].total++;
            if (a.risk_score >= 7) actDayMap[key].highRisk++;
        }
    });
    const attackActivityChart = Object.entries(actDayMap).map(([date, v]) => ({ date, ...v }));

    // Detection Rate Over Time (last 14 days, alerts with risk >= 7)
    const dayMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86_400_000);
        dayMap[d.toLocaleDateString('en', { month: 'short', day: 'numeric' })] = 0;
    }
    alerts.filter(a => a.risk_score >= 7).forEach(a => {
        const key = new Date(a.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' });
        if (key in dayMap) dayMap[key]++;
    });
    const detectionRateChart = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    // Severity vs Risk Scatter
    const sevNum = { low: 1, medium: 2, high: 3, critical: 4 } as const;
    const scatterData = alerts
        .filter(a => a.risk_score > 0)
        .map(a => ({ risk_score: a.risk_score, severity_num: sevNum[a.severity] || 1, severity: a.severity }));

    return {
        attackActivityChart,
        attackTypeChart, alertResolutionChart, honeytokenLeaderboard,
        // kept for potential future use
        riskTimeline, severityChart, hourlyActivityChart,
        decoyCoverageChart, topAttackers, mitreTagsChart, blockedIPChart,
        riskHistogram, detectionRateChart, scatterData,
    };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

function ago(ms: number) { return new Date(Date.now() - ms).toISOString(); }

function buildDemoData(): AnalyticsData {
    const attackTypes = ['Brute Force', 'SQL Injection', 'Data Exfiltration', 'Reconnaissance', 'Credential Access'];
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['open', 'acknowledged', 'investigating', 'resolved'] as const;

    const attacks: Attack[] = Array.from({ length: 48 }, (_, i) => ({
        id: `atk-${i}`,
        node_id: `node-${['web-01', 'db-01', 'api-02', 'kube-master', 'win-01'][i % 5]}`,
        attack_type: attackTypes[i % attackTypes.length],
        source_ip: ['192.168.1.45', '10.0.0.12', '172.16.0.8', '10.0.1.50', '203.0.113.12'][i % 5],
        // Spread attacks evenly across 14 days (~7 hours apart) with jitter
        timestamp: ago(i * 25_200_000 + Math.floor(Math.random() * 7_200_000)),
        risk_score: Math.round((3 + (i % 7) + Math.random() * 2) * 10) / 10,
    }));

    const alerts: AnalyticsAlert[] = Array.from({ length: 35 }, (_, i) => {
        const rs = Math.round((2 + (i % 8) + Math.random()) * 10) / 10;
        return {
            id: `alert-${i}`,
            severity: rs >= 8 ? 'critical' : rs >= 6 ? 'high' : rs >= 4 ? 'medium' : 'low',
            risk_score: rs,
            status: statuses[i % 4],
            created_at: ago(i * 4_200_000 + Math.random() * 2_000_000),
            attack_type: attackTypes[i % attackTypes.length],
        };
    });
    // Ensure severity matches requested variety
    alerts[0].severity = 'critical'; alerts[0].risk_score = 9.2;
    alerts[1].severity = 'critical'; alerts[1].risk_score = 8.7;
    alerts[2].severity = 'high';     alerts[2].risk_score = 7.5;

    const nodes = [
        { id: 'node-web-01', node_id: 'node-web-01', name: 'Web Server Alpha', status: 'active' as const, ip: '192.168.1.100', os: 'linux', version: '1.2.4', decoys: 15, lastSeen: ago(30_000) },
        { id: 'node-db-01', node_id: 'node-db-01', name: 'Primary Database', status: 'active' as const, ip: '10.0.0.10', os: 'linux', version: '1.2.4', decoys: 5, lastSeen: ago(60_000) },
        { id: 'node-api-02', node_id: 'node-api-02', name: 'API Gateway', status: 'active' as const, ip: '172.16.0.5', os: 'linux', version: '1.2.4', decoys: 8, lastSeen: ago(45_000) },
        { id: 'node-kube-master', node_id: 'node-kube-master', name: 'K8s Control Plane', status: 'offline' as const, ip: '10.0.1.1', os: 'linux', version: '1.2.3', decoys: 20, lastSeen: ago(7_200_000) },
        { id: 'node-win-01', node_id: 'node-win-01', name: 'Admin Workstation', status: 'active' as const, ip: '192.168.1.50', os: 'windows', version: '1.2.4', decoys: 12, lastSeen: ago(10_000) },
    ];

    const decoys = Array.from({ length: 18 }, (_, i) => ({
        id: `decoy-${i}`,
        node_id: nodes[i % 5].id,
        name: i % 3 === 0 ? `aws_keys_${i}.csv` : `backup_${i}.zip`,
        type: i % 3 === 0 ? 'honeytoken' : 'file',
        status: i % 7 === 0 ? 'inactive' : 'active',
        triggers: Math.floor(Math.random() * 8),
    }));

    const honeytokels = [
        { id: 'ht-1', name: 'aws_credentials.csv', file_name: 'aws_credentials.csv', node_id: 'node-web-01', triggers: 12, status: 'active' },
        { id: 'ht-2', name: 'db_backup_keys.txt', file_name: 'db_backup_keys.txt', node_id: 'node-db-01', triggers: 8, status: 'active' },
        { id: 'ht-3', name: 'kubeconfig.yaml', file_name: 'kubeconfig.yaml', node_id: 'node-kube-master', triggers: 5, status: 'active' },
        { id: 'ht-4', name: 'admin_ssh_key.pem', file_name: 'admin_ssh_key.pem', node_id: 'node-win-01', triggers: 3, status: 'active' },
        { id: 'ht-5', name: 'prod_env_secrets', file_name: 'prod_env_secrets', node_id: 'node-api-02', triggers: 1, status: 'active' },
    ];

    const attackerProfiles: AttackerProfile[] = [
        { source_ip: '172.16.0.8', attack_count: 23, threat_score: 9.1, mitre_tags: ['T1048', 'T1041', 'T1078', 'T1566'], last_seen: ago(3_600_000) },
        { source_ip: '192.168.1.45', attack_count: 15, threat_score: 8.5, mitre_tags: ['T1078', 'T1110', 'T1021'], last_seen: ago(7_200_000) },
        { source_ip: '10.0.0.12', attack_count: 8, threat_score: 7.2, mitre_tags: ['T1566', 'T1059', 'T1055'], last_seen: ago(14_400_000) },
        { source_ip: '10.0.1.50', attack_count: 5, threat_score: 6.8, mitre_tags: ['T1555', 'T1078'], last_seen: ago(28_800_000) },
        { source_ip: '203.0.113.12', attack_count: 3, threat_score: 5.4, mitre_tags: ['T1190', 'T1133'], last_seen: ago(86_400_000) },
    ];

    const blockedIPs: BlockedIP[] = [
        { id: 'blk-1', ip_address: '172.16.0.8', status: 'active', node_id: 'node-api-02', blocked_at: ago(1_800_000) },
        { id: 'blk-2', ip_address: '192.168.1.45', status: 'active', node_id: 'node-web-01', blocked_at: ago(3_600_000) },
        { id: 'blk-3', ip_address: '10.0.0.12', status: 'pending', node_id: 'node-db-01', blocked_at: ago(900_000) },
        { id: 'blk-4', ip_address: '10.0.1.50', status: 'failed', node_id: 'node-kube-master', blocked_at: ago(7_200_000) },
    ];

    const report: SecurityReport = {
        user_id: 'demo',
        generated_at: ago(3_600_000),
        health_score: 6.8,
        total_nodes: 5,
        online_nodes: 4,
        total_alerts: alerts.length,
        open_alerts: alerts.filter(a => a.status === 'open').length,
        critical_alerts: alerts.filter(a => a.severity === 'critical').length,
        top_attack_types: [
            { type: 'Brute Force', count: 14 },
            { type: 'SQL Injection', count: 11 },
            { type: 'Data Exfiltration', count: 8 },
            { type: 'Reconnaissance', count: 7 },
        ],
        top_attackers: attackerProfiles.map(p => ({
            ip: p.source_ip,
            risk_score: p.threat_score,
            attack_count: p.attack_count,
            most_common_attack: 'Brute Force',
        })),
        recent_events_count: attacks.length,
        recommendations: [
            'Enable 2FA on all admin accounts',
            'Review firewall rules for node-kube-master',
            'Rotate AWS credentials immediately',
        ],
    };

    const stats: DashboardStats = {
        total_nodes: 5, active_nodes: 4, total_attacks: attacks.length,
        active_alerts: alerts.filter(a => a.status === 'open').length,
        high_risk_count: alerts.filter(a => a.severity === 'critical').length,
        avg_risk_score: Math.round(alerts.reduce((s, a) => s + a.risk_score, 0) / alerts.length * 10) / 10,
    };

    return { stats, attacks, alerts, nodes, decoys, honeytokels, attackerProfiles, blockedIPs, report };
}
