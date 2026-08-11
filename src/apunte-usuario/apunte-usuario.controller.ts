import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApunteUsuarioService } from './apunte-usuario.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('apuntes-usuario')
@UseGuards(JwtAuthGuard)
export class ApunteUsuarioController {
  constructor(private readonly service: ApunteUsuarioService) {}

  @Get('tema/:temaId')
  getPorTema(@Param('temaId') temaId: string, @Request() req: any) {
    return this.service.getApuntesPorTema(req.user.id, temaId);
  }

  @Get('oposicion/:oposicionId')
  getPorOposicion(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getApuntesPorOposicion(req.user.id, oposicionId);
  }

  @Post('tema/:temaId')
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
  async subir(
    @Param('temaId') temaId: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('oposicionId') oposicionId: string,
    @Request() req: any,
  ) {
    return this.service.subirApunte(
      req.user.id,
      oposicionId,
      archivo.originalname,
      archivo.buffer,
      archivo.mimetype,
      temaId,
    );
  }

      // apunte-usuario.controller.ts
    @Post('oposicion/:oposicionId')
    @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
    async subirPorOposicion(
      @Param('oposicionId') oposicionId: string,
      @UploadedFile() archivo: Express.Multer.File,
      @Request() req: any,
    ) {
      return this.service.subirApunte(
        req.user.id,
        oposicionId,
        archivo.originalname,
        archivo.buffer,
        archivo.mimetype,
      );
    }


    @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req: any) {
    return this.service.eliminar(id, req.user.id);
  }
}