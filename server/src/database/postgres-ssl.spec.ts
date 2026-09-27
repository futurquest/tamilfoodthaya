import { postgresSslConfig } from './postgres-ssl';

describe('PostgreSQL TLS configuration', () => {
  it('preserves local plaintext connections and requires TLS on Vercel', () => {
    expect(postgresSslConfig({})).toBe(false);
    expect(postgresSslConfig({ VERCEL: '1' })).toEqual({ rejectUnauthorized: true });
  });

  it('accepts a custom CA and rejects unsafe/unknown modes', () => {
    expect(postgresSslConfig({ POSTGRES_SSL_MODE: 'require', POSTGRES_SSL_CA: 'line1\\nline2' })).toEqual({ rejectUnauthorized: true, ca: 'line1\nline2' });
    expect(() => postgresSslConfig({ POSTGRES_SSL_MODE: 'prefer' })).toThrow();
    expect(() => postgresSslConfig({ POSTGRES_SSL_MODE: 'disable', POSTGRES_SSL_CA: 'ca' })).toThrow();
  });
});
