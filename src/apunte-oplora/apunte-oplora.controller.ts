import {
  Controller, Get, Post, Delete, Patch,
  Param, Body, UseGuards, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApunteOploraService } from './apunte-oplora.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { memoryStorage } from 'multer';
import { Request } from '@nestjs/common';


@Controller('apuntes-oplora')
@UseGuards(JwtAuthGuard)
export class ApunteOploraController {
  constructor(private readonly service: ApunteOploraService) {}

  @Get('oposicion/:oposicionId')
  findByOposicion(@Param('oposicionId') oposicionId: string) {
    return this.service.findByOposicion(oposicionId);
  }
  
  @Get('tema/:temaId')
  findByTema(@Param('temaId') temaId: string) {
    return this.service.findByTema(temaId);
  }


   @Get(':id')
  findOne(@Param('id') id: string) {
  return this.service.findOne(id);
  }

 @Post('oposicion/:oposicionId')
@UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
async subirGeneral(
  @Param('oposicionId') oposicionId: string,
  @UploadedFile() archivo: Express.Multer.File,
  @Body('titulo') titulo: string,
  @Body('descripcion') descripcion: string,
  @Body('orden') orden: string,
  @Body('versionLeyId') versionLeyId: string,
) {
  return this.service.subirArchivo(
    archivo.buffer,
    archivo.originalname,
    archivo.mimetype,
    titulo,
    descripcion,
    orden ? Number(orden) : 0,
    undefined, // ⭐ temaId
    oposicionId,
    versionLeyId,
  );
}

@Get(':id/subrayados')
getSubrayados(@Param('id') apunteId: string, @Request() req: any) {
  return this.service.getSubrayados(req.user.id, apunteId);
}

@Post(':id/subrayados')
crearSubrayado(
  @Param('id') apunteId: string,
  @Body('inicio') inicio: number,
  @Body('fin') fin: number,
  @Body('textoSeleccionado') textoSeleccionado: string,
  @Body('color') color: string,
  @Request() req: any,
) {
  return this.service.crearSubrayado(req.user.id, apunteId, inicio, fin, textoSeleccionado, color);
}

@Delete('subrayados/:subId')
borrarSubrayado(@Param('subId') subId: string, @Request() req: any) {
  return this.service.borrarSubrayado(subId, req.user.id);
}

@Post(':id/progreso')
guardarProgreso(
  @Param('id') apunteId: string,
  @Body('porcentaje') porcentaje: number,
  @Request() req: any,
) {
  return this.service.guardarProgreso(req.user.id, apunteId, porcentaje);
}

@Get(':id/progreso')
getProgreso(@Param('id') apunteId: string, @Request() req: any) {
  return this.service.getProgreso(req.user.id, apunteId);
}

@Post('tema/:temaId')
@UseInterceptors(FileInterceptor('archivo'))
async subir(
  @Param('temaId') temaId: string,
  @UploadedFile() archivo: Express.Multer.File,
  @Body('titulo') titulo: string,
  @Body('descripcion') descripcion: string,
  @Body('orden') orden: string,
  @Body('versionLeyId') versionLeyId: string,
) {
  return this.service.subirArchivo(
    archivo.buffer,
    archivo.originalname,
    archivo.mimetype,
    titulo,
    descripcion,
    orden ? Number(orden) : 0,
    temaId,
    undefined, // ⭐ oposicionId
    versionLeyId,
  );
}

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datos: { titulo?: string; descripcion?: string; orden?: number },
  ) {
    return this.service.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }


}