import fs from 'fs';
import path from 'path';

const directories = ['./chains', './deployments'];
const MAX_FILE_SIZE = 100 * 1024; // 100KBs
const RASTER_IMAGE_REGEX = /<image[^>]*>/i;

function isValidSvg(filePath) {
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

  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (RASTER_IMAGE_REGEX.test(fileContent)) {
    console.error(
      `Error: File contains an <image> tag, likely embedding a raster image -> ${filePath}`,
    );
    process.exit(1);
  }
}

// Finds all svgs, validates and return all paths found that has svgs
function findAndValidateSVGs(directory) {
  const files = fs.readdirSync(directory);

  return files.flatMap((file) => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      return findAndValidateSVGs(fullPath); // Recurse into subdirectories
    } else if (path.extname(fullPath) === '.svg') {
      isValidSvg(fullPath); // Validate file, exits on failure
      return fullPath;
    }

    return [];
  });
}

// Get all svg paths that are validated
function getSVGPaths() {
  const svgPaths = directories
    .filter((directory) => {
      if (fs.existsSync(directory)) {
        console.log(`Checking directory: ${directory}`);
        return true;
      } else {
        console.log(`Directory does not exist: ${directory}`);
        return false;
      }
    })
    .flatMap((directory) => findAndValidateSVGs(directory));

  return svgPaths;
}

// Optimize svg in given path
function optimizeSVGs(svgPaths) {
  console.log('Paths', svgPaths);
}

function main() {
  const svgPaths = getSVGPaths();
  optimizeSVGs(svgPaths);
}

main();
