import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const TS_EXTENSIONS = ['.ts', '.tsx'];

export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    const parentPath = fileURLToPath(context.parentURL);
    const resolvedBase = path.resolve(path.dirname(parentPath), specifier);
    const knownExtension = ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'].includes(path.extname(resolvedBase));
    const candidates = knownExtension
      ? [resolvedBase]
      : [
          ...TS_EXTENSIONS.map((ext) => `${resolvedBase}${ext}`),
          ...TS_EXTENSIONS.map((ext) => path.join(resolvedBase, `index${ext}`)),
        ];

    for (const candidate of candidates) {
      try {
        const stat = await fs.stat(candidate);
        if (stat.isFile()) return { url: pathToFileURL(candidate).href, shortCircuit: true };
      } catch {
        // Tenta o próximo candidato e, no final, delega ao resolver padrão do Node.
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const source = await fs.readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', source: `export default ${source.trim()};`, shortCircuit: true };
  }

  if (TS_EXTENSIONS.some((ext) => url.endsWith(ext))) {
    const filename = fileURLToPath(url);
    const source = await fs.readFile(filename, 'utf8');
    const result = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      reportDiagnostics: true,
    });

    const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    if (errors.length) {
      throw new Error(ts.formatDiagnosticsWithColorAndContext(errors, {
        getCanonicalFileName: (file) => file,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n',
      }));
    }

    return { format: 'module', source: result.outputText, shortCircuit: true };
  }

  return nextLoad(url, context);
}
