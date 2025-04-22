import { expect } from 'chai';
import YAML from 'yaml';
import sortYamlArraysRule from '../../.eslint/rules/sort-yaml-arrays.js';

describe('sort-yaml-arrays rule', () => {
  function testSorting(input: string, expected: string, config: any) {
    const inputData = YAML.parse(input);

    const context = createMockContext(input, config);

    const ruleInstance = sortYamlArraysRule.create(context);

    let sortedData: any;
    context.report = ({ fix }: { fix: (fixer: any) => { text: string } }) => {
      const fixer = {
        replaceText: (_: any, text: string) => {
          sortedData = YAML.parse(text);
          return { text };
        },
      };
      fix(fixer);
    };

    // Run the rule on our input
    ruleInstance.Program({});

    if (!sortedData) {
      sortedData = inputData;
    }

    // Convert back to YAML for comparison
    const sortedYaml = YAML.stringify(sortedData);
    const expectedYaml = YAML.stringify(YAML.parse(expected));

    expect(sortedYaml).to.equal(expectedYaml);
  }

  function createMockContext(content: string, config: any, filename = 'test.yaml') {
    return {
      sourceCode: { getText: () => content },
      options: [config],
      filename,
      report: (_arg: any) => {},
    };
  }

  describe('array sorting functionality', () => {
    const testCases = [
      {
        name: 'sort arrays by chainName',
        input: `
          tokens:
            - chainName: ethereum
              symbol: USDT
            - chainName: arbitrum
              symbol: USDT
          `,
        expected: `
          tokens:
            - chainName: arbitrum
              symbol: USDT
            - chainName: ethereum
              symbol: USDT
          `,
        config: {
          arrays: [{ path: 'tokens', sortKey: 'chainName' }],
        },
      },
      {
        name: 'sort nested connections by token',
        input: `
          tokens:
            - chainName: ethereum
              symbol: USDT
            - chainName: arbitrum
              symbol: USDT
              connections:
                - token: USDT
                - token: AAVE
          `,
        expected: `
          tokens:
            - chainName: arbitrum
              symbol: USDT
              connections:
                - token: AAVE
                - token: USDT
            - chainName: ethereum
              symbol: USDT
          `,
        config: {
          arrays: [
            { path: 'tokens', sortKey: 'chainName' },
            { path: 'tokens[].connections', sortKey: 'token' },
          ],
        },
      },
      {
        name: 'sort arrays with wildcard paths',
        input: `
      items:
        group1:
          list:
            - name: b
            - name: a
        group2:
          list:
            - name: d
            - name: c
      `,
        expected: `
      items:
        group1:
          list:
            - name: a
            - name: b
        group2:
          list:
            - name: c
            - name: d
      `,
        config: {
          arrays: [{ path: 'items.*.list', sortKey: 'name' }],
        },
      },
      {
        name: 'handle missing sort keys gracefully',
        input: `
      array:
        - id: 1
        - name: foo
          id: 2
      `,
        expected: `
      array:
        - id: 1
        - name: foo
          id: 2
      `,
        config: {
          arrays: [{ path: 'array', sortKey: 'name' }],
        },
      },
    ];

    // Run all test cases
    testCases.forEach(({ name, input, expected, config }) => {
      it(`should ${name}`, () => {
        testSorting(input, expected, config);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty documents', () => {
      const input = '';
      const expected = '';
      const config = {
        arrays: [{ path: 'tokens', sortKey: 'chainName' }],
      };

      expect(() => testSorting(input, expected, config)).not.to.throw();
    });

    it('should handle invalid YAML gracefully', () => {
      let reportedError = '';

      const context = {
        sourceCode: {
          getText: () => `
              invalid: yaml: structure:
                - 
                  : 
              `,
        },
        options: [{ arrays: [{ path: 'array', sortKey: 'name' }] }],
        filename: 'test.yaml',
        report: ({ message }: { message: string }) => {
          reportedError = message;
        },
      };

      sortYamlArraysRule.create(context).Program({});

      expect(reportedError).to.include('Error processing YAML');
    });

    it('should ignore non-YAML files', () => {
      const context = createMockContext(
        'Not a YAML file',
        { arrays: [{ path: 'array', sortKey: 'name' }] },
        'test.js',
      );

      const result = sortYamlArraysRule.create(context).Program({});

      expect(result).to.be.undefined;
    });
  });
});
