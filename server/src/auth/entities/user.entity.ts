import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomBytes } from 'crypto';

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    USER = 'user',
}

function newObjectIdLike(): string {
    return randomBytes(12).toString('hex');
}

/**
 * User entity — 1:1 from the legacy Mongo `User` collection.
 * `_id` stays a 24-hex varchar primary key so the JWT `sub`, `@Roles()`
 * guard checks and serialized profile payloads stay byte-identical to the old
 * Mongoose API — no JWT constructor or guard changes, and no client changes.
 */
@Entity('users')
export class UserEntity {
    @PrimaryColumn({ name: '_id', type: 'varchar', length: 128 })
    _id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column({ type: 'varchar', nullable: true })
    address?: string | null;

    @Column({ type: 'jsonb', nullable: true })
    eventPreferences?: string[] | null;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', length: 24, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'varchar', nullable: true })
    resetPasswordToken?: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    resetPasswordExpires?: Date | null;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', nullable: true })
    verificationPin?: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    verificationPinExpires?: Date | null;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    static newId(): string {
        return newObjectIdLike();
    }
}
