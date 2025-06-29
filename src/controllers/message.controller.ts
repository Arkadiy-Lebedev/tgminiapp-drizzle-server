import { Request, Response } from 'express';
import {bot} from '../app'
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
// import { logger } from '@utils/logger';


export const sendMessageAll = async (req: Request, res: Response) => {

  try {
    const { message } = req.body;
      // Валидация обязательных полей
      if (!message || message== '') {
        return res.status(400).json({ message: 'Error message' });
      }

        const allChatsUsers = await db.select(
          {
            chat: users.chat,
          }
        ).from(users);

        console.log(allChatsUsers)
        for (const chatId of allChatsUsers) {
          try {
            if(chatId.chat){
               await bot.sendMessage(chatId.chat, message);
            console.log(`Сообщение отправлено ${chatId}`);
            // Пауза между сообщениями (чтобы избежать лимитов)
            await new Promise(resolve => setTimeout(resolve, 1000));
            }
           
          } catch (error) {
            console.error(`Ошибка отправки ${chatId}: ${error}`);
          }
        }  
    
  } catch (error) {
    // logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
