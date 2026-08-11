import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Convocatoria } from './convocatoria.entity';

export enum TipoDocumento {
  LISTA_ADMITIDOS_PROVISIONAL = 'lista_admitidos_provisional',
  LISTA_ADMITIDOS_DEFINITIVA = 'lista_admitidos_definitiva',
  LISTA_EXCLUIDOS_PROVISIONAL = 'lista_excluidos_provisional',
  LISTA_EXCLUIDOS_DEFINITIVA = 'lista_excluidos_definitiva',
  FECHA_EXAMEN = 'fecha_examen',
  RESULTADO_EJERCICIO = 'resultado_ejercicio',
  RESOLUCION_CONVOCATORIA = 'resolucion_convocatoria',
  NOTA_INFORMATIVA = 'nota_informativa',
  CRONOGRAMA = 'cronograma',
  NORMAS_ESPECIFICAS = 'normas_especificas',
  GUIA_INSCRIPCION = 'guia_inscripcion',
  OTRO = 'otro',
}

@Entity('documentos_convocatoria')
export class DocumentoConvocatoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'enum', enum: TipoDocumento, default: TipoDocumento.OTRO })
  tipo!: TipoDocumento;

  @Column({ type: 'varchar', nullable: true })
  subtipo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  urlPdf!: string | null;

  @Column({ type: 'text', nullable: true })
  contenidoTexto!: string | null;

  @Column({ type: 'varchar', nullable: true })
  hashContenido!: string | null;

  @Column({ type: 'varchar', nullable: true })
  fechaPublicacionTexto!: string | null;

  @Column({ type: 'date', nullable: true })
  fechaPublicacion!: Date | null;

  @Column({ default: false })
  procesado!: boolean;

  @CreateDateColumn()
  detectadoEn!: Date;

  @ManyToOne(() => Convocatoria, (c) => c.documentos)
  convocatoria!: Convocatoria;
}