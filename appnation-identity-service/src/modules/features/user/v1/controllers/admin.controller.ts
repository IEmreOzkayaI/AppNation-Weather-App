import { Body, Controller, Post, HttpCode, HttpStatus, Delete, Get, Param } from '@nestjs/common';

import { UserService } from '../user.service';
import { CreateUserDTO } from '../dto/request/create-user.dto';
import { FindByIdUserDTO } from '../dto/request/find-by-id-user.dto';
import { DeleteByIdUserDTO } from '../dto/request/delete-by-id-user.dto';

@Controller({
  version: '1',
  path: 'admin/users',
})
export class UserV1AdminController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDTO) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param() params: FindByIdUserDTO) {
    return await this.userService.findById(params);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: DeleteByIdUserDTO) {
    await this.userService.delete(params);
  }
}
