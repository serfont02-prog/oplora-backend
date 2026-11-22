import { MigrationInterface, QueryRunner } from 'typeorm';

// ⭐ Banco compartido de 4 opciones (nov 2026): columna «descartable» en preguntas_test.
// Índice de la opción incorrecta que se quita cuando la convocatoria usa 3 opciones.
// Si synchronize ya creó la columna, IF NOT EXISTS hace que la migración no falle.
export class PreguntaDescartable1795300000000 implements MigrationInterface {
  name = 'PreguntaDescartable1795300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "preguntas_test" ADD COLUMN IF NOT EXISTS "descartable" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "preguntas_test" DROP COLUMN IF EXISTS "descartable"`);
  }
}
