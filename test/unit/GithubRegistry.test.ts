import { expect } from 'chai';
import sinon from 'sinon';
import JSZip from 'jszip';
import { GithubRegistry } from '../../src/registry/GithubRegistry.js';
/**
 * Testable subclass exposing protected methods for testing
 */
class TestableGithubRegistry extends GithubRegistry {
  // Expose the archive loader
  public override ensureArchiveEntries(): Promise<void> {
    return super.ensureArchiveEntries();
  }
  // Expose YAML fetcher
  public override fetchYamlFile<T>(url: string): Promise<T> {
    return super.fetchYamlFile<T>(url);
  }
  // Make fetch public for stubbing
  public override fetch(url: string): Promise<any> {
    return super.fetch(url);
  }
}

describe('GithubRegistry archive caching and YAML fetch', () => {
  let registry: TestableGithubRegistry;
  let fetchStub: sinon.SinonStub;
  const owner = 'user';
  const repo = 'repo';
  const branch = 'branch';
  const baseUri = `https://github.com/${owner}/${repo}`;
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  beforeEach(() => {
    registry = new TestableGithubRegistry({ uri: baseUri, branch });
    // Stub out rate limit check to allow archive download
    sinon.stub(registry, 'getApiRateLimit').resolves({ remaining: 1, reset: 0, limit: 1, used: 0 });
    // Stub fetch to intercept network calls
    fetchStub = sinon.stub(registry, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deduplicates parallel archive fetches via ensureArchiveEntries', async () => {
    // Prepare a zip archive with one YAML file under a top-level folder
    const zip = new JSZip();
    const root = zip.folder('root')!;
    root.file('foo.yaml', 'a: 1');
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    // Capture all fetch URLs
    const calls: string[] = [];
    fetchStub.callsFake(async (url: string) => {
      calls.push(url);
      if (url.includes(`/${owner}/${repo}/zipball/${branch}`)) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          arrayBuffer: async () => zipBuffer,
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    // Invoke ensureArchiveEntries twice in parallel
    await Promise.all([registry.ensureArchiveEntries(), registry.ensureArchiveEntries()]);
    // Should have fetched zipball exactly once (rate_limit via stubbed getApiRateLimit)
    const zipCalls = calls.filter((u) => u.includes('/zipball/'));
    expect(zipCalls).to.have.lengthOf(1);
  });

  it('fetchYamlFile parses YAML from in-memory archive buffer', async () => {
    // Create a zip archive with multiple files under a root folder
    const zip = new JSZip();
    const root = zip.folder('root')!;
    root.file('foo.yaml', 'b: 2');
    root.file('ignore.txt', 'text');
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    // Capture fetch calls and stub responses
    fetchStub.callsFake(async (url: string) => {
      if (url.includes(`/${owner}/${repo}/zipball/${branch}`)) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          arrayBuffer: async () => zipBuffer,
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    // Read the YAML file via raw content URL
    const result = await registry.fetchYamlFile<{ b: number }>(rawBase + 'foo.yaml');
    expect(result).to.deep.equal({ b: 2 });
  });
});
