import { isSecureProductionRequest, productionHttpConfig } from './production-http-config';

describe('production HTTP configuration', () => {
  const valid = { CLIENT_URL: 'https://www.example.test', PUBLIC_API_URL: 'https://api.example.test', TRUST_PROXY_CIDRS: 'loopback' };

  it('requires HTTPS origins and a narrowly trusted proxy', () => {
    expect(productionHttpConfig(valid)).toEqual({ clientOrigin: valid.CLIENT_URL, publicApiOrigin: valid.PUBLIC_API_URL, trustedProxies: 'loopback' });
    expect(() => productionHttpConfig({ ...valid, CLIENT_URL: 'http://www.example.test' })).toThrow();
    expect(() => productionHttpConfig({ ...valid, PUBLIC_API_URL: 'https://api.example.test/path' })).toThrow();
    expect(() => productionHttpConfig({ ...valid, TRUST_PROXY_CIDRS: '0.0.0.0/0' })).toThrow();
    expect(() => productionHttpConfig({ ...valid, TRUST_PROXY_CIDRS: 'loopback,0.0.0.0/0' })).toThrow();
  });

  it('uses Vercel ingress protocol without broad Express proxy trust', () => {
    expect(productionHttpConfig({ ...valid, VERCEL: '1', TRUST_PROXY_CIDRS: undefined }).trustedProxies).toBe('');
    const request = { secure: false, path: '/api/v1/orders/webhook/stripe', headers: { 'x-forwarded-proto': 'https' }, socket: { remoteAddress: '10.0.0.1' } };
    expect(isSecureProductionRequest({ VERCEL: '1' }, request)).toBe(true);
    expect(isSecureProductionRequest({ VERCEL: '1' }, { ...request, headers: { 'x-forwarded-proto': 'http' } })).toBe(false);
    expect(isSecureProductionRequest({}, request)).toBe(false);
  });
});
