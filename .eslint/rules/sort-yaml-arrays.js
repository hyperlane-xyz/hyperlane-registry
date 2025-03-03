import YAML from 'yaml';

// Sort array by the specified key
function sortArrayByKey(array, sortKey) {
  return [...array].sort((a, b) => {
    if (a[sortKey] && b[sortKey]) {
      return a[sortKey].localeCompare(b[sortKey]);
    }
    return 0;
  });
}

// Process object based on sort configuration
function processObjectWithConfig(data, sortConfig) {
  if (!data || typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => processObjectWithConfig(item, sortConfig));
  }

  let result = { ...data };

  // Process each array configuration
  sortConfig.arrays.forEach((arrayConfig) => {
    const { path, sortKey } = arrayConfig;
    const pathParts = path.split('.');

    // Helper function to traverse and sort nested objects
    function traverseAndSort(obj, parts) {
      if (!obj || typeof obj !== 'object') return obj;

      if (parts.length === 1) {
        const key = parts[0];
        if (obj[key] && Array.isArray(obj[key])) {
          const newObj = { ...obj };
          newObj[key] = sortArrayByKey(obj[key], sortKey);
          return newObj;
        }
        return obj;
      }

      const [current, ...rest] = parts;

      if (Array.isArray(obj)) {
        return obj.map((item) => traverseAndSort(item, parts));
      }

      if (obj[current]) {
        const newObj = { ...obj };
        newObj[current] = traverseAndSort(obj[current], rest);
        return newObj;
      }

      return obj;
    }

    result = traverseAndSort(result, pathParts);
  });

  // Recursively process all nested objects and arrays
  Object.keys(result).forEach((key) => {
    if (typeof result[key] === 'object') {
      result[key] = processObjectWithConfig(result[key], sortConfig);
    }
  });

  return result;
}

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Sort YAML arrays based on specified keys',
      category: 'Stylistic Issues',
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          arrays: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                sortKey: { type: 'string' },
              },
              required: ['path', 'sortKey'],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] || {};
    const sortConfig = {
      arrays: options.arrays || [],
    };

    return {
      // This targets YAML documents
      Program(node) {
        // Only process YAML files
        if (!context.filename.endsWith('.yaml') && !context.filename.endsWith('.yml')) {
          return;
        }

        try {
          const yamlText = sourceCode.getText();
          const yamlData = YAML.parse(yamlText);

          if (!yamlData) return;

          // Sort the data according to configuration
          const sortedData = processObjectWithConfig(yamlData, sortConfig);

          // Check if the data has changed
          const sortedYaml = YAML.stringify(sortedData);
          const originalYaml = YAML.stringify(yamlData);

          if (sortedYaml !== originalYaml) {
            // Report the issue and provide a fix
            context.report({
              node,
              message: 'YAML arrays should be sorted by specified keys',
              fix(fixer) {
                // Create a new YAML document to preserve comments and formatting
                const doc = new YAML.Document();
                doc.contents = sortedData;
                return fixer.replaceText(node, doc.toString());
              },
            });
          }
        } catch (error) {
          // If there's an error in processing, report it but don't try to fix
          context.report({
            node,
            message: `Error processing YAML: ${error.message}`,
          });
        }
      },
    };
  },
};
