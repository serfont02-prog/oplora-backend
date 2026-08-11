  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
  import { Ley } from './ley.entity';
  import { Titulo } from '../normativa/titulo.entity';
  import { Libro } from '../normativa/libro.entity';
  import { DiffVersion } from './diff-version.entity';
  import { OposicionLey } from '../ley/oposicion-ley.entity';

  export enum TipoCambio {
    INICIAL = 'inicial',
    MODIFICACION_PARCIAL = 'modificacion_parcial',
    MODIFICACION_TOTAL = 'modificacion_total',
    DEROGACION = 'derogacion',
  }

  @Entity('versiones_ley')
  export class VersionLey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    version: string;

    @Column({ nullable: true })
    referenciaBoe: string;

    @Column({ nullable: true })
    tipoNorma: string;

    @Column({ nullable: true })
    fechaPublicacion: Date;

    @Column({ nullable: true })
    fechaVigencia: Date;

    @Column({ type: 'enum', enum: TipoCambio, default: TipoCambio.INICIAL })
    tipoCambio: TipoCambio;

    @Column({ default: false })
    activa: boolean;

    @Column({ type: 'text', nullable: true })
    textoCompleto: string;

    @Column({ type: 'text', nullable: true })
    notas: string;

    @CreateDateColumn()
    creadoEn: Date;

    @ManyToOne(() => Ley, (l) => l.versiones)
    ley: Ley;

    @OneToMany(() => Titulo, (t) => t.versionLey)
    titulos: Titulo[];

    @OneToMany(() => Libro, (l) => l.versionLey)
    libros: Libro[];

    @OneToMany(() => DiffVersion, (d) => d.versionNueva)
    diffs: DiffVersion[];

    @OneToMany(() => OposicionLey, (ol) => ol.versionLey)
    oposicionLeyes: OposicionLey[];
  }   