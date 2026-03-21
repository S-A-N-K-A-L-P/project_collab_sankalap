const STORAGE_KEY = 'pixel_voter_id';

function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `voter_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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
