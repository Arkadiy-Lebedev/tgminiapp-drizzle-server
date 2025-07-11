import { Router } from 'express';
import {
  endGame,
  endGameFlipping,
} from '../controllers/game.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();


router.post('/end',  endGame);
router.post('/flipping/end',  endGameFlipping);

// router.post('/', validate(createUserSchema), createUser);

export default router;