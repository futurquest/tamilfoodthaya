/**
 * Forwarding shim — kept solely so existing controllers importing
 * `UserRole` from './schemas/user.schema' keep compiling during the
 * Mongo -> Postgres transition. The type lives on the TypeORM entity.
 */
export { UserRole } from '../entities/user.entity';