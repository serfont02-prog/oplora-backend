import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Noticia } from './noticia.entity';
import { NoticiaService } from './noticia.service';
import { NoticiaController } from './noticia.controller';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Titulo } from '../normativa/titulo.entity';
import { VersionLey } from '../ley/version-ley.entity';
import { DocumentoConvocatoria } from '../convocatoria/documento-convocatoria.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

// Nota: NoticiaService importa PLANTILLAS_NOTICIA_DOCUMENTO como una simple
// constante de '../convocatoria/convocatoria.service' (no un provider inyectado),
// así que NoticiaModule NO necesita importar ConvocatoriaModule. Es
// ConvocatoriaModule quien importa NoticiaModule (con forwardRef) para que
// ScraperService pueda inyectar NoticiaService.
// forwardRef en NotificacionModule por seguridad, aunque NotificacionModule no
// depende de NoticiaModule hoy — evita romper si en el futuro se añade esa
// dependencia inversa (p.ej. un endpoint de notificaciones que lea Noticia).
@Module({
  imports: [
    TypeOrmModule.forFeature([Noticia, TemaNormativa, Articulo, Capitulo, Titulo, VersionLey, DocumentoConvocatoria, UsuarioOposicion]),
    forwardRef(() => NotificacionModule),
  ],
  controllers: [NoticiaController],
  providers: [NoticiaService],
  exports: [NoticiaService],
})
export class NoticiaModule {}
