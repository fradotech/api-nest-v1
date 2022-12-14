import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IApiResponse } from 'src/infrastructure/interfaces/responses.interface'
import { Modules } from 'src/modules/modules'
import { LoggedInGuard } from '../../auth/guards/logged-in.guard'
import { UserCrudApp } from '../apps/user.app'
import { GetUserLogged } from '../common/get-user.decorator'
import { IAppUser } from '../interfaces/user.interface'
import { UserUpdateRequest } from '../requests/user-update.request'
import { UserResponse } from '../responses/user.response'

@Controller(Modules.Profile)
@ApiTags(Modules.Profile)
@UseGuards(LoggedInGuard)
export class UserProfileController {
  constructor(private readonly UserCrudApp: UserCrudApp) {}

  @Get()
  async GetUserLogged(
    @GetUserLogged() userLogged: IAppUser,
  ): Promise<IApiResponse<UserResponse>> {
    const data = await this.UserCrudApp.findOneOrFail(userLogged.id)

    return {
      message: 'Success get data',
      data: UserResponse.fromEntity(data),
    }
  }

  @Put()
  async update(
    @Param('id') id: string,
    @Body() req: UserUpdateRequest,
  ): Promise<IApiResponse<UserResponse>> {
    const data = await this.UserCrudApp.update(id, req)

    return {
      message: 'Success get data',
      data: UserResponse.fromEntity(data),
    }
  }
}
