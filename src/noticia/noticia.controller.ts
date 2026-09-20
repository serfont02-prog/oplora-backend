import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { NoticiaService } from './noticia.service';
import { CreateNoticiaDto, UpdateNoticiaDto } from './noticia.dto';
import { TipoNoticia } from './noticia.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('noticias')
export class NoticiaController {
  constructor(private readonly service: NoticiaService) {}

  // ─── FEED PÚBLICO ──────────────────────────────────────────

  @Get('feed')
  @Public()
  getFeed(
    @Query('convocatoriaId') convocatoriaId?: string,
    @Query('oposicionId') oposicionId?: string,
    @Query('tipos') tipos?: string,
    @Query('limite') limite?: string,
  ) {
    return this.service.getFeed({
      convocatoriaId,
      oposicionId,
      tipos: tipos ? (tipos.split(',').filter(Boolean) as TipoNoticia[]) : undefined,
      limite: limite ? Number(limite) : undefined,
    });
  }

  // ─── ADMIN ─────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(
    @Query('tipo') tipo?: TipoNoticia,
    @Query('convocatoriaId') convocatoriaId?: string,
    @Query('oposicionId') oposicionId?: string,
    @Query('estado') estado?: 'publicada' | 'borrador' | 'programada',
  ) {
    return this.service.findAll({ tipo, convocatoriaId, oposicionId, estado });
  }

  @Get('pendientes-revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findPendientesRevision() {
    return this.service.findPendientesRevision();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateNoticiaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateNoticiaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/publicar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  publicar(@Param('id') id: string) {
    return this.service.publicar(id);
  }

  @Patch(':id/despublicar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  despublicar(@Param('id') id: string) {
    return this.service.despublicar(id);
  }

  @Patch(':id/destacar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  destacar(@Param('id') id: string, @Body('destacada') destacada?: boolean) {
    return this.service.destacar(id, destacada ?? true);
  }
}
