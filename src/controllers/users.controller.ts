import { Request, Response } from 'express';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
// import { logger } from '@utils/logger';

export const getUsers = async (req: Request, res: Response) => {

  try {
    const allUsers = await db.select().from(users);
    res.status(200).json(allUsers);
  } catch (error) {
    // logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {

  try {
    const userId = parseInt(req.params.id);
    const user = await db.select().from(users).where(eq(users.id, userId));

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user[0]);
  } catch (error) {
    // logger.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  console.log(454)
  try {
    const { name, chat, nickName } = req.body;

      // Валидация обязательных полей
      if (!name || !chat) {
        return res.status(400).json({ message: 'Name and chat are required' });
      }
    
    // const newUser = await db.insert(users).values({
    //   name, 
    //   nickName,  
    //   chat,
     
    // }).returning({ insertedId: users.id });

    // const insertedId = newUser[0].insertedId;
    
    // res.status(201).json({ id: insertedId, name, chat });
  } catch (error) {
    // logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { name } = req.body;

    await db
      .update(users)
      .set({ name })
      .where(eq(users.id, userId));

    res.status(200).json({ id: userId, name });
  } catch (error) {
    // logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    await db.delete(users).where(eq(users.id, userId));

    res.status(204).send();
  } catch (error) {
    // logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};