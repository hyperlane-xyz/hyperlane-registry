import fs from 'fs';
import path from 'path';
import { getFilePaths } from './utils.js';

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

  if (!fileName.endsWith('logo.svg')) invalidNameSVGs.push(filePath);

  if (stats.size > MAX_FILE_SIZE) invalidSizeSVGs.push({ filePath, fileSize: `${fileSize}KBs` });

  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (RASTER_IMAGE_REGEX.test(fileContent)) rasterImgSVGs.push(filePath);
}

function validateErrors() {
  const errorCount = invalidNameSVGs.length + invalidSizeSVGs.length + rasterImgSVGs.length;
  if (errorCount === 0) return;

  console.error(`Number of errors found: ${errorCount}`);

  if (invalidNameSVGs.length > 0)
    console.error(
      "Error: Files do not end with 'logo.svg' in the following paths:",
      invalidNameSVGs,
    );

  if (invalidSizeSVGs.length > 0)
    console.error('Error: Files size exceed 100KBs in:', invalidSizeSVGs);

  if (rasterImgSVGs.length > 0)
    console.error(
      'Error: Files contain an <image> tag, likely embedding a raster image in the following paths:',
      rasterImgSVGs,
    );

  process.exit(1);
}

function validateSvgs(paths = []) {
  paths.forEach((path) => isValidSvg(path));
  validateErrors();
}

function main() {
  const svgPaths = getFilePaths(directories, ['.svg']);
  validateSvgs(svgPaths);
}

main();
