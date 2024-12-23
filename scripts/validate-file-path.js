import fs from 'fs';
import path from 'path';

const directories = [
  { path: './src', recursive: true },
  { path: './', recursive: false },
];

const invalidFilePath = [];
const invalidExtensions = ['.svg', '.yaml'];

function findFilesInDirectory(directory, isRecursive = true) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory() && isRecursive) {
      // Recurse into subdirectories if allowed
      findFilesInDirectory(fullPath, isRecursive);
    } else if (invalidExtensions.includes(path.extname(fullPath))) {
      invalidFilePath.push(fullPath);
    }
  });
}

function validateFilesPath() {
  directories.forEach(({ path, recursive }) => {
    if (fs.existsSync(path)) {
      console.log(`Checking directory: ${path}`);
      findFilesInDirectory(path, recursive);
    } else {
      console.log(`Directory does not exist: ${path}`);
    }
  });

  if (invalidFilePath.length === 0) return;

  console.error(
    'Error: invalid file paths found, make sure they are in the proper directories (chains or deployments):',
    invalidFilePath,
  );
  process.exit(1);
}

function main() {
  validateFilesPath();
}

main();
