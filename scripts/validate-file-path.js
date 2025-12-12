import { getFilePaths } from './utils.js';

const directories = [
  { paths: ['./src'], recursive: true },
  { paths: ['./'], recursive: false },
];

const fileExtensions = ['.svg', '.yaml'];

// Files that are allowed in the root directory
const allowedRootFiles = ['pnpm-lock.yaml'];

function main() {
  const invalidFilesPaths = directories
    .flatMap((directory) => getFilePaths(directory.paths, fileExtensions, directory.recursive))
    .filter((filePath) => !allowedRootFiles.includes(filePath.replace('./', '')));

  if (invalidFilesPaths.length === 0) return;

  console.error(
    'Error: invalid file paths found, make sure they are in the proper directories (chains or deployments):',
    invalidFilesPaths,
  );
  process.exit(1);
}

main();
