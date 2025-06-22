import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/users.controller';
// import { validate } from '../middlewares/validation.middleware';
// import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/',  createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// router.post('/', validate(createUserSchema), createUser);

export default router;