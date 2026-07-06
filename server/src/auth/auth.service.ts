import { BadRequestException, ClassSerializerInterceptor, Injectable, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService:UsersService,
        private readonly prismaService:PrismaService,
        private readonly jwtService:JwtService
    ){}

    async SignUp(fullName:string, email:string, password:string){
        const existedUser= await this.usersService.findOneByEmail(email);
        if(existedUser){
            throw new BadRequestException({
                success:false,
                error:'user is already exist'
            })
        }

        const passwordHash=await bcrypt.hash(password,10);
        const user= await this.usersService.create(fullName,email,passwordHash);
        return user;
    }

    async SignIn(email:string, password:string){
        const existedUser= await this.usersService.findOneByEmail(email);
        if(!existedUser){
            throw new UnauthorizedException({
                success:false,
                error:'invalid email or password'
            })
        }

        const isMatched= await bcrypt.compare(password, existedUser.passwordHash as string)
        if(!isMatched){
            throw new UnauthorizedException({
                success:false,
                error:'invalid email or password'
            })
        }

        let user={
            id:existedUser.id,
            email:existedUser.email,
            fullName:existedUser.fullName
        }
        const access_token= await this.jwtService.signAsync(user);
        return {user,access_token} 
    }
}
