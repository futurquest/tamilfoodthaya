import { MigrationInterface, QueryRunner } from 'typeorm';

/** The Nest API uses a direct Postgres connection, not Supabase's Data API. */
export class RestrictDataApiAccess2026092801000 implements MigrationInterface {
  name = 'RestrictDataApiAccess2026092801000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'addons', 'categories', 'catering_orders', 'catering_packages',
      'catering_quotes', 'change_requests', 'coupons', 'leads',
      'menu_items', 'messages', 'notification_logs', 'orders',
      'settings', 'users', 'typeorm_migrations',
    ];
    const roles: Array<{ rolname: string }> = await queryRunner.query(
      `SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated', 'service_role')`,
    );
    const roleList = roles.map(({ rolname }) => `"${rolname}"`).join(', ');

    for (const table of tables) {
      await queryRunner.query(`REVOKE ALL PRIVILEGES ON TABLE "public"."${table}" FROM PUBLIC`);
      if (roleList) {
        await queryRunner.query(`REVOKE ALL PRIVILEGES ON TABLE "public"."${table}" FROM ${roleList}`);
      }
    }
  }

  async down(): Promise<void> {
    throw new Error('Data API privileges must not be restored automatically.');
  }
}
