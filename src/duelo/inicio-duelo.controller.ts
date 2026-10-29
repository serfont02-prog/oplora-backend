import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { InicioDueloService, TipoDuelo } from './inicio-duelo.service';

@Controller('duelos')
@UseGuards(JwtAuthGuard)
export class InicioDueloController {
  constructor(private readonly service: InicioDueloService) {}

  // La app lo llama justo al pulsar "Empezar" en un duelo.
  @Post(':tipo/:id/empezar')
  empezar(@Param('tipo') tipo: string, @Param('id') id: string, @Request() req: any) {
    return this.service.empezar(tipo as TipoDuelo, id, req.user.id);
  }
}
