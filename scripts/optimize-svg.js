import fs from 'fs';
import { optimize } from 'svgo';
import { getFilePaths } from './utils.js';

const directories = ['./chains', './deployments'];

// Optimize svg in given paths
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
  const svgPaths = getFilePaths(directories, ['.svg']);
  optimizeSVGs(svgPaths);
}

main();
