/**
 * Safe JSON utilities to handle circular references
 */

export function safeStringify(obj: any): string {
  const seen = new WeakSet();
  
  return JSON.stringify(obj, (key, val) => {
    if (val != null && typeof val === "object") {
      if (seen.has(val)) {
        return "[Circular Reference]";
      }
      seen.add(val);
    }
    return val;
  });
}

export function safeParse<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

export function isCircular(obj: any): boolean {
  try {
    JSON.stringify(obj);
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes('circular');
  }
}