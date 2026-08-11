import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(
    @Body('email') email: string,
    @Body('nombre') nombre: string,
    @Body('apellidos') apellidos: string,
    @Body('password') password: string,
    @Body('dni') dni: string,
  ) {
    return this.authService.registro({ email, nombre, apellidos, password, dni });
  }

  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Request() req: any) {
    return this.authService.perfil(req.user.id);
  }
}