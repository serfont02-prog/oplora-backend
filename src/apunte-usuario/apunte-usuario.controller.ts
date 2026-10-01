import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, Request, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApunteUsuarioService } from './apunte-usuario.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

// ⭐ Límite de tamaño por archivo subido. Al usar memoryStorage() el archivo
// entero se carga en RAM antes de llegar aquí; sin este límite, varios
// usuarios subiendo PDFs grandes a la vez son un vector de agotamiento de
// memoria del proceso. 20MB es generoso para un apunte/PDF de tema.
const MAX_TAMANIO_APUNTE = 20 * 1024 * 1024;

function construirValidadorTamanio() {
  return new ParseFilePipeBuilder()
    .addMaxSizeValidator({ maxSize: MAX_TAMANIO_APUNTE, message: 'El archivo no puede superar 20MB' })
    .build({ errorHttpStatusCode: HttpStatus.PAYLOAD_TOO_LARGE });
}

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
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage(), limits: { fileSize: MAX_TAMANIO_APUNTE } }))
  async subir(
    @Param('temaId') temaId: string,
    @UploadedFile(construirValidadorTamanio()) archivo: Express.Multer.File,
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

    @Post('oposicion/:oposicionId')
    @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage(), limits: { fileSize: MAX_TAMANIO_APUNTE } }))
    async subirPorOposicion(
      @Param('oposicionId') oposicionId: string,
      @UploadedFile(construirValidadorTamanio()) archivo: Express.Multer.File,
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