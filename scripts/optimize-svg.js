import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const directories = ['./chains', './deployments'];
const MAX_FILE_SIZE = 100 * 1024; // 100KBs
const RASTER_IMAGE_REGEX = /<image[^>]*>/i;

let isValid = true;

function isValidSvg(filePath) {
  const fileName = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const fileSize = (stats.size / 1024).toFixed(2);

  if (!fileName.endsWith('logo.svg')) {
    console.error(`Error: File does not end with 'logo.svg' -> ${filePath}`);
    isValid = false;
  }

  if (stats.size > MAX_FILE_SIZE) {
    console.error(`Error: File size exceeds 100KBs (Current size: ${fileSize}KB) -> ${filePath}`);
    isValid = false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (RASTER_IMAGE_REGEX.test(fileContent)) {
    console.error(
      `Error: File contains an <image> tag, likely embedding a raster image -> ${filePath}`,
    );
    isValid = false;
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
    .flatMap((directory) => findAndValidateSVGs(directory));
}

// Optimize svg in given path
function optimizeSVGs(svgPaths) {
  svgPaths.forEach((filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const result = optimize(fileContent, {
        path: filePath,
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          'removeScriptElement',
        ],
      });

      if (result.error) {
        console.error(`Error optimizing ${filePath}: ${result.error}`);
        return; // Log the error and continue with the next file
      }
      fs.writeFileSync(filePath, result.data, 'utf8');
      console.log(`Optimized: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
      // Log the error and continue with the next file
    }
  });
}

function main() {
  const svgPaths = getSVGPaths();
  if (!isValid) {
    console.error('SVGs have errors, exiting.');
    process.exit(1);
  }
  optimizeSVGs(svgPaths);
}

main();
