import dotenv from 'dotenv';
import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import{ initialUser } from '../controllers/users_initial_tg.controller';
import fs from 'fs';
import path from 'path';

// Типы для Telegram API
interface TelegramMessage extends Message {
  text?: string;
}


interface WebAppInfo {
  url: string;
}

interface InlineKeyboardButton {
  text: string;
  web_app?: WebAppInfo;
  callback_data?: string;
}

interface ReplyMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

dotenv.config();

const token: string = process.env.TOKEN || '';

if (!token) {
  throw new Error('Токен бота не указан в переменных окружения');
}

export function createBot() {
  const bot: TelegramBot = new TelegramBot(token, {polling: true});

  const welcomeMessage: string = `Привет!  Собирай пиццу и участвуй в розыгрыше! `;
  const videoPath: string = path.join(process.cwd(), 'welcome.mp4');
  const videoExists: boolean = fs.existsSync(videoPath);
  const videoUrl: string = 'https://myhookah.ru/video/video.mp4';

  bot.onText(/\/start/, async (msg: TelegramMessage): Promise<void> => {
    const chatId: number = msg.chat.id;
    console.log(msg)
    if(!msg.from?.id){
      return console.error('Пользователь не найден. Ошибка');
    }
    const user = await initialUser(msg.from?.username ? msg.from?.username : 'guest', msg.from?.first_name ? msg.from?.first_name : 'guest', msg.chat.id, msg.from?.id)
    
    await bot.sendMessage(chatId, welcomeMessage);  
    // await bot.sendMessage(chatId, 'Вот видео для тебя, ознакомься:');

    // const sentMsg: Message = await bot.sendMessage(chatId, 'Загружаю видео...');
    
    // await bot.sendVideo(
    //   chatId, 
    //   videoUrl, 
    //   {
    //     caption: 'Посмотрите видео',
    //     reply_markup: {
    //       inline_keyboard: [[{
    //         text: '✅ Я посмотрел',
    //         callback_data: 'video_watched'
    //       }]]
    //     }
    //   }
    // );
    
    // await bot.deleteMessage(chatId, sentMsg.message_id);

    const replyMarkup: ReplyMarkup = {
      inline_keyboard: [[{
          text: 'В ИГРУ!!',
          web_app: {
              url: `https://testingbuild.ru/`,
           } 
      }]]
  };

    await bot.sendMessage(
      chatId, 
      'В этот чат будет приходить информация о всех обновлениях и акциях в игре. Вперед!', 
      { reply_markup: replyMarkup }
    );

  });

  // колбэк при нажатии кнопки присомотрел видео
  // bot.on('callback_query', async (query: CallbackQuery): Promise<void> => {
  //   if (query.data === 'video_watched' && query.message) {
  //       const replyMarkup: ReplyMarkup = {
  //           inline_keyboard: [[{
  //               text: 'В ИГРУ!!',
  //               web_app: {
  //                   url: `https://testingbuild.ru/`,
  //                } 
  //           }]]
  //       };

  //       await bot.sendMessage(
  //         query.message.chat.id, 
  //         'Для получения информации войдите в игру!', 
  //         { reply_markup: replyMarkup }
  //       );
  //   }
  // });

  bot.on('message', (msg: TelegramMessage): void => {
    const chatId: number = msg.chat.id;
    const text: string | undefined = msg.text?.toLowerCase();

    console.log(msg)
    
    if (!text) return;
    
    // if (text.includes('привет') || text.includes('здравствуй')) {
    //     bot.sendMessage(chatId, 'И тебе привет! 😊');
    // } else if (text.includes('видео')) {
    //     bot.sendMessage(chatId, 'Смотри какое крутое видео!');
    //     if (videoExists) {
    //         bot.sendVideo(chatId, videoPath);
    //     }
    // } else if (text.includes('помощь') || text.includes('команды')) {
    //     bot.sendMessage(chatId, 'Доступные команды:\n/start - начать общение\n\nКлючевые слова: "привет", "видео", "помощь"');
    // } else if (text.includes('спасибо')) {
    //     bot.sendMessage(chatId, 'Пожалуйста! Обращайся еще! 🙌');
    // }
  });

  console.log('Бот запущен и ожидает сообщений...');
  return bot;
}