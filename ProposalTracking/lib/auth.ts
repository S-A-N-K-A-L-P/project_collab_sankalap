import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Browser / client-side Supabase client */
export const createSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

/** Server-side Supabase client (uses service role) */
export const createSupabaseServerClient = () =>
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

/**
 * Validates the Supabase session from the Authorization header.
 * Returns the user object or null if invalid.
 */
export async function validateSession(
  request: Request
): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Dev bypass — allow unauthenticated requests in development
  if (!token && process.env.NODE_ENV !== "production") {
    return { id: "dev-user", email: "dev@pixel.local" };
  }

  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? "",
  };
}
