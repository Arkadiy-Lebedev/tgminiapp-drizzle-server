import { Router } from 'express';
import {
  getLiders,

} from '../controllers/liders.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.get('/', getLiders);


// router.post('/', validate(createUserSchema), createUser);

export default router;