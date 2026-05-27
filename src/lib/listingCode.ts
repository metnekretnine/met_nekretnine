export const LISTING_CODE_LENGTH = 8;

export function generateListingCode() {
  const min = 10 ** (LISTING_CODE_LENGTH - 1);
  const max = 10 ** LISTING_CODE_LENGTH - 1;

  if (globalThis.crypto?.getRandomValues) {
    const randomValues = new Uint32Array(1);
    globalThis.crypto.getRandomValues(randomValues);
    const number = min + (randomValues[0] % (max - min + 1));
    return String(number);
  }

  return String(Math.floor(min + Math.random() * (max - min + 1)));
}
