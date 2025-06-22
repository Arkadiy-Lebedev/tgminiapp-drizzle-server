import { Router } from 'express';
import { telegramAuth } from '../middlewares/authTg.middleware';
import {
  authUser,
  
} from '../controllers/auth.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.post('/', telegramAuth, authUser);


// router.post('/', validate(createUserSchema), createUser);

export default router;