import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User } from 'src/users/user.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register(user: RegisterAuthDto) {
    const { email, phone } = user;

    const emailExist = await this.userRepository.findOneBy({ email });

    if (emailExist) {
      throw new HttpException('El correo ya existe', HttpStatus.CONFLICT);
    }

    const phoneExist = await this.userRepository.findOneBy({ phone });

    if (phoneExist) {
      throw new HttpException('El telefono ya existe', HttpStatus.CONFLICT);
    }

    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async login(data: LoginAuthDto) {
    const { email, password } = data;

    const userFound = await this.userRepository.findOneBy({ email });

    if (!userFound) {
      throw new HttpException('Verifique su email', HttpStatus.NOT_FOUND);
    }

    const isPassword = await compare(password, userFound.password);

    if (!isPassword) {
      throw new HttpException('Verifique sus credenciales', HttpStatus.FORBIDDEN);
    }

    return userFound
  }
}
