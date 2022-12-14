import { PickType } from '@nestjs/swagger'
import { UserRequest } from '../../user/requests/user.request'

export class AuthTokenRequest extends PickType(UserRequest, ['token']) {}
