import { Request, Response } from 'express';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
// import { logger } from '@utils/logger';

export const authUser = async (req: Request, res: Response) => {

const userId = req.telegramUser?.id;
if (!userId) {
  res.status(401).json({ message: 'Unauthorized' });
  return;
}
  try {
    const user = await db.select().from(users).where(eq(users.userId, userId));
 
 if (!user) {
  console.log('пользователь не найден')
  return
 } 

 await db
 .update(users)
 .set({ avatar: req.telegramUser?.photo_url})
 .where(eq(users.userId, userId));

 const currentDate = new Date();

//если прошло больше 24 и меньше 48 часов то обновляем серию побед
 if(currentDate.getTime() - user[0].updateVisit > 3600000 * 24 &&  currentDate.getTime() - user[0].updateVisit < 3600000 * 48){
  console.log('прошло больше 24 и меньше 48 часов')
  let newWinStreak
  if(user[0].winStreak < 7){
newWinStreak = user[0].winStreak + 1;
  } else {
    newWinStreak = 7
  }

   await db
  .update(users)
  .set({ updateVisit: currentDate.getTime(), winStreak: newWinStreak, ticket: user[0].ticket + newWinStreak })
  .where(eq(users.userId, userId));

  const updateUser = await db.select(
    {
      name: users.name,
      winStreak: users.winStreak,
      userId: users.userId,
      currentEnergy: users.currentEnergy,
      ticket: users.ticket,
    }
  ).from(users).where(eq(users.userId, userId));

  res.status(200).json(updateUser[0]);
  return
 }

//если прошло больше 48 часов то скидываем серию побед
 if(currentDate.getTime() - user[0].updateVisit > 3600000 * 48 ){
   
  await db
  .update(users)
  .set({ updateVisit: currentDate.getTime(), winStreak: 1, ticket: user[0].ticket ?  user[0].ticket + 1 : 1})
  .where(eq(users.userId, userId));

  const updateUser = await db.select(
    {
      name: users.name,
      winStreak: users.winStreak,
      userId: users.userId,
      currentEnergy: users.currentEnergy,
      ticket: users.ticket,
    }
  ).from(users).where(eq(users.userId, userId));

  res.status(200).json(updateUser[0]);
  return
 }

 
// если прошло меньше 24 часов
const updateUser = await db.select(
  {
    name: users.name,   
    userId: users.userId,
    currentEnergy: users.currentEnergy,
    ticket: users.ticket,
  }
).from(users).where(eq(users.userId, userId));

  res.status(200).json(updateUser[0]);

  } catch (error) {
    // logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
