import { 
  Body, 
  ClassSerializerInterceptor, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  NotFoundException, 
  Post, 
  UseGuards, 
  UseInterceptors
 } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { UserEntity } from '../users/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGaurd } from './auth.gaurd';
import { User } from '@prisma/client';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ){}

  @Post('register')
  async signUp(@Body() body:CreateUserDto){
    const {fullName,email,password,confirmPassword}= body
    const user= await this.authService.SignUp(fullName,email,password,confirmPassword);
    return {user:new UserEntity(user)};
  }

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async SignIn(@Body() body:SignInDto){
    const {email,password}= body
    const {user,access_token,refresh_token}= await this.authService.SignIn(email,password);
    return{access_token,refresh_token,user}
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGaurd)
  async LogOut(@CurrentUser() user:UserEntity){
    await this.authService.logOut(user.id);
    return;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { userId: string, refreshToken: string }) {
    return this.authService.checkRefreshTokens(body.userId, body.refreshToken);
  }
}
