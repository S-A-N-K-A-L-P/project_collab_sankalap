const STORAGE_KEY = 'pixel_voter_id';

function generateId(): string {
    if (typeof crypto !== 'undefined') {
        if (typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        if (typeof crypto.getRandomValues === 'function') {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);
            const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
            return `voter_${hex}`;
        }
    }

    return 'voter_fallback_id';
}

export function getOrCreateVoterId(): string {
    if (typeof window === 'undefined') {
        return 'anonymous';
    }

    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
        document.cookie = `voter_id=${existing}; path=/; max-age=31536000; SameSite=Lax`;
        return existing;
    }

    const created = generateId();
    window.localStorage.setItem(STORAGE_KEY, created);
    document.cookie = `voter_id=${created}; path=/; max-age=31536000; SameSite=Lax`;
    return created;
}
