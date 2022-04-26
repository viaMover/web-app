import {
  clearCurrentThemePersistItem,
  getCurrentThemeFromPersist,
  setCurrentThemeToPersist
} from '@/settings/persist/theme';

import { availableThemes, Theme } from './types';

export const getSavedTheme = async (): Promise<Theme | undefined> => {
  return await getCurrentThemeFromPersist();
};

export const getPreferredTheme = (): Theme => {
  return window?.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? Theme.Dark
    : Theme.Light;
};

export const queryMediaTheme = window?.matchMedia?.(
  '(prefers-color-scheme: dark)'
);

export const applyTheme = (theme: Theme, persist = true): void => {
  const htmlElement = window.document.documentElement;
  const appliedThemes = availableThemes.filter(
    (t) => htmlElement.classList.contains(t) && t !== theme
  ) as Array<string>;
  htmlElement.classList.remove(...appliedThemes);
  htmlElement.classList.add(theme);
  if (!persist) {
    clearCurrentThemePersistItem();
  } else {
    setCurrentThemeToPersist(theme);
  }
};

export const getThemeColors = (theme: Theme): Record<string, string> => {
  const colors = getThemeColorsFromComputedStyles();
  if (colors !== undefined) {
    return colors;
  }

  return getThemeColorsFromStyleSheets(theme);
};

const isCustomColorName = (name: string): boolean => {
  return name.startsWith('--');
};

const sanitizeCustomColorName = (name: string): string => {
  return name.replace(/^--/, '').trim();
};

const isSameDomain = (styleSheet: CSSStyleSheet) => {
  return (
    styleSheet.href == null ||
    styleSheet.href.startsWith(window.location.origin)
  );
};

const isStyleRule = (rule: CSSRule): rule is CSSStyleRule => {
  return rule.type === CSSRule.STYLE_RULE;
};

const getThemeColorsFromComputedStyles = ():
  | Record<string, string>
  | undefined => {
  const computedStyle = getComputedStyle(document.documentElement);
  const result = Object.values(computedStyle)
    .filter(isCustomColorName)
    .reduce((acc, color) => {
      return {
        ...acc,
        [sanitizeCustomColorName(color)]: computedStyle.getPropertyValue(color)
      };
    }, {});

  if (Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
};

const getThemeColorsFromStyleSheets = (theme: Theme) => {
  const sheetStyles = Array.from(document.styleSheets)
    .filter(isSameDomain)
    .reduce(
      (acc: Record<string, Record<string, string>>, sheet: CSSStyleSheet) => ({
        ...acc,
        ...mapCSSStyleSheet(sheet)
      }),
      {}
    );

  const baseStyles = sheetStyles[':root'];
  const cascadeStyles = Object.keys(sheetStyles)
    .filter((selector) => selector.includes(theme))
    .map((selector) => sheetStyles[selector]);

  return {
    ...baseStyles,
    ...cascadeStyles.reduce((acc, styles) => {
      return { ...acc, ...styles };
    }, {})
  };
};

const mapCSSStyleSheet = (
  sheet: CSSStyleSheet
): Record<string, Record<string, string>> => {
  return Array.from(sheet.cssRules)
    .filter(
      (rule: CSSRule): rule is CSSStyleRule =>
        isStyleRule(rule) && rule.selectorText.startsWith(':root')
    )
    .reduce(
      (rules: Record<string, Record<string, string>>, rule: CSSStyleRule) => {
        return {
          ...rules,
          [rule.selectorText]: {
            ...(rules[rule.selectorText] ?? {}),
            ...Array.from(rule.style)
              .filter(isCustomColorName)
              .reduce((rulesAcc, name) => {
                return {
                  ...rulesAcc,
                  [sanitizeCustomColorName(name)]: rule.style
                    .getPropertyValue(name)
                    .trim()
                };
              }, {})
          }
        };
      },
      {}
    );
};
