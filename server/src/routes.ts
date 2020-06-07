// DB knex;

import express from 'express';
import PoitsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController';
import multer from 'multer';
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'
const routes = express.Router();
const upload = multer(multerConfig);


const pointsController = new PoitsController();
const itemsController = new ItemsController();

// Service Pattern
// Repository Pattern
// index, show, create/store, update, delete/destroy

routes.get('/items', itemsController.index)
routes.get('/points', pointsController.index)
routes.get('/points/:id', pointsController.show)

routes.post(
	'/points',  
	upload.single('image'), 
	celebrate({
		body: Joi.object().keys({
			name: Joi.string().required(),
			whatsapp: Joi.string().required(),
			email: Joi.string().required(),
			latitude: Joi.number().required(),
			longitude: Joi.number().required(),
			city: Joi.string().required(),
			uf: Joi.string().required().max(2),
			items: Joi.string().required()
		})
	}, {
		abortEarly: false 
	}),
	pointsController.create
	)

export default routes 