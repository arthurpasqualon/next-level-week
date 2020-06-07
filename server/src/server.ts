// DB knex;
import path from 'path'
import express from 'express';
import routes from './routes';
import cors from 'cors';
import { errors } from 'celebrate';

const app = express();
app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))
app.use(errors);
app.listen(8877);