import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Titulo } from './titulo.entity';
import { Capitulo } from './capitulo.entity';
import { Articulo } from './articulo.entity';
import { NormativaService } from './normativa.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Seccion } from './seccion.entity';
import { Disposicion } from './disposicion.entity';
import { In } from 'typeorm';

@Controller('normativa')
@UseGuards(JwtAuthGuard)
export class NormativaController {
  constructor(
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Seccion) 
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Disposicion) 
    private readonly disposicionRepo: Repository<Disposicion>,
    private readonly normativaService: NormativaService,
    
  ) {}

  
  @Get('estadisticas/:versionLeyId')
  async getEstadisticas(@Param('versionLeyId') versionLeyId: string) {
    const titulos = await this.tituloRepo.count({ where: { versionLey: { id: versionLeyId } } });
    const tituloIds = (await this.tituloRepo.find({ where: { versionLey: { id: versionLeyId } }, select: ['id'] })).map((t) => t.id);

    const capitulos = tituloIds.length ? await this.capituloRepo.count({ where: { tituloRef: { id: In(tituloIds) } } }) : 0;
    const capituloIds = tituloIds.length
      ? (await this.capituloRepo.find({ where: { tituloRef: { id: In(tituloIds) } }, select: ['id'] })).map((c) => c.id)
      : [];

    const secciones = capituloIds.length ? await this.seccionRepo.count({ where: { capitulo: { id: In(capituloIds) } } }) : 0;
    const seccionIds = secciones
      ? (await this.seccionRepo.find({ where: { capitulo: { id: In(capituloIds) } }, select: ['id'] })).map((s) => s.id)
      : [];

    const articulosDirectosTitulo = tituloIds.length ? await this.articuloRepo.count({ where: { tituloRef: { id: In(tituloIds) } } }) : 0;
    const articulosDirectosCapitulo = capituloIds.length ? await this.articuloRepo.count({ where: { capitulo: { id: In(capituloIds) } } }) : 0;
    const articulosEnSecciones = seccionIds.length ? await this.articuloRepo.count({ where: { seccion: { id: In(seccionIds) } } }) : 0;

    const disposiciones = await this.disposicionRepo.count({ where: { versionLey: { id: versionLeyId } } });

    return {
      titulos,
      capitulos,
      secciones,
      articulos: articulosDirectosTitulo + articulosDirectosCapitulo + articulosEnSecciones,
      disposiciones,
    };
  }

  @Get('nota/:articuloId')
getNota(@Param('articuloId') articuloId: string, @Request() req: any) {
  return this.normativaService.getNota(req.user.id, articuloId);
}

@Get('buscar/:versionLeyId')
buscarArticulos(
  @Param('versionLeyId') versionLeyId: string,
  @Query('q') q: string,
) {
  return this.normativaService.buscarArticulos(versionLeyId, q);
}

@Get('nota-tema/:temaId')
getNotaTema(@Param('temaId') temaId: string, @Request() req: any) {
  return this.normativaService.getNotaTema(req.user.id, temaId);
}

@Get('articulo-por-numero/:versionLeyId/:numero')
buscarPorNumero(@Param('versionLeyId') versionLeyId: string, @Param('numero') numero: string) {
  return this.normativaService.buscarArticuloPorNumero(versionLeyId, numero);
}

@Post('nota-tema/:temaId')
guardarNotaTema(
  @Param('temaId') temaId: string,
  @Body('contenido') contenido: string,
  @Request() req: any,
) {
  return this.normativaService.guardarNotaTema(req.user.id, temaId, contenido);
}

@Post('nota-tema/:temaId/programar')
programarRepaso(
  @Param('temaId') temaId: string,
  @Body('fecha') fecha: string,
  @Request() req: any,
) {
  return this.normativaService.programarRepasoTema(req.user.id, temaId, new Date(fecha));
}

@Post('nota/:articuloId')
guardarNota(
  @Param('articuloId') articuloId: string,
  @Body('contenido') contenido: string,
  @Request() req: any,
) {
  return this.normativaService.guardarNota(req.user.id, articuloId, contenido);
}

@Get('subrayados/:articuloId')
getSubrayados(@Param('articuloId') articuloId: string, @Request() req: any) {
  return this.normativaService.getSubrayados(req.user.id, articuloId);
}

@Post('subrayados/:articuloId')
crearSubrayado(
  @Param('articuloId') articuloId: string,
  @Body('inicio') inicio: number,
  @Body('fin') fin: number,
  @Body('textoSeleccionado') textoSeleccionado: string,
  @Body('color') color: string,
  @Request() req: any,
) {
  return this.normativaService.crearSubrayado(req.user.id, articuloId, inicio, fin, textoSeleccionado, color);
}

@Delete('subrayados/:id')
borrarSubrayado(@Param('id') id: string, @Request() req: any) {
  return this.normativaService.borrarSubrayado(id, req.user.id);
}

  @Get('titulos/:versionLeyId')
  getTitulos(@Param('versionLeyId') versionLeyId: string) {
    return this.tituloRepo.find({
      where: { versionLey: { id: versionLeyId } },
      order: { orden: 'ASC' },
    });
  }

  @Get('capitulos/:tituloId')
  getCapitulos(@Param('tituloId') tituloId: string) {
    return this.capituloRepo.find({
      where: { tituloRef: { id: tituloId } },
      order: { orden: 'ASC' },
    });
  }

  @Get('secciones/:capituloId')
getSecciones(@Param('capituloId') capituloId: string) {
  return this.seccionRepo.find({
    where: { capitulo: { id: capituloId } },
    order: { orden: 'ASC' },
  });
}

@Get('disposiciones/:versionLeyId')
getDisposiciones(@Param('versionLeyId') versionLeyId: string) {
  return this.disposicionRepo.find({
    where: { versionLey: { id: versionLeyId } },
    order: { orden: 'ASC' },
  });
}

    @Get('articulos-seccion/:seccionId')
    getArticulosSeccion(@Param('seccionId') seccionId: string) {
      return this.articuloRepo.find({
        where: { seccion: { id: seccionId } },
        order: { orden: 'ASC' },
      });
    }

    @Get('articulo/:id')
    getArticulo(@Param('id') id: string) {
      return this.articuloRepo.findOne({
        where: { id },
        relations: [
          'capitulo',
          'capitulo.tituloRef',
          'capitulo.tituloRef.versionLey',
          'capitulo.tituloRef.versionLey.ley',
          'tituloRef',
          'tituloRef.versionLey',
          'tituloRef.versionLey.ley',
          'seccion', // ⭐ añadir
          'seccion.capitulo', // ⭐ añadir
          'seccion.capitulo.tituloRef', // ⭐ añadir
          'seccion.capitulo.tituloRef.versionLey', // ⭐ añadir
          'seccion.capitulo.tituloRef.versionLey.ley', // ⭐ añadir
        ],
      });
    }

@Get('articulo/:id/anterior-siguiente')
async anteriorSiguiente(@Param('id') id: string) {
  const articulo = await this.articuloRepo.findOne({
    where: { id },
    relations: [
      'capitulo',
      'capitulo.tituloRef',
      'capitulo.tituloRef.versionLey',
      'tituloRef',
      'tituloRef.versionLey',
    ],
  });
  if (!articulo) return { anterior: null, siguiente: null };

  const orden = articulo.orden;
  const capituloId = articulo.capitulo?.id;
  const tituloId = (articulo as any).tituloRef?.id ?? articulo.capitulo?.tituloRef?.id;
  const versionLeyId = articulo.capitulo?.tituloRef?.versionLey?.id
    ?? (articulo as any).tituloRef?.versionLey?.id;
  const tituloOrden = articulo.capitulo?.tituloRef?.orden
    ?? (articulo as any).tituloRef?.orden;

  let anterior: Articulo | null = null;
  let siguiente: Articulo | null = null;

  if (capituloId) {
    const capituloOrden = articulo.capitulo?.orden ?? 1;

    // Buscar en el mismo capítulo
    anterior = await this.articuloRepo.findOne({
      where: { capitulo: { id: capituloId }, orden: orden - 1, vigente: true },
    });
    siguiente = await this.articuloRepo.findOne({
      where: { capitulo: { id: capituloId }, orden: orden + 1, vigente: true },
    });

    // Si no hay anterior → buscar en capítulo anterior del mismo título
    if (!anterior && tituloId) {
      const capituloAnterior = await this.capituloRepo.findOne({
        where: { tituloRef: { id: tituloId }, orden: capituloOrden - 1 },
      });
      if (capituloAnterior) {
        anterior = await this.articuloRepo.findOne({
          where: { capitulo: { id: capituloAnterior.id }, vigente: true },
          order: { orden: 'DESC' },
        });
      }
      // Si no hay capítulo anterior → buscar artículos directos del mismo título
      if (!anterior) {
        anterior = await this.articuloRepo.findOne({
          where: { tituloRef: { id: tituloId }, vigente: true } as any,
          order: { orden: 'DESC' },
        });
      }
      // Si tampoco → último artículo del título anterior
      if (!anterior && versionLeyId && tituloOrden) {
        const tituloAnterior = await this.tituloRepo.findOne({
          where: { versionLey: { id: versionLeyId }, orden: tituloOrden - 1 },
        });
        if (tituloAnterior) {
          const ultimoCap = await this.capituloRepo.findOne({
            where: { tituloRef: { id: tituloAnterior.id } },
            order: { orden: 'DESC' },
          });
          if (ultimoCap) {
            anterior = await this.articuloRepo.findOne({
              where: { capitulo: { id: ultimoCap.id }, vigente: true },
              order: { orden: 'DESC' },
            });
          }
          if (!anterior) {
            anterior = await this.articuloRepo.findOne({
              where: { tituloRef: { id: tituloAnterior.id }, vigente: true } as any,
              order: { orden: 'DESC' },
            });
          }
        }
      }
    }

    // Si no hay siguiente → buscar en siguiente capítulo del mismo título
    if (!siguiente && tituloId) {
      const siguienteCapitulo = await this.capituloRepo.findOne({
        where: { tituloRef: { id: tituloId }, orden: capituloOrden + 1 },
      });
      if (siguienteCapitulo) {
        siguiente = await this.articuloRepo.findOne({
          where: { capitulo: { id: siguienteCapitulo.id }, vigente: true },
          order: { orden: 'ASC' },
        });
      }
    }

    // Si no hay siguiente capítulo → buscar en siguiente título
    if (!siguiente && versionLeyId && tituloOrden !== undefined) {
      const siguienteTitulo = await this.tituloRepo.findOne({
        where: { versionLey: { id: versionLeyId }, orden: tituloOrden + 1 },
      });
      if (siguienteTitulo) {
        siguiente = await this.articuloRepo.findOne({
          where: { tituloRef: { id: siguienteTitulo.id }, vigente: true } as any,
          order: { orden: 'ASC' },
        });
        if (!siguiente) {
          const primerCap = await this.capituloRepo.findOne({
            where: { tituloRef: { id: siguienteTitulo.id } },
            order: { orden: 'ASC' },
          });
          if (primerCap) {
            siguiente = await this.articuloRepo.findOne({
              where: { capitulo: { id: primerCap.id }, vigente: true },
              order: { orden: 'ASC' },
            });
          }
        }
      }
    }

  } else if (tituloId) {
    // Artículo directo del título
    anterior = await this.articuloRepo.findOne({
      where: { tituloRef: { id: tituloId }, orden: orden - 1, vigente: true } as any,
    });
    siguiente = await this.articuloRepo.findOne({
      where: { tituloRef: { id: tituloId }, orden: orden + 1, vigente: true } as any,
    });

    // Si no hay anterior → buscar en título anterior
    if (!anterior && versionLeyId && tituloOrden) {
      const tituloAnterior = await this.tituloRepo.findOne({
        where: { versionLey: { id: versionLeyId }, orden: tituloOrden - 1 },
      });
      if (tituloAnterior) {
        const ultimoCap = await this.capituloRepo.findOne({
          where: { tituloRef: { id: tituloAnterior.id } },
          order: { orden: 'DESC' },
        });
        if (ultimoCap) {
          anterior = await this.articuloRepo.findOne({
            where: { capitulo: { id: ultimoCap.id }, vigente: true },
            order: { orden: 'DESC' },
          });
        }
        if (!anterior) {
          anterior = await this.articuloRepo.findOne({
            where: { tituloRef: { id: tituloAnterior.id }, vigente: true } as any,
            order: { orden: 'DESC' },
          });
        }
      }
    }

    // Si no hay siguiente → buscar primer capítulo del mismo título
    if (!siguiente) {
      const primerCapitulo = await this.capituloRepo.findOne({
        where: { tituloRef: { id: tituloId } },
        order: { orden: 'ASC' },
      });
      if (primerCapitulo) {
        siguiente = await this.articuloRepo.findOne({
          where: { capitulo: { id: primerCapitulo.id }, vigente: true },
          order: { orden: 'ASC' },
        });
      }
    }

    // Si no hay siguiente → buscar en siguiente título
    if (!siguiente && versionLeyId && tituloOrden !== undefined) {
      const siguienteTitulo = await this.tituloRepo.findOne({
        where: { versionLey: { id: versionLeyId }, orden: tituloOrden + 1 },
      });
      if (siguienteTitulo) {
        siguiente = await this.articuloRepo.findOne({
          where: { tituloRef: { id: siguienteTitulo.id }, vigente: true } as any,
          order: { orden: 'ASC' },
        });
        if (!siguiente) {
          const primerCap = await this.capituloRepo.findOne({
            where: { tituloRef: { id: siguienteTitulo.id } },
            order: { orden: 'ASC' },
          });
          if (primerCap) {
            siguiente = await this.articuloRepo.findOne({
              where: { capitulo: { id: primerCap.id }, vigente: true },
              order: { orden: 'ASC' },
            });
          }
        }
      }
    }
  }

  return { anterior, siguiente };
}

  @Get('articulos-titulo/:tituloId')
  getArticulosTitulo(@Param('tituloId') tituloId: string) {
  return this.articuloRepo.find({
    where: { tituloRef: { id: tituloId }, vigente: true },
    order: { orden: 'ASC' },
  });
  }

  @Get('articulos/:capituloId')
  getArticulos(@Param('capituloId') capituloId: string) {
    return this.articuloRepo.find({
      where: { capitulo: { id: capituloId }, vigente: true },
      order: { orden: 'ASC' },
    });
  }

  @Post('importar-contenido-ia')
importarContenidoIA(@Body() body: { contenido: any[] }) {
  return this.normativaService.importarContenidoIA(body.contenido);
}

  @Post('importar-estructura')
  importarEstructura(@Body() datos: any) {
    return this.normativaService.importarEstructura(datos);
  }

  @Post('importar-articulos')
  importarArticulos(
    @Body('articulos') articulos: any[],
    @Body('capituloId') capituloId: string,
  ) {
    return this.normativaService.importarArticulos(articulos, capituloId);
  }

  @Post('importar-articulos-titulo')
importarArticulosTitulo(
  @Body('articulos') articulos: any[],
  @Body('tituloId') tituloId: string,
) {
  return this.normativaService.importarArticulosEnTitulo(articulos, tituloId);
}

// En normativa.service.ts o directamente en el controller si sigues ese patrón
@Patch('articulo/:id')
async editarArticulo(
  @Param('id') id: string,
  @Body() datos: { contenido?: string; titulo?: string; vigente?: boolean },
) {
  await this.articuloRepo.update(id, datos);
  return this.articuloRepo.findOne({ where: { id } });
}
}