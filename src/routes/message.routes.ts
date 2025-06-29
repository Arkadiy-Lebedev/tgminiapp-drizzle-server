import { Router } from 'express';
import {
  sendMessageAll,

} from '../controllers/message.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();


router.post('/',  sendMessageAll);


// router.post('/', validate(createUserSchema), createUser);

export default router;