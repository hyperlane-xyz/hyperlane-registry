import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const directories = ['./chains', './deployments'];
const MAX_FILE_SIZE = 100 * 1024; // 100KBs
const RASTER_IMAGE_REGEX = /<image[^>]*>/i;

const invalidNameSVGs = [];
const invalidSizeSVGs = [];
const rasterImgSVGs = [];

function isValidSvg(filePath) {
  const fileName = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const fileSize = (stats.size / 1024).toFixed(2);

  if (!fileName.endsWith('logo.svg')) {
    invalidNameSVGs.push(filePath);
  }

  if (stats.size > MAX_FILE_SIZE) {
    invalidSizeSVGs.push({ filePath, fileSize: `${fileSize}KBs` });
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (RASTER_IMAGE_REGEX.test(fileContent)) {
    rasterImgSVGs.push(filePath);
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
      isValidSvg(fullPath);
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

function validateErrors() {
  const errorCount = invalidNameSVGs.length + invalidSizeSVGs.length + rasterImgSVGs.length;
  if (errorCount === 0) return;

  console.error(`Number of errors found: ${errorCount}`);

  if (invalidNameSVGs.length > 0) {
    console.error(
      "Error: Files do not end with 'logo.svg' in the following paths:",
      invalidNameSVGs,
    );
  }

  if (invalidSizeSVGs.length > 0) {
    console.error('Error: Files size exceed 100KBs in:', invalidSizeSVGs);
  }

  if (rasterImgSVGs.length > 0) {
    console.error(
      'Error: Files contain an <image> tag, likely embedding a raster image in the following paths:',
      rasterImgSVGs,
    );
  }

  process.exit(1);
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
        throw new Error(result.error);
      }
      fs.writeFileSync(filePath, result.data, 'utf8');
      console.log(`Optimized: ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });
}

function main() {
  const svgPaths = getSVGPaths();
  validateErrors();
  optimizeSVGs(svgPaths);
}

main();
