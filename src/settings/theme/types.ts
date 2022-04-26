export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

export const availableThemes = [Theme.Light, Theme.Dark, Theme.System];

export const stringIsTheme = (value: string): value is Theme => {
  return availableThemes.includes(value as Theme);
};
