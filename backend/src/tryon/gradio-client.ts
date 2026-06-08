/**
 * Wrapper for @gradio/client which is ESM-only.
 *
 * TypeScript with `module: commonjs` compiles `await import('foo')` into
 * `require('foo')`, which crashes for ESM packages. The Function() trick
 * preserves the actual dynamic import() at runtime.
 *
 * Reference: https://github.com/microsoft/TypeScript/issues/43329
 */

// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const dynamicImport = new Function('specifier', 'return import(specifier)') as
  (s: string) => Promise<any>;

export async function getGradioClient() {
  const mod = await dynamicImport('@gradio/client');
  return mod.Client as any;
}
