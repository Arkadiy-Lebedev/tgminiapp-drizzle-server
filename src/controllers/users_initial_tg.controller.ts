import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';


export const initialUser = async (nickName: string, name: string, chatId: number, userId: number) => {
  console.log(454)
  try {

      // Валидация обязательных полей
      if (!chatId) {
        return console.log('Обязательные поля не заполнены');
      }
console.log('чат id' + chatId);
      const user = await db.select().from(users).where(eq(users.userId, userId));
      console.log('chatId подключение прошло')
      console.log(user)
      if(user.length!==0){
//         const result = await db.select().from(users);
// console.log(typeof result[0].createdAt); // Должно быть "number"
// console.log(new Date(result[0].createdAt).toString());  // нормальная дата
// console.log(new Date(result[0].createdAt).getTime());  // нормальная дата timestamp
        return console.log('Пользователь существует', user[0].createdAt);
        
      }
      const currentDate = new Date();
    
    const newUser = await db.insert(users).values({
      nickName: nickName,   
      name:name,
      chat:chatId,
      userId:userId,
      ticket:3,     
      winStreak:1,
      lastVisit:currentDate.getTime(),
      updateVisit:currentDate.getTime(),
      currentEnergy:0,
      totalEnergy:1000
    }).returning({ insertedId: users.id });

    const insertedId = newUser[0].insertedId;
    return console.log('пользователь добавлен' + newUser);
    
  } catch (error) {
    // logger.error('Error creating user:', error);
    console.error('Детали ошибки:', {
      message: error,


    });
    return console.log('Internal server error, ошибка инициализации');
  }
};
