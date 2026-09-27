export function postgresSslConfig(env: NodeJS.ProcessEnv): false | { rejectUnauthorized: true; ca?: string } {
  const mode = env.POSTGRES_SSL_MODE || (env.VERCEL === '1' ? 'require' : 'disable');
  if (mode === 'disable') {
    if (env.POSTGRES_SSL_CA) throw new Error('POSTGRES_SSL_CA requires POSTGRES_SSL_MODE=require');
    return false;
  }
  if (mode !== 'require') throw new Error('POSTGRES_SSL_MODE must be disable or require');
  const ca = env.POSTGRES_SSL_CA?.replace(/\\n/g, '\n');
  return ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: true };
}
