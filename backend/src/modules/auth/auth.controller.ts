import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.validateAndLogin(loginDto);
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registro(@Body() dto: any): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: any): Promise<AuthResponse> {
    return this.authService.register(dto);
  }
}
