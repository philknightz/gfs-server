export function parseAIJson<T = unknown>(text: string): T | null {
  if (!text) return null;

  // Remove possible code fences and leading labels like 'json' or ```
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "");
  cleaned = cleaned.replace(/```$/, "");

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {}

  // Heuristic: find first '{' and last '}'
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const candidate = cleaned.slice(first, last + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {}
  }

  // Remove newlines around quotes that can break JSON
  const compact = cleaned.replace(/\r\n/g, "\n").replace(/\n\s+/g, " ").replace(/\s+\n/g, " ").trim();
  try {
    return JSON.parse(compact) as T;
  } catch {
    return null;
  }
}
