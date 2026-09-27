export interface ProductionHttpConfig {
  clientOrigin: string;
  publicApiOrigin: string;
  trustedProxies: string;
}

function httpsOrigin(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} must be configured for production`);
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`${name} must be an HTTPS origin`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS origin without a path, query, or credentials`);
  }
  return url.origin;
}

export function productionHttpConfig(env: NodeJS.ProcessEnv): ProductionHttpConfig {
  const clientOrigin = httpsOrigin(env.CLIENT_URL, 'CLIENT_URL');
  const publicApiOrigin = httpsOrigin(env.PUBLIC_API_URL, 'PUBLIC_API_URL');
  if (env.VERCEL === '1') return { clientOrigin, publicApiOrigin, trustedProxies: '' };
  const trustedProxies = env.TRUST_PROXY_CIDRS?.trim();
  const proxies = trustedProxies?.split(',').map(value => value.trim()) || [];
  if (!proxies.length || proxies.some(value => !value || /^(true|false|\*|0\.0\.0\.0\/0|::\/0|\d+)$/i.test(value))) {
    throw new Error('TRUST_PROXY_CIDRS must name only the private reverse-proxy subnet or address');
  }
  return { clientOrigin, publicApiOrigin, trustedProxies: proxies.join(',') };
}

export function isSecureProductionRequest(
  env: NodeJS.ProcessEnv,
  req: { secure: boolean; path: string; headers: Record<string, unknown>; socket: { remoteAddress?: string } },
): boolean {
  if (env.VERCEL === '1') return req.headers['x-forwarded-proto'] === 'https';
  return req.secure || (req.path === '/api/v1/health'
    && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || ''));
}
