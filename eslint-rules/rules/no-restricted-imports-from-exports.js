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
    type: 'suggestion',
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
    const resolvedPath = (relativePath) => path.resolve(context.cwd, relativePath);

    // Get all exports from index.ts
    const indexTsPath = resolvedPath('./src/index.ts');
    let indexExports = [];
    let fsIndexExports = [];

    try {
      const indexTsContent = fs.readFileSync(indexTsPath, 'utf8');
      const exportMatches = indexTsContent.match(/export\s+\{[^}]+\}/g);
      if (exportMatches) {
        indexExports = exportMatches
          .join(' ')
          .match(/[a-zA-Z0-9_]+(?=\s*[,}])/g)
          .map((name) => name.trim());
      }

      // Get re-exports
      const reExportMatches = indexTsContent.match(/export\s+.*\s+from\s+['"](.+)['"]/g);
      if (reExportMatches) {
        const reExportPaths = reExportMatches
          .map((match) => {
            const pathMatch = match.match(/from\s+['"](.+)['"]/);
            return pathMatch ? pathMatch[1] : null;
          })
          .filter(Boolean);

        reExportPaths.forEach((exportPath) => {
          let resolvedExportPath = exportPath;
          if (!exportPath.startsWith('./') && !exportPath.startsWith('../')) {
            return; // External module, not our concern
          }

          // Convert path to absolute file path
          if (exportPath.endsWith('.js')) {
            resolvedExportPath = exportPath.replace(/\.js$/, '.ts');
          }

          const fullPath = path.resolve(path.dirname(indexTsPath), resolvedExportPath);
          indexExports.push(fullPath);
        });
      }

      // Get all exports from index-fs.ts
      const indexFsPath = resolvedPath('./src/index-fs.ts');
      const indexFsContent = fs.readFileSync(indexFsPath, 'utf8');

      const fsExportMatches = indexFsContent.match(/export\s+\{[^}]+\}/g);
      if (fsExportMatches) {
        fsIndexExports = fsExportMatches
          .join(' ')
          .match(/[a-zA-Z0-9_]+(?=\s*[,}])/g)
          .map((name) => name.trim());
      }

      // Get re-exports from index-fs.ts
      const fsReExportMatches = indexFsContent.match(/export\s+.*\s+from\s+['"](.+)['"]/g);
      if (fsReExportMatches) {
        const fsReExportPaths = fsReExportMatches
          .map((match) => {
            const pathMatch = match.match(/from\s+['"](.+)['"]/);
            return pathMatch ? pathMatch[1] : null;
          })
          .filter(Boolean);

        fsReExportPaths.forEach((exportPath) => {
          let resolvedExportPath = exportPath;
          if (!exportPath.startsWith('./') && !exportPath.startsWith('../')) {
            return; // External module, not our concern
          }

          // Convert path to absolute file path
          if (exportPath.endsWith('.js')) {
            resolvedExportPath = exportPath.replace(/\.js$/, '.ts');
          }

          const fullPath = path.resolve(path.dirname(indexFsPath), resolvedExportPath);
          fsIndexExports.push(fullPath);
        });
      }
    } catch (error) {
      // If file doesn't exist or can't be read, continue with empty arrays
    }

    return {
      ImportDeclaration(node) {
        const currentFilePath = context.getFilename();
        const isExportedFile = indexExports.some((exportPath) => {
          if (typeof exportPath === 'string' && exportPath.includes('/')) {
            return currentFilePath.includes(exportPath.replace(/\.ts$/, ''));
          }
          return false;
        });

        if (!isExportedFile) {
          return; // Not an exported file, ignore
        }

        const importSource = node.source.value;

        // Check Node.js built-in modules
        if (NODE_BUILTIN_MODULES.includes(importSource)) {
          context.report({
            node,
            messageId: 'restrictedNodeImport',
            data: {
              moduleName: importSource,
            },
          });
        }

        // Check index-fs.ts exports
        if (typeof importSource === 'string' && importSource.startsWith('.')) {
          const importPath = path.resolve(path.dirname(currentFilePath), importSource);

          for (const fsExport of fsIndexExports) {
            if (typeof fsExport === 'string' && fsExport.includes('/')) {
              if (importPath.includes(fsExport.replace(/\.ts$/, ''))) {
                context.report({
                  node,
                  messageId: 'restrictedFsImport',
                  data: {
                    moduleName: importSource,
                  },
                });
                return;
              }
            }
          }
        }
      },
    };
  },
};
