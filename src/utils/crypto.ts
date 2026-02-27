/**
 * Zero-knowledge vault cryptography
 * All operations use the browser's built-in Web Crypto API (AES-GCM + PBKDF2).
 * The master password and derived key NEVER leave the browser.
 */

const VAULT_VERIFIER_PLAINTEXT = 'decoyverse-vault-v1';
const PBKDF2_ITERATIONS = 100_000;

/**
 * Derive an AES-256-GCM CryptoKey from a master password + userId as salt.
 * Uses PBKDF2 with 100,000 SHA-256 iterations.
 * The key is non-extractable — its raw bytes can never be read by JS code.
 */
export async function deriveKey(masterPassword: string, userId: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(masterPassword),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode(userId),
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a plaintext string with AES-GCM using a fresh random 96-bit IV.
 * Returns a JSON string: { iv: base64, ciphertext: base64 }
 */
export async function encryptString(plaintext: string, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(plaintext)
    );
    return JSON.stringify({
        iv: _bufToB64(iv),
        ciphertext: _bufToB64(new Uint8Array(ciphertext)),
    });
}

/**
 * Decrypt an AES-GCM encrypted JSON blob back to plaintext.
 * Throws DOMException if the key is wrong or the data is corrupted.
 */
export async function decryptString(encryptedJson: string, key: CryptoKey): Promise<string> {
    const { iv, ciphertext } = JSON.parse(encryptedJson) as { iv: string; ciphertext: string };
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: _b64ToBuf(iv) },
        key,
        _b64ToBuf(ciphertext)
    );
    return new TextDecoder().decode(decrypted);
}

/**
 * Create a vault verifier blob — encrypt the known string so we can
 * verify the master password is correct on future unlocks.
 * Store the returned string in the user's profile (vaultVerifier field).
 */
export async function createVaultVerifier(key: CryptoKey): Promise<string> {
    return encryptString(VAULT_VERIFIER_PLAINTEXT, key);
}

/**
 * Verify that a master password is correct by decrypting the stored verifier.
 * Returns true if decryption succeeds and the result matches the expected string.
 * Returns false (never throws) — a wrong password is just an invalid attempt.
 */
export async function verifyVaultKey(verifierBlob: string, key: CryptoKey): Promise<boolean> {
    try {
        const plaintext = await decryptString(verifierBlob, key);
        return plaintext === VAULT_VERIFIER_PLAINTEXT;
    } catch {
        return false;
    }
}

/**
 * Generate a cryptographically random password.
 * Default length: 20 characters.
 * Character set: uppercase + lowercase + digits + common symbols.
 */
export function generateSecurePassword(length = 20): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    const values = window.crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, (byte) => charset[byte % charset.length]).join('');
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _bufToB64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
}

function _b64ToBuf(base64: string): Uint8Array {
    const binary = atob(base64);
    return new Uint8Array(Array.from(binary, (c) => c.charCodeAt(0)));
}
