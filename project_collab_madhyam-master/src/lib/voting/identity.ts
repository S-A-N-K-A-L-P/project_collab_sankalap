import { cookies, headers } from 'next/headers';

const COOKIE_NAME = 'voter_id';

function sanitize(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export async function getVoterId(): Promise<string> {
    const headerStore = await headers();
    const cookieStore = await cookies();

    const fromHeader = headerStore.get('x-voter-id')?.trim();
    if (fromHeader) {
        const clean = sanitize(fromHeader);
        if (clean) {
            return clean;
        }
    }

    const fromCookie = cookieStore.get(COOKIE_NAME)?.value?.trim();
    if (fromCookie) {
        const clean = sanitize(fromCookie);
        if (clean) {
            return clean;
        }
    }

    return 'anonymous';
}
