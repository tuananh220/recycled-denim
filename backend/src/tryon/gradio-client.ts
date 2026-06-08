/**
 * ESM-safe wrapper for @gradio/client.
 *
 * Problem: @gradio/client is ESM-only, but our backend compiles to CommonJS
 * (module: "commonjs" in tsconfig). TypeScript turns `await import('foo')`
 * into `require('foo')` which crashes on ESM packages with:
 *   "require() of ES Module ... not supported"
 *
 * Solution: use indirect eval — TypeScript cannot statically analyze it,
 * so the native dynamic import() survives all the way to runtime.
 *
 * Reference: https://github.com/microsoft/TypeScript/issues/43329
 */

// Indirect eval — `(0, eval)` runs eval in the global scope, and TS will
// never transform string contents passed to it. This guarantees the real
// dynamic import() runs at runtime.
const importESM = <T = any>(specifier: string): Promise<T> =>
  (0, eval)(`import('${specifier}')`) as Promise<T>;

let cachedClient: any = null;

export async function getGradioClient(): Promise<any> {
  if (cachedClient) return cachedClient;
  const mod = await importESM<{ Client: any }>('@gradio/client');
  cachedClient = mod.Client;
  return cachedClient;
}
