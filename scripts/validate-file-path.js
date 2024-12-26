import { getFilePaths } from './utils.js';

const directories = [
  { paths: ['./src'], recursive: true },
  { paths: ['./'], recursive: false },
];

const fileExtensions = ['.svg', '.yaml'];

function main() {
  const invalidFilesPaths = directories.flatMap((directory) =>
    getFilePaths(directory.paths, fileExtensions, directory.recursive),
  );

  if (invalidFilesPaths.length === 0) return;

  console.error(
    'Error: invalid file paths found, make sure they are in the proper directories (chains or deployments):',
    invalidFilesPaths,
  );
  process.exit(1);
}

main();
