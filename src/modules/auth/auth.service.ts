import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in';

@Injectable()
export class AuthService {
  signIn(dto: SignInDto) {
    return 'This action adds a new auth';
  }
}
