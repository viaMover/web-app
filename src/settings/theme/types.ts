export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

export const availableThemes = [Theme.Light, Theme.Dark];

export const stringIsTheme = (value: string): value is Theme => {
  return availableThemes.includes(value as Theme);
};
