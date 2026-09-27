import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { AddonEntity } from '../addon/entities/addon.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { CateringOrderEntity } from '../catering/entities/catering-order.entity';
import { CateringPackageEntity } from '../catering/entities/catering-package.entity';
import { CateringQuoteEntity } from '../catering/entities/catering-quote.entity';
import { ChangeRequestEntity } from '../catering/entities/change-request.entity';
import { CouponEntity } from '../coupon/entities/coupon.entity';
import { LeadEntity } from '../lead/entities/lead.entity';
import { CategoryEntity } from '../menu/entities/category.entity';
import { MenuItemEntity } from '../menu/entities/menu-item.entity';
import { MessageEntity } from '../message/entities/message.entity';
import { NotificationLogEntity } from '../notification/entities/notification-log.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { SettingsEntity } from '../settings/entities/settings.entity';
import { postgresSslConfig } from './postgres-ssl';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: postgresSslConfig(process.env),
  entities: [
    AddonEntity, UserEntity, CateringOrderEntity, CateringPackageEntity,
    CateringQuoteEntity, ChangeRequestEntity, CouponEntity, LeadEntity,
    CategoryEntity, MenuItemEntity, MessageEntity, NotificationLogEntity,
    OrderEntity, SettingsEntity,
  ],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}').replace(/\\/g, '/')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});
