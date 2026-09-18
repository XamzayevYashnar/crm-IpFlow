import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in';
import { BaseService } from '../../core/service/base.service';
import { Crypt } from '../../infrastructure/lib/Crypt';

@Injectable()
export class AuthService extends BaseService {
  async signIn(dto: SignInDto) {
    const user = await this.existsEmail(dto.email);

    await Crypt.compare(user.password, dto.password);
  }
}
