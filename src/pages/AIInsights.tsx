import { useState, useEffect, useRef, useCallback } from "react"
import {
    Sparkles, Brain, RefreshCw, Download, ShieldCheck,
    Send, Bot, Eye, EyeOff, Save, AlertCircle,
    Activity, Server, Shield, Zap, User as UserIcon,
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/common/Tabs"
import { securityReportApi } from "../api/endpoints/ai-insights"
import { authApi } from "../api/endpoints/auth"
import { useAuth } from "../context/AuthContext"
import type { SecurityReport, ChatMessage } from "../api/types"
import { cn } from "../utils/cn"
import ReactMarkdown from 'react-markdown'
import { toast } from "sonner"

// ─── LLM Provider config ──────────────────────────────────────────────────────

const LLM_PROVIDERS = [
    { id: 'openai',      label: 'OpenAI',      placeholder: 'gpt-4o-mini' },
    { id: 'openrouter',  label: 'OpenRouter',  placeholder: 'openai/gpt-4o-mini' },
    { id: 'gemini',      label: 'Gemini',      placeholder: 'gemini-1.5-flash' },
] as const;

type ProviderID = typeof LLM_PROVIDERS[number]['id'];

// ─── Health Score Ring (pure SVG) ────────────────────────────────────────────

function HealthScoreRing({ score }: { score: number }) {
    const r = 48;
    const size = 128;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - score / 10);

    const color =
        score >= 7 ? '#22c55e'
        : score >= 4 ? '#f59e0b'
        : '#ef4444';

    const label =
        score >= 7 ? 'Healthy'
        : score >= 4 ? 'Moderate'
        : 'Critical';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke="#374151"
                        strokeWidth="10"
                    />
                    <circle
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                    <span className="text-3xl font-bold font-heading leading-none" style={{ color }}>
                        {score.toFixed(1)}
                    </span>
                    <span className="text-xs text-themed-muted mt-0.5">/ 10</span>
                </div>
            </div>
            <span className="text-sm font-medium" style={{ color }}>{label}</span>
        </div>
    );
}

// ─── Typing dots animation ────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex gap-1 items-center px-4 py-3">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIInsights() {
    const { user, updateUser } = useAuth();

    // Report state
    const [report, setReport]           = useState<SecurityReport | null>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [generating, setGenerating]   = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

    // AI Advisor state
    const WELCOME_MESSAGE: ChatMessage = {
        role: 'assistant',
        content: `Hello! I'm **DecoyVerse AI Advisor** — your on-call security analyst.\n\nI can help you:\n- **Analyze** your current security posture and health score\n- **Triage** open alerts and prioritize responses\n- **Recommend** decoy placements and hardening steps\n- **Explain** attack patterns detected in your environment\n\n> Tip: Generate a **Security Report** first for context-aware answers tailored to your live data.`,
    };
    const [messages, setMessages]       = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [input, setInput]             = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Per-session AI config (pre-filled from user.aiSettings, overridable inline)
    const [aiProvider, setAiProvider]   = useState<ProviderID>((user?.aiSettings?.provider as ProviderID) || 'openai');
    const [aiModel, setAiModel]         = useState(user?.aiSettings?.model || '');
    const [aiApiKey, setAiApiKey]       = useState(user?.aiSettings?.apiKey || '');
    const [showKey, setShowKey]         = useState(false);
    const [savingDefaults, setSavingDefaults] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // ── Load last report on mount ─────────────────────────────────────────────
    useEffect(() => {
        let alive = true;
        securityReportApi.getReport()
            .then(res => { if (alive) { setReport(res.report); setReportLoading(false); } })
            .catch(() => { if (alive) setReportLoading(false); });
        return () => { alive = false; };
    }, []);

    // ── Sync AI settings when user refreshes ─────────────────────────────────
    useEffect(() => {
        if (user?.aiSettings) {
            setAiProvider((user.aiSettings.provider as ProviderID) || 'openai');
            setAiModel(user.aiSettings.model || '');
            setAiApiKey(user.aiSettings.apiKey || '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.aiSettings?.provider, user?.aiSettings?.model, user?.aiSettings?.apiKey]);

    // ── Auto-scroll chat ──────────────────────────────────────────────────────
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    // ── Generate report ───────────────────────────────────────────────────────
    const handleGenerateReport = async () => {
        try {
            setGenerating(true);
            setReportError(null);
            const newReport = await securityReportApi.generateReport();
            setReport(newReport);
            toast.success('Security report generated')
        } catch {
            toast.error('Failed to generate report — ensure analytics backend is running')
            setReportError('Failed to generate report. Make sure the analytics backend is running.');
        } finally {
            setGenerating(false);
        }
    };

    // ── Download JSON ─────────────────────────────────────────────────────────
    const handleDownload = () => {
        if (!report) return;
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${report.generated_at.slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Save AI defaults to profile ───────────────────────────────────────────
    const handleSaveDefaults = async () => {
        if (!user) return;
        setSavingDefaults(true);
        try {
            const res = await authApi.updateProfile({
                id: user.id,
                aiSettings: { provider: aiProvider, model: aiModel, apiKey: aiApiKey },
            });
            if (res.data) {
                updateUser(res.data);
                toast.success('AI settings saved as default')
            }
        } catch {
            toast.error('Failed to save AI settings')
        } finally {
            setSavingDefaults(false);
        }
    };

    // ── Build system prompt from live report data ─────────────────────────────
    const buildSystemPrompt = useCallback((): string => {
        const ts = report?.generated_at
            ? new Date(report.generated_at).toLocaleString()
            : 'unavailable';
        const topTypes = report?.top_attack_types.slice(0, 5)
            .map(t => `${t.type} (${t.count})`).join(', ') || 'N/A';
        const topAttackers = report?.top_attackers.slice(0, 3)
            .map(a => `${a.ip} (${a.attack_count} attacks)`).join(', ') || 'N/A';

        return `You are DecoyVerse AI, a senior cybersecurity expert specialising in deception-based threat detection (honeypots, honeytokens, and decoy files).

CURRENT SECURITY CONTEXT (as of ${ts}):
- Health Score: ${report?.health_score?.toFixed(1) ?? 'N/A'}/10
- Nodes: ${report?.online_nodes ?? 'N/A'} online of ${report?.total_nodes ?? 'N/A'} total
- Alerts: ${report?.total_alerts ?? 'N/A'} total | ${report?.open_alerts ?? 'N/A'} open | ${report?.critical_alerts ?? 'N/A'} critical
- Top Attack Types: ${topTypes}
- Recent Events (24h): ${report?.recent_events_count ?? 'N/A'}
- Top Attackers: ${topAttackers}
- Recommendations: ${report?.recommendations?.join(' | ') ?? 'N/A'}

Respond concisely and actionably. Prioritise threats visible in the context above. Suggest specific DecoyVerse actions (deploy decoys, create honeytokens, block IPs) where relevant.`;
    }, [report]);

    // ── Send chat message ─────────────────────────────────────────────────────
    const handleSendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || chatLoading) return;

        if (!aiApiKey) {
            setMessages(prev => [...prev,
                { role: 'user', content: trimmed },
                { role: 'assistant', content: 'Please enter your API key in the configuration bar above to start chatting.' },
            ]);
            setInput('');
            return;
        }

        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        const newMessages: ChatMessage[] = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setChatLoading(true);

        const systemPrompt = buildSystemPrompt();

        try {
            let assistantContent = '';

            if (aiProvider === 'gemini') {
                // Google Gemini REST format
                const modelId = aiModel || 'gemini-1.5-flash';
                const geminiHistory = newMessages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }],
                }));

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${aiApiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: systemPrompt }] },
                            contents: geminiHistory,
                        }),
                    }
                );
                const data = await res.json();
                assistantContent =
                    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                    data?.error?.message ||
                    'No response from Gemini.';

            } else {
                // OpenAI-compatible (OpenAI or OpenRouter)
                const baseUrl = aiProvider === 'openrouter'
                    ? 'https://openrouter.ai/api/v1'
                    : 'https://api.openai.com/v1';
                const modelId = aiModel || (aiProvider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiApiKey}`,
                };
                if (aiProvider === 'openrouter') {
                    headers['HTTP-Referer'] = window.location.origin;
                    headers['X-Title'] = 'DecoyVerse AI Advisor';
                }

                const res = await fetch(`${baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model: modelId,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            ...newMessages.map(m => ({ role: m.role, content: m.content })),
                        ],
                    }),
                });
                const data = await res.json();
                assistantContent =
                    data?.choices?.[0]?.message?.content ||
                    data?.error?.message ||
                    'No response.';
            }

            setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Network error. Check your API key and try again.';
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    const providerPlaceholder = LLM_PROVIDERS.find(p => p.id === aiProvider)?.placeholder ?? 'model name';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold text-themed-primary font-heading flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-accent" />
                    AI Insights
                </h1>
                <p className="text-themed-muted mt-1">Security health reports and AI-powered threat advisor.</p>
            </div>

            <Tabs defaultValue="report">
                <TabsList className="mb-4">
                    <TabsTrigger value="report">
                        <ShieldCheck className="h-4 w-4 mr-1.5" />
                        Security Report
                    </TabsTrigger>
                    <TabsTrigger value="advisor">
                        <Brain className="h-4 w-4 mr-1.5" />
                        AI Advisor
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab 1: Security Report ─────────────────────────────────── */}
                <TabsContent value="report" className="space-y-6">

                    {/* Action bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", generating && "animate-spin")} />
                            {generating ? 'Generating…' : 'Generate Report'}
                        </Button>
                        {report && (
                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                className="border-gray-600 text-themed-muted hover:bg-gray-700 rounded-xl"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download JSON
                            </Button>
                        )}
                    </div>

                    {/* Error banner */}
                    {reportError && (
                        <Card className="border-status-danger/40 bg-status-danger/5">
                            <CardContent className="pt-4 pb-4 flex items-center gap-2 text-status-danger text-sm">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {reportError}
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading skeleton */}
                    {reportLoading ? (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center text-themed-muted">
                                Loading last report…
                            </CardContent>
                        </Card>

                    ) : !report ? (
                        /* Empty state */
                        <Card className="border-dashed border-gray-600">
                            <CardContent className="pt-20 pb-20 flex flex-col items-center gap-4 text-center">
                                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                                    <ShieldCheck className="h-8 w-8 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-themed-primary">No report yet</h3>
                                    <p className="text-themed-muted mt-1 text-sm max-w-sm mx-auto">
                                        Click <strong>Generate Report</strong> to aggregate your node health, open alerts, and threat intelligence into a single health dashboard.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    ) : (
                        <>
                            {/* ── Row 1: Health ring + stat cards ── */}
                            <div className="grid gap-4 md:grid-cols-5">
                                <Card className="md:col-span-1 bg-gray-800/60 border-gray-700 flex flex-col items-center justify-center py-6">
                                    <CardContent className="pt-0 flex flex-col items-center gap-1">
                                        <p className="text-xs text-themed-muted uppercase tracking-wider mb-3">Health Score</p>
                                        <HealthScoreRing score={report.health_score} />
                                    </CardContent>
                                </Card>

                                <div className="md:col-span-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {([
                                        { label: 'Total Nodes',  value: report.total_nodes,    icon: Server,   color: 'text-status-info'    },
                                        { label: 'Online Nodes', value: report.online_nodes,   icon: Activity, color: 'text-status-success' },
                                        { label: 'Total Alerts', value: report.total_alerts,   icon: Shield,   color: 'text-status-warning' },
                                        { label: 'Critical',     value: report.critical_alerts, icon: Zap,     color: 'text-status-danger'  },
                                    ] as const).map(stat => (
                                        <Card key={stat.label} className="bg-gray-800/60 border-gray-700">
                                            <CardContent className="pt-5 pb-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <stat.icon className={cn('h-4 w-4', stat.color)} />
                                                    <span className="text-xs text-themed-muted">{stat.label}</span>
                                                </div>
                                                <div className="text-3xl font-bold text-themed-primary font-heading">
                                                    {stat.value}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* ── Row 2: Attack types chart + Top attackers ── */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="bg-gray-800/60 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-themed-primary text-sm font-semibold">
                                            Attack Type Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {report.top_attack_types.length === 0 ? (
                                            <p className="text-themed-muted text-sm text-center py-10">No attack data yet</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <BarChart
                                                    data={report.top_attack_types}
                                                    margin={{ left: -10, right: 10, top: 4, bottom: 4 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis
                                                        dataKey="type"
                                                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                        tickFormatter={v => String(v).replace(/_/g, ' ')}
                                                    />
                                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1f2937',
                                                            border: '1px solid #374151',
                                                            borderRadius: 8,
                                                        }}
                                                        labelStyle={{ color: '#e5e7eb' }}
                                                        itemStyle={{ color: '#f59e0b' }}
                                                        labelFormatter={v => String(v).replace(/_/g, ' ')}
                                                    />
                                                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/60 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-themed-primary text-sm font-semibold">Top Attackers</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {report.top_attackers.length === 0 ? (
                                            <p className="text-themed-muted text-sm text-center py-10">No attacker data yet</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-themed-muted text-xs uppercase tracking-wider border-b border-gray-700">
                                                            <th className="pb-2 text-left">IP Address</th>
                                                            <th className="pb-2 text-center">Attacks</th>
                                                            <th className="pb-2 text-center">Risk</th>
                                                            <th className="pb-2 text-left">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-700/50">
                                                        {report.top_attackers.map((a, i) => (
                                                            <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                                                <td className="py-2.5 pr-3 font-mono text-sm text-themed-primary">{a.ip}</td>
                                                                <td className="py-2.5 text-center text-themed-muted">{a.attack_count}</td>
                                                                <td className="py-2.5 text-center">
                                                                    <span className={cn(
                                                                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                                        a.risk_score >= 8
                                                                            ? 'bg-status-danger/15 text-status-danger'
                                                                            : a.risk_score >= 5
                                                                            ? 'bg-status-warning/15 text-status-warning'
                                                                            : 'bg-status-info/15 text-status-info'
                                                                    )}>
                                                                        {a.risk_score.toFixed(1)}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2.5 text-themed-muted truncate max-w-[110px]">
                                                                    {a.most_common_attack}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ── Row 3: Recommendations ── */}
                            <Card className="bg-gray-800/60 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-themed-primary text-sm font-semibold">
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {report.recommendations.map((rec, i) => {
                                            const isCritical = rec.toUpperCase().startsWith('CRITICAL');
                                            const isWarning  = !isCritical && (
                                                rec.includes('offline') ||
                                                rec.includes('Investigate') ||
                                                rec.includes('unresolved')
                                            );
                                            return (
                                                <li
                                                    key={i}
                                                    className={cn(
                                                        'flex gap-3 p-3 rounded-xl text-sm',
                                                        isCritical
                                                            ? 'bg-status-danger/10 border border-status-danger/25'
                                                            : isWarning
                                                            ? 'bg-status-warning/10 border border-status-warning/25'
                                                            : 'bg-accent/5 border border-accent/15'
                                                    )}
                                                >
                                                    <span className={cn(
                                                        'shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                                                        isCritical
                                                            ? 'bg-status-danger/20 text-status-danger'
                                                            : isWarning
                                                            ? 'bg-status-warning/20 text-status-warning'
                                                            : 'bg-accent/20 text-accent'
                                                    )}>
                                                        {i + 1}
                                                    </span>
                                                    <span className={cn(
                                                        isCritical ? 'text-status-danger'
                                                        : isWarning ? 'text-status-warning'
                                                        : 'text-themed-primary'
                                                    )}>
                                                        {rec}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Footer */}
                            <p className="text-xs text-themed-muted text-right">
                                Generated at {new Date(report.generated_at).toLocaleString()}
                            </p>
                        </>
                    )}
                </TabsContent>

                {/* ── Tab 2: AI Advisor ──────────────────────────────────────── */}
                <TabsContent value="advisor" className="space-y-4">

                    {/* Config bar */}
                    <Card className="bg-gray-800/60 border-gray-700">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-wrap gap-3 items-end">
                                {/* Provider pills */}
                                <div className="flex gap-1.5">
                                    {LLM_PROVIDERS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setAiProvider(p.id)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                                aiProvider === p.id
                                                    ? 'bg-accent text-on-accent'
                                                    : 'bg-gray-700 text-themed-muted hover:bg-gray-600 hover:text-themed-primary'
                                            )}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Model input */}
                                <input
                                    type="text"
                                    value={aiModel}
                                    onChange={e => setAiModel(e.target.value)}
                                    placeholder={providerPlaceholder}
                                    className="bg-gray-700 text-themed-primary border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent w-48"
                                />

                                {/* API key input */}
                                <div className="relative flex-1 min-w-52">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={aiApiKey}
                                        onChange={e => setAiApiKey(e.target.value)}
                                        placeholder="API key (stored locally in your profile)"
                                        className="w-full bg-gray-700 text-themed-primary border border-gray-600 rounded-lg px-3 py-1.5 pr-9 text-sm focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(v => !v)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary"
                                    >
                                        {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>

                                {/* Save defaults */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSaveDefaults}
                                    disabled={savingDefaults}
                                    className="border-gray-600 text-themed-muted hover:bg-gray-700 rounded-lg shrink-0"
                                >
                                    <Save className="h-3.5 w-3.5 mr-1.5" />
                                    {savingDefaults ? 'Saving…' : 'Save as default'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chat messages */}
                    <Card className="bg-gray-800/60 border-gray-700">
                        <CardContent className="pt-4 pb-0">
                            <div className="h-[420px] overflow-y-auto space-y-4 pr-1 pb-4">

                                {/* Messages */}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'flex gap-2.5',
                                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="h-7 w-7 rounded-full bg-gray-700 shrink-0 flex items-center justify-center mt-0.5">
                                                <Bot className="h-3.5 w-3.5 text-themed-muted" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                                            msg.role === 'user'
                                                ? 'bg-accent text-on-accent rounded-tr-sm whitespace-pre-wrap'
                                                : 'bg-gray-700 text-themed-primary rounded-tl-sm'
                                        )}>
                                            {msg.role === 'assistant'
                                                ? <div className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:pl-4 [&>ul>li]:list-disc [&>ol]:mb-2 [&>ol]:pl-4 [&>ol>li]:list-decimal [&>blockquote]:border-l-2 [&>blockquote]:border-accent/60 [&>blockquote]:pl-3 [&>blockquote]:text-themed-muted [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded [&_strong]:text-white">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                  </div>
                                                : msg.content
                                            }
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="h-7 w-7 rounded-full bg-accent/20 shrink-0 flex items-center justify-center mt-0.5">
                                                <UserIcon className="h-3.5 w-3.5 text-accent" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {chatLoading && (
                                    <div className="flex gap-2.5 justify-start">
                                        <div className="h-7 w-7 rounded-full bg-gray-700 shrink-0 flex items-center justify-center">
                                            <Bot className="h-3.5 w-3.5 text-themed-muted" />
                                        </div>
                                        <div className="bg-gray-700 rounded-2xl rounded-tl-sm">
                                            <TypingDots />
                                        </div>
                                    </div>
                                )}

                                <div ref={chatEndRef} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Input row */}
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask about your security posture… (Enter to send, Shift+Enter for new line)"
                            rows={2}
                            className="flex-1 bg-gray-800 border border-gray-600 text-themed-primary rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-accent"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={chatLoading || !input.trim()}
                            className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl px-4 py-3"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
}
