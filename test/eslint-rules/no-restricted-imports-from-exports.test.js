import rule from '../../eslint-rules/rules/no-restricted-imports-from-exports.js';
import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import sinon from 'sinon';

describe('no-restricted-imports-from-exports rule', () => {
  // Mock file contents to simulate index exports
  const exportedFileContents = {
    './src/index.ts':
      "export { componentA } from './components/componentA';\nexport { componentB } from './components/componentB';",
    './src/index-fs.ts': "export { fileUtil } from './utils/fileUtil';",
  };

  // Path mapping for test fixtures
  const pathMappings = {
    './src/index.ts': './src/index.ts',
    './src/index-fs.ts': './src/index-fs.ts',

    'components/componentA': './src/components/componentA',
    'components/componentB': './src/components/componentB',
    'components/nested/componentA': './src/components/nested/componentA',

    'utils/fileUtil': './src/utils/fileUtil',
    'utils/otherUtil': './src/utils/otherUtil',
  };

  function setupStubs() {
    // Stub fs.readFileSync to return mock file contents
    sinon.stub(fs, 'readFileSync').callsFake((filePath) => exportedFileContents[filePath] || '');

    // Stub path.resolve to simplify path resolution in tests
    sinon.stub(path, 'resolve').callsFake(function () {
      const lastArg = arguments[arguments.length - 1];

      if (typeof lastArg !== 'string') {
        return lastArg;
      }

      for (const [pattern, mapping] of Object.entries(pathMappings)) {
        if (lastArg.includes(pattern)) {
          return mapping;
        }
      }

      return lastArg;
    });

    sinon
      .stub(path, 'dirname')
      .callsFake((filePath) => filePath.substring(0, filePath.lastIndexOf('/') || 0));
  }

  // Helper function to test import validations in different scenarios
  function verifyImport({ sourceFile, importPath, expectedError = null, shouldPass = false }) {
    const errors = [];
    const context = {
      getFilename: () => sourceFile,
      cwd: () => '.',
      report: (err) => errors.push(err),
    };

    rule.create(context).ImportDeclaration({ source: { value: importPath } });

    if (expectedError || !shouldPass) {
      expect(errors.length).to.equal(
        1,
        `Import from ${sourceFile} to ${importPath} should report an error`,
      );
      if (expectedError) {
        expect(errors[0].messageId).to.equal(
          expectedError,
          `Import should report error type ${expectedError}`,
        );
      }
    } else {
      expect(errors.length).to.equal(
        0,
        `Import from ${sourceFile} to ${importPath} should not report any errors`,
      );
    }
  }

  beforeEach(() => {
    setupStubs();
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe('Non-exported files - Files not included in index exports', () => {
    it('should allow importing node modules in non-exported files', () => {
      verifyImport({
        sourceFile: './src/other.ts',
        importPath: 'fs',
        shouldPass: true,
      });
    });

    it('should allow importing any modules in non-exported files without restrictions', () => {
      const sourceFile = './src/other.ts';

      verifyImport({
        sourceFile,
        importPath: './components/other',
        shouldPass: true,
      });

      verifyImport({
        sourceFile,
        importPath: './utils/fileUtil',
        shouldPass: true,
      });

      verifyImport({
        sourceFile,
        importPath: 'path',
        shouldPass: true,
      });
    });
  });

  describe('Exported files - Files that are exported through index.ts', () => {
    const exportedComponentFile = './src/components/componentA.ts';

    it('should allow importing regular modules from exported files', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: './components/other',
        shouldPass: true,
      });
    });

    it('should disallow importing node modules from exported files to prevent side effects', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'fs',
        expectedError: 'restrictedNodeImport',
      });

      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'path',
        expectedError: 'restrictedNodeImport',
      });

      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'crypto',
        expectedError: 'restrictedNodeImport',
      });
    });

    it('should disallow importing from fs-indexed modules in exported components', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: './utils/fileUtil',
        expectedError: 'restrictedFsImport',
      });
    });

    it('should handle relative imports correctly and detect restricted fs imports', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: '../utils/fileUtil',
        expectedError: 'restrictedFsImport',
      });
    });

    it('should allow importing scoped packages even from exported components', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: '@scoped/fs-module',
        shouldPass: true,
      });
    });

    it('should allow files exported from index-fs.ts to import node modules directly', () => {
      const fileUtilPath = './src/utils/fileUtil.ts';

      verifyImport({
        sourceFile: fileUtilPath,
        importPath: 'fs',
        shouldPass: true,
      });

      verifyImport({
        sourceFile: fileUtilPath,
        importPath: 'crypto',
        shouldPass: true,
      });
    });
  });

  describe('Edge cases', () => {
    const exportedComponentFile = './src/components/componentA.ts';

    it('should handle subpaths of node modules correctly and restrict them in exported files', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'fs/promises',
        expectedError: 'restrictedNodeImport',
      });

      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'path/posix',
        expectedError: 'restrictedNodeImport',
      });
    });

    it('should allow similarly named packages that are not actual node modules', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'fstest',
        shouldPass: true,
      });

      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'fs-test',
        shouldPass: true,
      });

      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: 'path-extra',
        shouldPass: true,
      });
    });

    it('should handle non-existent files gracefully without throwing errors', () => {
      verifyImport({
        sourceFile: exportedComponentFile,
        importPath: './non-existent-file',
        shouldPass: true,
      });
    });
  });
});
