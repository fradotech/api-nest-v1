import { Injectable } from '@nestjs/common';
import { Role } from 'src/modules/user/auth/enums/role.enum';
import { IAppRole } from '../interfaces/role.interface';

const roles: IAppRole[] = [
	{
		name: Role.Administrator
	}, {
		name: Role.AdminStore
	}, {
		name: Role.AdminEmployee
	}
]

@Injectable()
export class RoleService {
	constructor(

	) {}

	async find(): Promise<IAppRole[]> {
		return roles
	}

	async findOne(name: string): Promise<IAppRole> {
		return roles.find((role) => role.name == name)
	}
}
