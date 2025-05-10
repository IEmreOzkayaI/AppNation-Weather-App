import { Injectable, UnauthorizedException, ForbiddenException, InternalServerErrorException, ConflictException, NotFoundException, Inject, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { SignInAdminDTO } from './dto/request/sign-in-admin.dto';
import { SignUpAdminDTO } from './dto/request/sign-up-admin.dto';
import { DatabaseService } from 'src/modules/shared/database/database.service';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';
import { Response } from 'express';
import { fifteenMinutes, thirtyDays } from './commons/token.const';
import { SignInUserDTO } from './dto/request/sign-in-user.dto';
import { compareHash, hashData } from 'src/commons/utils/hash.util';
import { ENV } from 'src/modules/shared/env/env.module';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    @Inject(ENV.KEY) private readonly envService: ConfigType<typeof ENV>,
  ) {}

  // --- Admin Authentication ---
  async adminSignIn(dto: SignInAdminDTO, res: Response) {
    const adminAccount = await this.databaseService.adminAccount.findUnique({
      where: { email: dto.email },
      include: { account: { select: { id: true, role: true } } },
    });

    if (!adminAccount || !adminAccount.account) throw new UnauthorizedException('Invalid email.');

    const passwordMatches = await compareHash(dto.password, adminAccount.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password.');

    const roleForToken = adminAccount.account.role.toString();
    const tokens = await this.generateTokens(adminAccount.id, adminAccount.email, roleForToken);

    await this.updateAdminRefreshTokenHash(adminAccount.id, tokens.refreshToken);

    this.setCookies(res, tokens.accessToken, tokens.refreshToken, adminAccount.id);
    return adminAccount;
  }

  async adminSignUp(dto: SignUpAdminDTO) {
    const existingAdminByEmail = await this.databaseService.adminAccount.findUnique({
      where: { email: dto.email },
    });
    if (existingAdminByEmail) throw new ConflictException('Admin account already exists with this email.');

    const hashedPassword = await hashData(dto.password);

    const createdAccount = await this.databaseService.account.create({
      data: { role: Role.ADMIN, adminAccount: { create: { email: dto.email, passwordHash: hashedPassword } } },
      include: { adminAccount: { select: { id: true, email: true } } },
    });

    if (!createdAccount.adminAccount) throw new InternalServerErrorException('Admin account could not be created or retrieved alongside the account.');

    return createdAccount.adminAccount;
  }

  async adminSignOut(accountId: string, res: Response) {
    const adminAccount = await this.databaseService.adminAccount.updateMany({
      where: { id: accountId, refreshTokenHash: { not: null } },
      data: { refreshTokenHash: null },
    });
    if (adminAccount.count === 0) throw new NotFoundException('No valid refresh token session found.');

    this.clearCookies(res);
    return { accountId: accountId };
  }

  async adminRefreshToken(accountId: string, refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing. Please log in again.');
    }

    const adminAccount = await this.databaseService.adminAccount.findFirst({
      where: { id: accountId },
      include: { account: { select: { role: true } } },
    });

    if (!adminAccount || !adminAccount.refreshTokenHash) {
      throw new ForbiddenException('No active session found. Please log in again.');
    }

    const rtMatches = await compareHash(refreshToken, adminAccount.refreshTokenHash);
    if (!rtMatches) {
      throw new ForbiddenException('Refresh token is invalid or has expired.');
    }

    const roleForToken = adminAccount.account.role.toString();
    const tokens = await this.generateTokens(adminAccount.id, adminAccount.email, roleForToken);

    await this.updateAdminRefreshTokenHash(adminAccount.id, tokens.refreshToken);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken, adminAccount.id);

    return { message: 'Session refreshed successfully.' };
  }

  // --- User Authentication ---
  async userSignIn(dto: SignInUserDTO, res: Response) {
    const userAccount = await this.databaseService.userAccount.findUnique({
      where: { deviceId: dto.deviceId, applicationSignature: dto.applicationSignature },
      include: { account: { select: { id: true, role: true } } },
    });
    if (!userAccount) throw new UnauthorizedException('Invalid credentials');

    if (dto.deviceId !== userAccount.deviceId || dto.applicationSignature !== userAccount.applicationSignature) throw new UnauthorizedException('Invalid credentials');
    const roleForToken = userAccount.account.role.toString();
    const accessToken = await this.generateAccessToken(userAccount.id, userAccount.deviceId, roleForToken);

    return {userAccount, accessToken};
  }

  // --- Helpers ---
  private setCookies(res: Response, accessToken?: string, refreshToken?: string, account_id?: string) {
    const isProduction = this.envService.NODE_ENV === 'production';

    if (accessToken) {
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        path: '/',
        maxAge: fifteenMinutes,
        sameSite: 'lax',
      });
    }
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        path: '/v1/admin/auth/refresh',
        maxAge: thirtyDays,
        sameSite: 'lax',
      });
    }

    if (account_id) {
      res.cookie('account_id', account_id, {
        httpOnly: true,
        secure: isProduction,
        path: '/v1/admin/auth/refresh',
        maxAge: thirtyDays,
        sameSite: 'lax',
      });
    }
  }

  private clearCookies(res: Response) {
    const isProduction = this.envService.NODE_ENV === 'production';
    res.clearCookie('access_token', { httpOnly: true, secure: isProduction, path: '/', sameSite: 'lax' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProduction, path: '/api/v1/admin/auth/refresh', sameSite: 'lax' });
    res.clearCookie('account_id', { httpOnly: true, secure: isProduction, path: '/api/v1/admin/auth/refresh', sameSite: 'lax' });
  }

  private async generateTokens(userId: string, username: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(userId, username, role);

    const refreshToken = crypto.randomBytes(32).toString('hex');

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(userId: string, username: string, role: string) {
    try {
      const privateKeyPath = path.join(process.cwd(), 'private.pem');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      return await this.jwtService.signAsync(
        { sub: userId, username, role },
        {
          secret: privateKey,
          algorithm: 'RS256',
          expiresIn: this.envService.JWT_ACCESS_EXPIRATION_TIME,
        },
      );
    } catch (error) {
      console.error('JWT signing error:', error);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  private async updateAdminRefreshTokenHash(adminId: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await hashData(refreshToken) : null;
    await this.databaseService.adminAccount.update({
      where: { id: adminId },
      data: { refreshTokenHash: hashedRefreshToken },
    });
  }
}
