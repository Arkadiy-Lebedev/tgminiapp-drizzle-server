import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const BOT_TOKEN: string = process.env.TOKEN || '';

declare global {
  namespace Express {
    interface Request {
      telegramUser?: {
        id: number;
        first_name?: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        is_premium?: boolean;
        photo_url?: string;
      };
    }
  }
}

// Middleware для проверки и извлечения данных пользователя
export const telegramAuth = ( 
  req: Request,
  res: Response,
  next: NextFunction) => {
    console.log(56767)
  try {
    const { initData } = req.body;
    console.log(initData);
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // 1. Проверка подлинности данных
    const isValid = verifyTelegramInitData(initData, BOT_TOKEN);
    console.log(99);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid initData' });
    }
    console.log(88);
    // 2. Извлечение данных пользователя
    const user = extractUserFromInitData(initData);

    // 3. Проверка времени (не старше 1 дня)
    const authDate = getAuthDateFromInitData(initData);
    if (Date.now() / 1000 - authDate > 86400) {
      return res.status(403).json({ error: 'Data expired' });
    }

    // Добавляем пользователя в запрос
    req.telegramUser = user;
    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};


// Вспомогательные функции
// function verifyTelegramInitData(initData:string, botToken:string) {
//   const params = new URLSearchParams(initData);
//   const hash = params.get('hash');
//   console.log(params);
//   params.delete('hash');
  
//   const dataCheckString = Array.from(params.entries())
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([k, v]) => `${k}=${v}`)
//     .join('\n');
  
//     const secretKey = CryptoJS.SHA256(botToken).toString(CryptoJS.enc.Hex);
//     console.log(978);
//   const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secretKey)
//   .toString(CryptoJS.enc.Hex);

//   console.log(calculatedHash);
//   console.log(hash);
//   return calculatedHash === hash;
// }

function verifyTelegramInitData(initData:string, botToken:string) {
  const params = new URLSearchParams(initData);
  console.log(params);
  const hash = params.get('hash');
  params.delete('hash');

  // Сортируем параметры и формируем строку для проверки
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Генерируем секретный ключ
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Сравниваем хеши
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  console.log(calculatedHash);
  console.log(hash);
  return calculatedHash === hash;
}

function extractUserFromInitData(initData:string) {
  const params = new URLSearchParams(initData);
  const userString = params.get('user');
  
  if (!userString) {
    throw new Error('User data not found');
  }

  return JSON.parse(decodeURIComponent(userString));
}

function getAuthDateFromInitData(initData: string): number {
  const params = new URLSearchParams(initData);
  const authDateStr = params.get('auth_date');
  
  if (!authDateStr) {
    throw new Error('auth_date parameter is missing in initData');
  }

  const authDate = parseInt(authDateStr, 10);
  
  if (isNaN(authDate)) {
    throw new Error('auth_date is not a valid number');
  }

  return authDate;
}

