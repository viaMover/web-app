const supportsFlagEmoji = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.height = 10;
    canvas.width = canvas.height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx == null) {
      return false;
    }
    ctx.font = canvas.height + 'px Arial';
    ctx.fillText('🇬🇧', 0, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let i = 0;
    while (i < data.length) {
      if (data[i] !== data[i + 1] || data[i] !== data[i + 2]) return true;
      i += 4;
    }
    return false;
  } catch {
    return false;
  }
};

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const mapCountryCodeToEmoji = (
  countryCode: string,
  withSpace = false
): string => {
  if (!supportsFlagEmoji()) {
    return '';
  }

  return `${withSpace ? ' ' : ''}${getFlagEmoji(countryCode)}`;
};
