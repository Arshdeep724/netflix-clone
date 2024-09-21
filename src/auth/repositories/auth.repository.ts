import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.db';
import { CreateUserDto, LogoutUserDto, UpdateUserDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      ...payload,
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshToken(user: any) {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (user) {
        Logger.log(`User with Email ${createUserDto.email} Already exists`);
        return;
      }
      const saltRounds = 10;
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
      await tx.user.create({
        data: {
          ...createUserDto,
        },
      });
    });
  }

  async validateUser(email: string, password: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new UnauthorizedException(
          'Email Id Not Found. Enter Correct Email or Create New Account',
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (user && isPasswordValid) {
        await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            lastLogin: new Date(),
          },
        });
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          lastLogin: user.lastLogin,
          mobileNumber: user.mobileNumber,
        };
      } else throw new UnauthorizedException('Incorrect Password');
    });
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      throw new BadRequestException('Old Password Does Not Match');
    }
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async forgotPassword(email: string) {
    const resetCode = uuidv4();
    const doesUserExist = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!doesUserExist) {
      throw new BadRequestException(
        'Email Id Not Found. Enter Correct Email or Create New Account',
      );
    }
    const user = await this.prisma.user.update({
      where: {
        email: email,
      },
      data: {
        resetCode: resetCode,
      },
    });
    // mail to send reset code
    // await this.mailService.sendResetCode(user.email,user.resetCode);
  }

  async resetPassword(userId: string, resetCode: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        resetCode: true,
      },
    });
    if (!user.resetCode) {
      throw new BadRequestException('You have already Reset your Password');
    }
    if (user.resetCode !== resetCode) {
      throw new BadRequestException('Rest Code Invalid');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        resetCode: null,
      },
    });
  }

  async getUserDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        lastLogin: true,
        mobileNumber: true,
      },
    });
  }

  async updateUserDetails(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateUserDto,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        lastLogin: true,
        mobileNumber: true,
      },
    });
  }

  async logout(logoutUserDto: LogoutUserDto) {
    await this.cacheManager.set(logoutUserDto.access_token, true, 3600000);
    await this.cacheManager.set(logoutUserDto.refresh_token, true, 604800000);
  }

  async test() {
    const users = await this.prisma.user.findMany();
    return users;
  }
}