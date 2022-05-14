import { defaultColors } from '../constants';

/**
 * Получает цвет по умолчанию.
 */
export const getDefaultColor = () => {
  // NOTE: Цвет по умолчанию при регистрации пользователя
  const defaultColor = defaultColors[Math.ceil(Math.random() * defaultColors.length - 1)];

  return defaultColor;
};
