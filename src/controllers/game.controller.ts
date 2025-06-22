import { Request, Response } from 'express';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
// import { logger } from '@utils/logger';

export const endGame = async (req: Request, res: Response) => {
  try {

    const { userId,energy } = req.body;
console.log(req.body)

const user = await db
.select({
  ticket: users.ticket,
  currentEnergy:users.currentEnergy,
})
.from(users)
.where(eq(users.userId, userId)); 

//если нет такого юзера или билеты null то выдаем ошибку
if(user.length==0 || !user[0].ticket){
  res.status(500).json({ message: 'Server error. Not found' });
return
}

//если нет билетов то выдаем ошибку
if(user[0].ticket<=0){
  res.status(500).json({ message: 'Not tickets' });
return
}

//если билеты есть то добавляем энергию и уменьшаем количество билетов
  await db
  .update(users)
  .set({ currentEnergy:user[0].currentEnergy +energy, ticket:user[0].ticket -1})
  .where(eq(users.userId, userId));


const updateUser = await db
.select({
  ticket: users.ticket,
  currentEnergy:users.currentEnergy,
})
.from(users)
.where(eq(users.userId, userId)); 

    res.status(200).json({ status: true, ticket:updateUser[0].ticket, currentEnergy:updateUser[0].currentEnergy });
  } catch (error) {
    // logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
