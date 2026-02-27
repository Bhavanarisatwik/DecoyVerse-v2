import { useState, useEffect, useCallback } from "react"
import zxcvbn from 'zxcvbn'
import {
    KeyRound, Lock, Unlock, Eye, EyeOff, Copy, Plus, Pencil,
    Trash2, RefreshCw, Check, ExternalLink, Search, X,
    AlertCircle, ShieldCheck, Shield,
} from "lucide-react"
import { Button } from "../components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/Card"
import { Breadcrumb } from "../components/common/Breadcrumb"
import { vaultApi } from "../api/endpoints/vault"
import { authApi } from "../api/endpoints/auth"
import { useAuth } from "../context/AuthContext"
import type { VaultItem, VaultItemCreate } from "../api/types"
import {
    deriveKey, encryptString, decryptString,
    createVaultVerifier, verifyVaultKey, generateSecurePassword,
} from "../utils/crypto"
import { cn } from "../utils/cn"

// ─── Password Strength Bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
    if (!password) return null;
    const result = zxcvbn(password);
    const { score } = result;

    const barColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    const labels    = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const textColors= ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-emerald-400'];

    const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;
    const suggestion = result.feedback.suggestions?.[0];

    return (
        <div className="space-y-1.5 mt-1.5">
            <div className="flex gap-1">
                {([0, 1, 2, 3, 4] as const).map(i => (
                    <div
                        key={i}
                        className={cn(
                            'h-1.5 flex-1 rounded-full transition-all duration-300',
                            i <= score ? barColors[score] : 'bg-gray-600'
                        )}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className={textColors[score]}>{labels[score]}</span>
                <span className="text-themed-muted">Crack time: {String(crackTime)}</span>
            </div>
            {suggestion && score < 3 && (
                <p className="text-xs text-themed-muted italic">{suggestion}</p>
            )}
        </div>
    );
}

// ─── Strength Badge (compact, for table) ─────────────────────────────────────

function StrengthBadge({ password }: { password: string }) {
    if (!password) return <span className="text-xs text-themed-muted">—</span>;
    const { score } = zxcvbn(password);

    const data = [
        { label: 'Very Weak', cls: 'bg-red-500/15 text-red-400' },
        { label: 'Weak',      cls: 'bg-red-500/15 text-red-400' },
        { label: 'Fair',      cls: 'bg-orange-500/15 text-orange-400' },
        { label: 'Good',      cls: 'bg-green-500/15 text-green-400' },
        { label: 'Strong',    cls: 'bg-emerald-500/15 text-emerald-400' },
    ][score];

    return (
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', data.cls)}>
            {data.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Vault() {
    const { user, updateUser } = useAuth();

    // Encryption key — null = locked / not set up yet
    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

    // Vault items & decrypted password map
    const [items, setItems]                         = useState<VaultItem[]>([]);
    const [decryptedPasswords, setDecryptedPasswords] = useState<Map<string, string>>(new Map());
    const [loadingItems, setLoadingItems]           = useState(false);

    // Setup / unlock form
    const [masterPw, setMasterPw]   = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showMaster, setShowMaster] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [unlockError, setUnlockError] = useState<string | null>(null);
    const [setupError, setSetupError]   = useState<string | null>(null);

    // Unlocked UI
    const [searchQuery, setSearchQuery]   = useState('');
    const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
    const [copiedId, setCopiedId]           = useState<string | null>(null);
    const [deletingId, setDeletingId]       = useState<string | null>(null);

    // Add / Edit modal
    const [showModal, setShowModal]       = useState(false);
    const [editingItem, setEditingItem]   = useState<VaultItem | null>(null);
    const [formTitle, setFormTitle]       = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formUrl, setFormUrl]           = useState('');
    const [formNotes, setFormNotes]       = useState('');
    const [showFormPw, setShowFormPw]     = useState(false);
    const [savingItem, setSavingItem]     = useState(false);
    const [saveError, setSaveError]       = useState<string | null>(null);

    const setupMode = !user?.vaultVerifier;

    // ── Load items after unlock ───────────────────────────────────────────────
    const loadItems = useCallback(async (key: CryptoKey) => {
        setLoadingItems(true);
        try {
            const res = await vaultApi.getItems();
            setItems(res.data);

            const map = new Map<string, string>();
            await Promise.all(
                res.data.map(async item => {
                    try {
                        const plain = await decryptString(item.encryptedPassword, key);
                        map.set(item._id, plain);
                    } catch {
                        map.set(item._id, '[decryption error]');
                    }
                })
            );
            setDecryptedPasswords(map);
        } catch {
            // items stay empty — user can retry
        } finally {
            setLoadingItems(false);
        }
    }, []);

    // ── Setup: create vault ───────────────────────────────────────────────────
    const handleSetupVault = async () => {
        if (!user) return;
        if (masterPw.length < 8) { setSetupError('Master password must be at least 8 characters.'); return; }
        if (masterPw !== confirmPw) { setSetupError('Passwords do not match.'); return; }

        setUnlocking(true);
        setSetupError(null);
        try {
            const key = await deriveKey(masterPw, user.id);
            const verifier = await createVaultVerifier(key);

            const res = await authApi.updateProfile({ id: user.id, vaultVerifier: verifier });
            if (res.success && res.data) {
                const updatedUser = (res.data as any).user || res.data;
                updateUser(updatedUser);
            }

            setCryptoKey(key);
            setMasterPw('');
            setConfirmPw('');
            await loadItems(key);
        } catch {
            setSetupError('Failed to create vault. Please try again.');
        } finally {
            setUnlocking(false);
        }
    };

    // ── Unlock vault ──────────────────────────────────────────────────────────
    const handleUnlock = async () => {
        if (!user?.vaultVerifier) return;

        setUnlocking(true);
        setUnlockError(null);
        try {
            const key = await deriveKey(masterPw, user.id);
            const valid = await verifyVaultKey(user.vaultVerifier, key);
            if (!valid) {
                setUnlockError('Incorrect master password. Please try again.');
                return;
            }

            setCryptoKey(key);
            setMasterPw('');
            await loadItems(key);
        } catch {
            setUnlockError('Failed to unlock. Please try again.');
        } finally {
            setUnlocking(false);
        }
    };

    // ── Lock vault ────────────────────────────────────────────────────────────
    const handleLock = () => {
        setCryptoKey(null);
        setItems([]);
        setDecryptedPasswords(new Map());
        setShowPasswords(new Set());
        setSearchQuery('');
    };

    // ── Copy password with 30s auto-clear ─────────────────────────────────────
    const handleCopy = async (id: string) => {
        const pwd = decryptedPasswords.get(id);
        if (!pwd) return;
        try {
            await navigator.clipboard.writeText(pwd);
            setCopiedId(id);
            setTimeout(() => setCopiedId(prev => prev === id ? null : prev), 2000);
            // Auto-clear clipboard after 30s
            setTimeout(async () => {
                try {
                    const current = await navigator.clipboard.readText();
                    if (current === pwd) await navigator.clipboard.writeText('');
                } catch {}
            }, 30_000);
        } catch {}
    };

    // ── Toggle password visibility in table ───────────────────────────────────
    const toggleShow = (id: string) => {
        setShowPasswords(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    // ── Delete item ───────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await vaultApi.deleteItem(id);
            setItems(prev => prev.filter(i => i._id !== id));
            setDecryptedPasswords(prev => { const m = new Map(prev); m.delete(id); return m; });
        } finally {
            setDeletingId(null);
        }
    };

    // ── Open modal ────────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditingItem(null);
        setFormTitle(''); setFormUsername(''); setFormPassword('');
        setFormUrl(''); setFormNotes(''); setShowFormPw(false); setSaveError(null);
        setShowModal(true);
    };

    const openEdit = (item: VaultItem) => {
        setEditingItem(item);
        setFormTitle(item.title);
        setFormUsername(item.username);
        setFormPassword(decryptedPasswords.get(item._id) ?? '');
        setFormUrl(item.url ?? '');
        setFormNotes(item.notes ?? '');
        setShowFormPw(false);
        setSaveError(null);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingItem(null); };

    // ── Save (create or update) ───────────────────────────────────────────────
    const handleSaveItem = async () => {
        if (!cryptoKey || !formTitle.trim() || !formPassword) return;
        setSavingItem(true);
        setSaveError(null);
        try {
            const encryptedPassword = await encryptString(formPassword, cryptoKey);
            const data: VaultItemCreate = {
                title: formTitle.trim(),
                username: formUsername,
                encryptedPassword,
                url: formUrl || undefined,
                notes: formNotes || undefined,
            };

            if (editingItem) {
                const res = await vaultApi.updateItem(editingItem._id, data);
                setItems(prev => prev.map(i => i._id === editingItem._id ? res.data : i));
                setDecryptedPasswords(prev => new Map(prev).set(editingItem._id, formPassword));
            } else {
                const res = await vaultApi.createItem(data);
                setItems(prev => [res.data, ...prev]);
                setDecryptedPasswords(prev => new Map(prev).set(res.data._id, formPassword));
            }
            closeModal();
        } catch {
            setSaveError('Failed to save. Please try again.');
        } finally {
            setSavingItem(false);
        }
    };

    // ── Generate password ─────────────────────────────────────────────────────
    const handleGenerate = () => {
        setFormPassword(generateSecurePassword(20));
        setShowFormPw(true);
    };

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredItems = items.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.title.toLowerCase().includes(q) ||
            item.username.toLowerCase().includes(q) ||
            (item.url ?? '').toLowerCase().includes(q)
        );
    });

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold text-themed-primary font-heading flex items-center gap-2">
                    <KeyRound className="h-8 w-8 text-accent" />
                    Password Vault
                </h1>
                <p className="text-themed-muted mt-1">
                    Zero-knowledge encrypted vault — your master password never leaves your device.
                </p>
            </div>

            {/* ── SETUP VIEW ─────────────────────────────────────────────────── */}
            {setupMode && !cryptoKey && (
                <div className="max-w-md mx-auto mt-8">
                    <Card className="bg-gray-800/60 border-gray-700">
                        <CardContent className="pt-8 pb-8 space-y-6">
                            <div className="text-center">
                                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="h-8 w-8 text-accent" />
                                </div>
                                <h2 className="text-xl font-bold text-themed-primary">Create Your Vault</h2>
                                <p className="text-themed-muted text-sm mt-1">
                                    Set a strong master password. It encrypts all your credentials — the server never sees it.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Master password */}
                                <div>
                                    <label className="block text-sm font-medium text-themed-primary mb-1">Master Password</label>
                                    <div className="relative">
                                        <input
                                            type={showMaster ? 'text' : 'password'}
                                            value={masterPw}
                                            onChange={e => setMasterPw(e.target.value)}
                                            placeholder="At least 8 characters"
                                            className="w-full bg-gray-700 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowMaster(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary"
                                        >
                                            {showMaster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrengthBar password={masterPw} />
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-sm font-medium text-themed-primary mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPw}
                                        onChange={e => setConfirmPw(e.target.value)}
                                        placeholder="Re-enter master password"
                                        onKeyDown={e => e.key === 'Enter' && handleSetupVault()}
                                        className="w-full bg-gray-700 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>

                                {setupError && (
                                    <p className="text-status-danger text-sm flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {setupError}
                                    </p>
                                )}

                                {/* Warning */}
                                <div className="bg-status-warning/10 border border-status-warning/25 rounded-xl p-3 flex gap-2.5">
                                    <AlertCircle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
                                    <p className="text-xs text-status-warning leading-relaxed">
                                        <strong>Important:</strong> If you forget your master password, your vault data cannot be recovered. We do not store your password anywhere.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSetupVault}
                                    disabled={unlocking || !masterPw || !confirmPw}
                                    className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                                >
                                    {unlocking
                                        ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                                        : <><ShieldCheck className="mr-2 h-4 w-4" />Create Vault</>
                                    }
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── LOCKED VIEW ────────────────────────────────────────────────── */}
            {!setupMode && !cryptoKey && (
                <div className="max-w-sm mx-auto mt-8">
                    <Card className="bg-gray-800/60 border-gray-700">
                        <CardContent className="pt-8 pb-8 space-y-6">
                            <div className="text-center">
                                <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                    <Lock className="h-8 w-8 text-themed-muted" />
                                </div>
                                <h2 className="text-xl font-bold text-themed-primary">Vault Locked</h2>
                                <p className="text-themed-muted text-sm mt-1">
                                    Enter your master password to unlock your vault.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type={showMaster ? 'text' : 'password'}
                                        value={masterPw}
                                        onChange={e => setMasterPw(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                                        placeholder="Master password"
                                        autoFocus
                                        className="w-full bg-gray-700 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowMaster(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary"
                                    >
                                        {showMaster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {unlockError && (
                                    <p className="text-status-danger text-sm flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {unlockError}
                                    </p>
                                )}

                                <Button
                                    onClick={handleUnlock}
                                    disabled={unlocking || !masterPw}
                                    className="w-full bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                                >
                                    {unlocking
                                        ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Unlocking…</>
                                        : <><Unlock className="mr-2 h-4 w-4" />Unlock Vault</>
                                    }
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── UNLOCKED VIEW ──────────────────────────────────────────────── */}
            {cryptoKey && (
                <>
                    {/* Header bar */}
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="relative flex-1 min-w-52 max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title, username, URL…"
                                className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-themed-muted">
                                {items.length} {items.length === 1 ? 'entry' : 'entries'}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLock}
                                className="border-gray-600 text-themed-muted hover:bg-gray-700 rounded-xl"
                            >
                                <Lock className="h-3.5 w-3.5 mr-1.5" />
                                Lock
                            </Button>
                            <Button
                                onClick={openAdd}
                                className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                Add Entry
                            </Button>
                        </div>
                    </div>

                    {/* Items table */}
                    {loadingItems ? (
                        <Card className="bg-gray-800/60 border-gray-700">
                            <CardContent className="pt-12 pb-12 text-center text-themed-muted">
                                Decrypting vault…
                            </CardContent>
                        </Card>
                    ) : filteredItems.length === 0 ? (
                        <Card className="bg-gray-800/60 border-gray-700 border-dashed">
                            <CardContent className="pt-16 pb-16 flex flex-col items-center gap-4 text-center">
                                <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center">
                                    <Shield className="h-7 w-7 text-themed-muted" />
                                </div>
                                <div>
                                    <p className="text-themed-primary font-semibold">
                                        {searchQuery ? 'No matching entries' : 'Your vault is empty'}
                                    </p>
                                    <p className="text-themed-muted text-sm mt-1">
                                        {searchQuery
                                            ? 'Try a different search term.'
                                            : 'Click Add Entry to store your first credential.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-gray-800/60 border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-themed-muted text-xs uppercase tracking-wider border-b border-gray-700 bg-gray-800/80">
                                            <th className="px-4 py-3 text-left">Title</th>
                                            <th className="px-4 py-3 text-left">Username</th>
                                            <th className="px-4 py-3 text-left">Password</th>
                                            <th className="px-4 py-3 text-left">Strength</th>
                                            <th className="px-4 py-3 text-left">URL</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {filteredItems.map(item => {
                                            const plain = decryptedPasswords.get(item._id) ?? '';
                                            const revealed = showPasswords.has(item._id);
                                            const copied = copiedId === item._id;

                                            return (
                                                <tr key={item._id} className="hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-themed-primary max-w-[140px] truncate">
                                                        {item.title}
                                                    </td>
                                                    <td className="px-4 py-3 text-themed-muted max-w-[140px] truncate font-mono text-xs">
                                                        {item.username || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-xs text-themed-primary max-w-[120px] truncate">
                                                                {revealed ? plain : '••••••••••••'}
                                                            </span>
                                                            <button
                                                                onClick={() => toggleShow(item._id)}
                                                                className="text-themed-muted hover:text-themed-primary shrink-0"
                                                                title={revealed ? 'Hide' : 'Show'}
                                                            >
                                                                {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopy(item._id)}
                                                                className={cn(
                                                                    'shrink-0 transition-colors',
                                                                    copied
                                                                        ? 'text-status-success'
                                                                        : 'text-themed-muted hover:text-themed-primary'
                                                                )}
                                                                title={copied ? 'Copied!' : 'Copy password'}
                                                            >
                                                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StrengthBadge password={plain} />
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[140px]">
                                                        {item.url ? (
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-accent hover:underline flex items-center gap-1 text-xs truncate"
                                                            >
                                                                {item.url.replace(/^https?:\/\//, '')}
                                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-themed-muted">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5 justify-end">
                                                            <button
                                                                onClick={() => openEdit(item)}
                                                                className="p-1.5 rounded-lg text-themed-muted hover:text-themed-primary hover:bg-gray-700 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                disabled={deletingId === item._id}
                                                                className="p-1.5 rounded-lg text-themed-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors disabled:opacity-40"
                                                                title="Delete"
                                                            >
                                                                {deletingId === item._id
                                                                    ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                                    : <Trash2 className="h-3.5 w-3.5" />
                                                                }
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* ── ADD / EDIT MODAL ──────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal card */}
                    <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-themed-primary font-heading">
                                {editingItem ? 'Edit Entry' : 'New Entry'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-themed-muted hover:text-themed-primary"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-themed-primary mb-1">
                                    Title <span className="text-status-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    placeholder="e.g. GitHub, Gmail"
                                    className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-themed-primary mb-1">Username / Email</label>
                                <input
                                    type="text"
                                    value={formUsername}
                                    onChange={e => setFormUsername(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-themed-primary mb-1">
                                    Password <span className="text-status-danger">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showFormPw ? 'text' : 'password'}
                                            value={formPassword}
                                            onChange={e => setFormPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-accent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowFormPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary"
                                        >
                                            {showFormPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerate}
                                        className="border-gray-600 text-themed-muted hover:bg-gray-700 rounded-lg shrink-0"
                                        title="Generate secure password"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                        Generate
                                    </Button>
                                </div>
                                <PasswordStrengthBar password={formPassword} />
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-themed-primary mb-1">Website URL</label>
                                <input
                                    type="url"
                                    value={formUrl}
                                    onChange={e => setFormUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-themed-primary mb-1">Notes</label>
                                <textarea
                                    value={formNotes}
                                    onChange={e => setFormNotes(e.target.value)}
                                    placeholder="Optional notes…"
                                    rows={2}
                                    className="w-full bg-gray-800 border border-gray-600 text-themed-primary rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
                                />
                            </div>

                            {saveError && (
                                <p className="text-status-danger text-sm flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    {saveError}
                                </p>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-700">
                            <Button
                                variant="outline"
                                onClick={closeModal}
                                className="border-gray-600 text-themed-muted hover:bg-gray-700 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveItem}
                                disabled={savingItem || !formTitle.trim() || !formPassword}
                                className="bg-accent hover:bg-accent-600 text-on-accent font-bold rounded-xl"
                            >
                                {savingItem
                                    ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                                    : <><ShieldCheck className="mr-2 h-4 w-4" />{editingItem ? 'Update' : 'Save Entry'}</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
