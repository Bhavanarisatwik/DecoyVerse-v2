import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldAlert, Activity, Server, AlertTriangle, Fingerprint } from "lucide-react"

export interface Alert {
    _id: string
    alert_id: string
    timestamp: string
    source_ip: string
    service: string
    attack_type: string
    risk_score: number
    confidence: number
    activity: string
    payload: string
    status: string
    node_id: string
}

interface ThreatModalProps {
    isOpen: boolean
    onClose: () => void
    alert: Alert | null
}

export function ThreatModal({ isOpen, onClose, alert }: ThreatModalProps) {
    if (!alert) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4"
                    >
                        <div className="rounded-2xl border border-status-danger/30 bg-gradient-to-br from-gray-900 via-gray-900 to-black shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-800 bg-status-danger/10 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-status-danger/20 p-2 text-status-danger">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Critical Threat Detected</h2>
                                        <p className="text-sm text-gray-400">ID: {alert.alert_id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Activity className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Attack Type</span>
                                        </div>
                                        <p className="font-semibold text-white capitalize">{alert.attack_type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="rounded-xl border border-status-danger/30 bg-status-danger/10 p-4">
                                        <div className="flex items-center gap-2 text-status-danger mb-1">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Risk Score</span>
                                        </div>
                                        <p className="font-bold text-status-danger text-lg">{alert.risk_score} / 10</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Fingerprint className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Confidence</span>
                                        </div>
                                        <p className="font-semibold text-white">{(alert.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Server className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                                        </div>
                                        <div className="inline-flex items-center rounded-full bg-status-danger/20 px-2 py-0.5 text-xs font-medium text-status-danger">
                                            {alert.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Threat Intelligence Details */}
                                <div className="rounded-xl border border-gray-800 bg-black/50 p-5 space-y-4">
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">Intelligence Payload</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Source IP Address</p>
                                            <p className="text-sm font-mono text-white bg-gray-900 inline-block px-2 py-1 rounded border border-gray-800">{alert.source_ip}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Target Node ID</p>
                                            <p className="text-sm font-mono text-white">{alert.node_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Target Service</p>
                                            <p className="text-sm text-white capitalize">{alert.service}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Action Detected</p>
                                            <p className="text-sm text-white">{alert.activity}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                                            <p className="text-sm text-white">{new Date(alert.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Raw Payload Fragment */}
                                {alert.payload && (
                                    <div className="rounded-xl border border-gray-800 bg-black/50 overflow-hidden">
                                        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-400">Target Asset / Payload Fragment</span>
                                            <div className="flex gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                                                <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                                                <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <code className="text-sm font-mono text-accent whitespace-pre-wrap word-break">
                                                {alert.payload}
                                            </code>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Actions */}
                            <div className="border-t border-gray-800 bg-black/40 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-status-danger text-white hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                >
                                    Block Source IP
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
