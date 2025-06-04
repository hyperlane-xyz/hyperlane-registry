import { getRegistry } from '../../fs/registry-utils.js';
import type { IRegistry } from '../../registry/IRegistry.js';
import { HttpServer } from '../HttpServer.js';

const main = async () => {
  // Get registry path from command line arguments.
  // Default to the current working directory if no argument is provided.
  const registryPathFromArg = process.argv[2];
  const defaultPath = process.cwd();
  const registryPath = registryPathFromArg || defaultPath;

  // eslint-disable-next-line no-console
  console.log(`Using registry path: ${registryPath}`);

  const registry = async (): Promise<IRegistry> => {
    return getRegistry({
      registryUris: [registryPath],
      enableProxy: false,
    });
  };

  const server = new HttpServer(registry);

  try {
    await server.start();
  } catch (error) {
    process.exit(1);
  }
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled critical error in server execution script:', error);
  process.exit(1);
});
