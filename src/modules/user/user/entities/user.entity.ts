import * as bcrypt from 'bcrypt';
import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { Role } from 'src/modules/user/auth/enums/role.enum';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity
} from 'typeorm';
import { IAppRole } from '../../role/interfaces/role.interface';
import { IAppUser } from '../interfaces/user.interface';

@Entity()
export class AppUser extends BaseEntity implements IAppUser {
	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: Role, default: Role.AdminEmployee })
	role: IAppRole;

	@Column({ default: null })
	address: string;

	@Column({ default: null, unique: true })
	phoneNumber: string;

	@Column({ default: null, unique: true })
	avatar: string;

	@Column({ default: null })
	otp: number

	@Column({ default: null })
	_accessToken?: string;

	@Column({ default: false })
	isVerified: boolean

	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 10);
	}
}
