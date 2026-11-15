// ⭐ Auditoría A11: configuración de la base de datos para la CLI de migraciones de TypeORM.
// Es la misma conexión que app.module.ts, pero con synchronize siempre apagado: las migraciones
// solo se generan y se ejecutan a mano (npm run migration:generate / migration:run).
// Las variables (DB_HOST, DB_PORT...) salen del entorno; en local se lee el .env si existe.
import 'reflect-metadata';
import { DataSource } from 'typeorm';

try {
  (process as any).loadEnvFile?.('.env');
} catch {
  // sin .env (por ejemplo en Railway, donde las variables ya están en el entorno)
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migraciones',
  synchronize: false,
});
