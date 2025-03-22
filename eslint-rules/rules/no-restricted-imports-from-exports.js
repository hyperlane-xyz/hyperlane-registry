import fs from 'fs';
import path from 'path';

const NODE_BUILTIN_MODULES = [
  'fs',
  'path',
  'child_process',
  'os',
  'process',
  'http',
  'https',
  'net',
  'dgram',
  'dns',
  'crypto',
  'tls',
  'cluster',
  'stream',
  'vm',
  'readline',
];

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow client-restricted imports in files exported from index.ts',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      restrictedFsImport:
        'Files exported from index.ts should not import "{{ moduleName }}" which is exported from index-fs.ts',
      restrictedNodeImport:
        'Files exported from index.ts should not import Node.js built-in module "{{ moduleName }}"',
    },
    schema: [],
  },
  create(context) {
    const resolvePathFromCwd = (relativePath) => path.resolve(context.cwd, relativePath);

    const extractNamedExports = (content) => {
      const exportBlocks = content.match(/export\s+\{[^}]+\}/g) || [];

      const namedExports = exportBlocks.join(' ').match(/[a-zA-Z0-9_]+(?=\s*[,}])/g) || [];

      return namedExports.map((name) => name.trim());
    };

    const extractReExports = (content, basePath) => {
      const reExportMatches = content.match(/export\s+(?:[\s\S]*?)\s+from\s+['"](.+)['"]/g) || [];

      const reExportPaths = reExportMatches
        .map((match) => {
          const pathMatch = match.match(/from\s+['"](.+)['"]/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean)
        .filter((exportPath) => exportPath.startsWith('./') || exportPath.startsWith('../'));

      return reExportPaths.map((exportPath) => {
        const resolvedPath = exportPath.endsWith('.js')
          ? exportPath.replace(/\.js$/, '.ts')
          : exportPath;

        return path.resolve(path.dirname(basePath), resolvedPath);
      });
    };

    const extractExportsFromFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return [...extractNamedExports(content), ...extractReExports(content, filePath)];
      } catch (error) {
        return [];
      }
    };

    const isPathPartOfExport = (filePath, exportPath) =>
      typeof exportPath === 'string' &&
      exportPath.includes('/') &&
      filePath.includes(exportPath.replace(/\.ts$/, ''));

    const indexTsPath = resolvePathFromCwd('./src/index.ts');
    const indexFsPath = resolvePathFromCwd('./src/index-fs.ts');

    const indexExports = extractExportsFromFile(indexTsPath);
    const fsIndexExports = extractExportsFromFile(indexFsPath);

    const isFileExportedFromIndex = (filePath) =>
      indexExports.some((exportPath) => isPathPartOfExport(filePath, exportPath));

    const isExportedFromFsIndex = (importPath) =>
      fsIndexExports.some((fsExport) => isPathPartOfExport(importPath, fsExport));

    const isNodeBuiltinModuleOrSubpath = (importSource) => {
      if (NODE_BUILTIN_MODULES.includes(importSource)) {
        return true;
      }

      const parts = importSource.split('/');
      return NODE_BUILTIN_MODULES.includes(parts[0]) && parts.length > 1;
    };

    return {
      ImportDeclaration(node) {
        const currentFilePath = context.getFilename();

        if (!isFileExportedFromIndex(currentFilePath)) return;

        const importSource = node.source.value;

        if (isNodeBuiltinModuleOrSubpath(importSource)) {
          context.report({
            node,
            messageId: 'restrictedNodeImport',
            data: { moduleName: importSource },
          });
        }

        if (typeof importSource === 'string' && importSource.startsWith('.')) {
          const resolvedImportPath = path.resolve(path.dirname(currentFilePath), importSource);

          if (isExportedFromFsIndex(resolvedImportPath)) {
            context.report({
              node,
              messageId: 'restrictedFsImport',
              data: { moduleName: importSource },
            });
          }
        }
      },
    };
  },
};
