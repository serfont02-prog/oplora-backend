import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { LoginDto, RegistroDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Request() req: any) {
    return this.authService.perfil(req.user.id);
  }
}
