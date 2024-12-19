import fs from 'fs';
import path from 'path';

const directories = ['./chains', './deployments'];
const MAX_FILE_SIZE = 100 * 1024; // 100KBs
const RASTER_IMAGE_REGEX = /<image[^>]*>/i;

function isValidSvg(filePath, fileContent) {
  const fileName = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const currentFileSize = (stats.size / 1024).toFixed(2);

  if (!fileName.endsWith('logo.svg')) {
    console.error(`Error: File does not end with 'logo.svg' -> ${filePath}`);
    process.exit(1);
  }

  if (stats.size > MAX_FILE_SIZE) {
    console.error(
      `Error: File size exceeds 100KBs (Current size: ${currentFileSize}KB) -> ${filePath}`,
    );
    process.exit(1);
  }

  if (RASTER_IMAGE_REGEX.test(fileContent)) {
    console.error(
      `Error: File contains an <image> tag, likely embedding a raster image -> ${filePath}`,
    );
    process.exit(1);
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
      const content = fs.readFileSync(fullPath, 'utf8');
      isValidSvg(fullPath, content); // Validate file, exits on failure
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
