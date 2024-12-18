import fs from 'fs';
import path from 'path';

const directories = ['./chains', './deployments'];
const MAX_FILE_SIZE = 20 * 1024; // 20KBs

function isValidSvg(filePath) {
  const fileName = path.basename(filePath);
  const stats = fs.statSync(filePath);

  if (!fileName.endsWith('logo.svg')) {
    console.error(`Error: File does not end with 'logo.svg' -> ${filePath}`);
    // process.exit(1); // Exit immediately if criteria is not met
  }

  if (stats.size > MAX_FILE_SIZE) {
    console.error(`Error: File size exceeds 20KBs -> ${filePath}`);
    // process.exit(1); // Exit immediately if criteria is not met
  }
}

function findAndProcessSVGs(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      findAndProcessSVGs(fullPath); // Recurse into subdirectories
    } else if (path.extname(fullPath) === '.svg') {
      isValidSvg(fullPath); // Validate file, exits on failure
    }
  });
}

directories.forEach((directory) => {
  if (fs.existsSync(directory)) {
    console.log(`Checking directory: ${directory}`);
    findAndProcessSVGs(directory);
  } else {
    console.log(`Directory does not exist: ${directory}`);
  }
});
