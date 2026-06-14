import { getApiBaseUrl } from '@/config';
export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: any) { super(message); }
}
function safeJson(t: string) { try { return JSON.parse(t); } catch { return null; } }
async function handle(res: Response) {
  const t = await res.text();
  const d = t ? safeJson(t) : null;
  if (!res.ok) {
    const m = Array.isArray(d?.message) ? d.message.join(' · ') : (d?.message ?? `Error ${res.status}`);
    throw new ApiError(res.status, m, d);
  }
  return d;
}
export const api = {
  get: (p: string) => fetch(getApiBaseUrl() + p).then(handle),
  post: (p: string, b: unknown) =>
    fetch(getApiBaseUrl() + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(handle),
  // Devuelve HTML crudo (para /requests/preview). No parsea JSON.
  postHtml: async (p: string, b: unknown) => {
    const res = await fetch(getApiBaseUrl() + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    const t = await res.text();
    if (!res.ok) throw new ApiError(res.status, safeJson(t)?.message ?? `Error ${res.status}`);
    return t;
  },
};
