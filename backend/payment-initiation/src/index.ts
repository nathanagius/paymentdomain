import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AppDataSource } from './infrastructure/data-source';
import paymentController from './api/paymentController';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', paymentController);

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Payment Initiation API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize data source', err);
    process.exit(1);
  }); 