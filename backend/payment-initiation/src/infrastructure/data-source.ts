import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PaymentInstruction } from '../domain/payment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'paymentuser',
  password: process.env.DB_PASSWORD || 'paymentpass',
  database: process.env.DB_NAME || 'paymentdb',
  entities: [PaymentInstruction],
  synchronize: true, // For dev only
  logging: false,
}); 