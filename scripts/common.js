import fs from 'fs';
import path from 'path';

function findFiles(directory, fileTypes = [], isRecursive = true) {
  const files = fs.readdirSync(directory);

  return files.flatMap((file) => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory() && isRecursive) {
      return findFiles(fullPath, fileTypes); // Recurse into subdirectories
    } else if (fileTypes.includes(path.extname(fullPath))) {
      return fullPath;
    }

    return [];
  });
}

// Get all fille paths for given directorie and given file types
export function getFilePaths(directories = [], fileTypes = [], isRecursive = true) {
  return directories
    .filter((directory) => {
      if (fs.existsSync(directory)) {
        console.log(`Checking directory: ${directory}`);
        return true;
      } else {
        console.log(`Directory does not exist: ${directory}`);
        return false;
      }
    })
    .flatMap((directory) => findFiles(directory, fileTypes, isRecursive));
}
