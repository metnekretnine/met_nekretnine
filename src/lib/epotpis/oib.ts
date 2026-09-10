/** Croatian OIB: exactly 11 digits, checked using ISO 7064 MOD 11,10. */
export function normalizeOib(value: string): string {
  return value.trim();
}

export function oibCheck(value: string): boolean {
  const code = normalizeOib(value);
  if (!/^\d{11}$/.test(code)) return false;
  let remainder = 10;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder + Number(code[i])) % 10;
    if (remainder === 0) remainder = 10;
    remainder = (remainder * 2) % 11;
  }
  const digit = 11 - remainder;
  return Number(code[10]) === (digit === 10 ? 0 : digit);
}
