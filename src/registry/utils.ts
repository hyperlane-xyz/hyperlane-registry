import { stringify } from 'yaml';

export function toYamlString(data: any, prefix?: string): string {
  const yamlString = stringify(data);
  return prefix ? `${prefix}\n${yamlString}` : yamlString;
}
