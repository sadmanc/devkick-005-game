import { describe, expect, it } from 'vitest';
import { corsHeaders, nodeHandler } from '../server/otter.js';

function fakeRes() {
  return {
    headers: {},
    statusCode: 200,
    body: '',
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(b = '') { this.body = b; },
  };
}

describe('CORS for the native app', () => {
  it('allows the app web views and nobody else', () => {
    expect(corsHeaders('capacitor://localhost')['access-control-allow-origin']).toBe('capacitor://localhost');
    expect(corsHeaders('https://localhost')['access-control-allow-origin']).toBe('https://localhost');
    expect(corsHeaders('https://evil.example')).toEqual({});
    expect(corsHeaders(undefined)).toEqual({});
  });
  it('answers the preflight with 204 and the allow headers', async () => {
    const res = fakeRes();
    await nodeHandler({ method: 'OPTIONS', headers: { origin: 'capacitor://localhost' } }, res, {});
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });
  it('still rejects other methods', async () => {
    const res = fakeRes();
    await nodeHandler({ method: 'GET', headers: {} }, res, {});
    expect(res.statusCode).toBe(405);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
