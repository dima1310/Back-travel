import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'node:crypto';
import { UserCollection } from '../models/userModel.js';
import { SessionsCollection } from '../models/session.js';

// Термін дії токенів
const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 хвилин
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 днів

// Генерація токенів сесії
const createSession = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + ACCESS_TTL_MS),
  refreshTokenValidUntil: new Date(Date.now() + REFRESH_TTL_MS),
});

// Хелпери
export const findSession = (query) => SessionsCollection.findOne(query);
export const findUser = (query) => UserCollection.findOne(query);

// Реєстрація користувача
export const registerUser = async (data) => {
  const { email, password } = data;

  const existingUser = await UserCollection.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserCollection.create({
    ...data,
    password: hashedPassword,
  });

  return {
    name: newUser.name,
    email: newUser.email,
  };
};

// Вхід користувача
export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Unauthorized');
  }

  // Видаляємо стару сесію, якщо вона була
  await SessionsCollection.deleteOne({ userId: user._id });

  const session = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...session,
  });
};

// Оновлення токенів
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const oldSession = await findSession({ _id: sessionId, refreshToken });
  if (!oldSession) {
    throw createHttpError(401, 'Session not found');
  }

  if (oldSession.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionsCollection.findByIdAndDelete(oldSession._id);

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: oldSession.userId,
    ...newSession,
  });
};

// Вихід користувача
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

