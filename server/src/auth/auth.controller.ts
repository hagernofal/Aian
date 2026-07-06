import { Body, 
  ClassSerializerInterceptor, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  UseInterceptors
 } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { UserEntity } from '../users/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('register')
  async signUp(@Body() body:CreateUserDto){
    const {fullName,email,password}= body
    const user= await this.authService.SignUp(fullName,email,password);
    return {user:new UserEntity(user)};
  }

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async SignIn(@Body() body:SignInDto){
    const {email,password}= body
    const {user,access_token}= await this.authService.SignIn(email,password);
    return{access_token,user}
  }
}
