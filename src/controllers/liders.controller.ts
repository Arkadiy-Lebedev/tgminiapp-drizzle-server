import { Request, Response } from 'express';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
// import { logger } from '@utils/logger';

export const getLiders = async (req: Request, res: Response) => {

  try {
    const allUsers = await db.select({
      name: users.name,
      avatar: users.avatar,
      currentEnergy: users.currentEnergy
    }).from(users);
    
    res.status(200).json(allUsers);
  } catch (error) {
    // logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
