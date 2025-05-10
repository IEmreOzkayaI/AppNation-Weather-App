import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { DatabaseService } from 'src/modules/shared/database/database.service';
import { CreateUserDTO } from './dto/request/create-user.dto';
import { Role } from '@prisma/client';
import { FindByIdUserDTO } from './dto/request/find-by-id-user.dto';
import { DeleteByIdUserDTO } from './dto/request/delete-by-id-user.dto';
import { tryCatch } from 'src/commons/utils/try-catch.util';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateUserDTO) {
    const existingAccount = await this.databaseService.userAccount.findUnique({
      where: { deviceId: dto.deviceId },
    });
    if (existingAccount) throw new ConflictException('User account already exists with this device ID.');

    const createdAccount = await this.databaseService.account.create({
      data: {
        role: Role.USER,
        userAccount: {
          create: {
            deviceId: dto.deviceId,
            applicationSignature: dto.applicationSignature,
          },
        },
      },
      include: {
        userAccount: {
          select: {
            id: true,
            deviceId: true,
          },
        },
      },
    });

    if (!createdAccount.userAccount) throw new InternalServerErrorException('User account could not be created or retrieved alongside the account.');

    return createdAccount.userAccount;
  }
  async findAll() {
    const accounts = await this.databaseService.userAccount.findMany({
      include: {
        account: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!accounts.length) throw new NotFoundException('No user accounts found.');

    return accounts;
  }
  async findById(params: FindByIdUserDTO) {
    const account = await this.databaseService.userAccount.findUnique({
      where: { id: params.id },
      include: {
        account: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!account) throw new NotFoundException('User account not found.');

    return account;
  }
  async delete(params: DeleteByIdUserDTO) {
    const [error, response] = await tryCatch(this.databaseService.userAccount.delete({ where: { id: params.id } }));
    if (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User account not found.');
      } else {
        throw new InternalServerErrorException('An error occurred while deleting the user account.');
      }
    }

    return response;
  }
}
