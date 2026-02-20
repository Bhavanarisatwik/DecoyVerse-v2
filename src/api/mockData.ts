import type { DashboardStats, Alert, Attack } from './endpoints/dashboard';
import type { Node } from './endpoints/nodes';

export const generateMockStats = (): DashboardStats => ({
    total_nodes: 12,
    active_nodes: 12,
    total_attacks: 843,
    active_alerts: 4,
    high_risk_count: 2,
    avg_risk_score: 76.5,
    recent_risk_average: 82.1,
});

export const generateMockAlerts = (): Alert[] => [
    {
        id: 'alert-1',
        node_id: 'node-web-01',
        alert_type: 'Unauthorized Access',
        severity: 'critical',
        message: 'Multiple failed SSH login attempts detected on port 22.',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'new',
    },
    {
        id: 'alert-2',
        node_id: 'node-db-01',
        alert_type: 'SQL Injection Attempt',
        severity: 'high',
        message: 'Suspicious payload detected in Honeytoken credentials payload.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'new',
    },
    {
        id: 'alert-3',
        node_id: 'node-api-02',
        alert_type: 'Data Exfiltration',
        severity: 'high',
        message: 'Large outward data transfer initiated to unknown IP.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'acknowledged',
    },
    {
        id: 'alert-4',
        node_id: 'node-kube-master',
        alert_type: 'Decoy Triggered',
        severity: 'critical',
        message: 'Decoy file "kubeconfig.yaml" was accessed.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        status: 'new',
    }
];

export const generateMockAttacks = (): Attack[] => [
    {
        id: 'atk-1',
        node_id: 'node-web-01',
        attack_type: 'Brute Force',
        source_ip: '192.168.1.45',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        risk_score: 85,
    },
    {
        id: 'atk-2',
        node_id: 'node-db-01',
        attack_type: 'SQL Injection',
        source_ip: '10.0.0.12',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        risk_score: 92,
    },
    {
        id: 'atk-3',
        node_id: 'node-api-02',
        attack_type: 'Data Exfil',
        source_ip: '172.16.0.8',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        risk_score: 88,
    },
    {
        id: 'atk-4',
        node_id: 'node-kube-master',
        attack_type: 'Credential Access',
        source_ip: '10.0.1.50',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        risk_score: 98,
    }
];

export const generateMockNodes = (): Node[] => [
    {
        id: 'node-web-01',
        node_id: 'node-web-01',
        name: 'Web Server Alpha',
        status: 'active',
        ip: '192.168.1.100',
        os: 'linux',
        version: '1.2.4',
        decoys: 15,
        lastSeen: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
        id: 'node-db-01',
        node_id: 'node-db-01',
        name: 'Primary Database',
        status: 'active',
        ip: '10.0.0.10',
        os: 'linux',
        version: '1.2.4',
        decoys: 5,
        lastSeen: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    },
    {
        id: 'node-api-02',
        node_id: 'node-api-02',
        name: 'API Gateway',
        status: 'active',
        ip: '172.16.0.5',
        os: 'linux',
        version: '1.2.4',
        decoys: 8,
        lastSeen: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
    {
        id: 'node-kube-master',
        node_id: 'node-kube-master',
        name: 'K8s Control Plane',
        status: 'active',
        ip: '10.0.1.1',
        os: 'linux',
        version: '1.2.4',
        decoys: 20,
        lastSeen: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    },
    {
        id: 'node-win-01',
        node_id: 'node-win-01',
        name: 'Admin Workstation',
        status: 'active',
        ip: '192.168.1.50',
        os: 'windows',
        version: '1.2.4',
        decoys: 12,
        lastSeen: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    }
];

export const generateMockDecoys = () => {
    return Array.from({ length: 15 }).map((_, i) => ({
        id: `ht-decoy-${i}`,
        type: i % 3 === 0 ? 'honeytoken' : 'file',
        file_name: i % 3 === 0 ? `aws_keys_${i}.csv` : `backup_2025_0${i % 9 + 1}.zip`,
        file_path: i % 3 === 0 ? `C:\\Users\\Admin\\.aws\\credentials` : `/var/www/html/backup.zip`,
        deploy_location: i % 3 === 0 ? `C:\\Users\\Admin\\.aws\\credentials` : `/var/www/html/backup.zip`,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * i).toISOString(),
        last_accessed: i < 3 ? new Date(Date.now() - 1000 * 60 * 60 * i).toISOString() : null,
        status: 'active',
        node_id: i % 2 === 0 ? 'node-web-01' : 'node-db-01',
        trigger_count: i < 3 ? i + 1 : 0
    }));
};
