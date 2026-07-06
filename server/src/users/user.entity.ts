import { User, UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  id: string;
  fullName: string;
  email: string;

  @Exclude() 
  passwordHash: string | null;
  refreshTokenHash: string | null
  
  emailVerifiedAt: Date | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}