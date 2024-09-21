import { IsOptional, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  resetCode: string;

  @IsString()
  @IsOptional()
  new_password: string;

  @IsString()
  @IsOptional()
  old_password: string;
}
