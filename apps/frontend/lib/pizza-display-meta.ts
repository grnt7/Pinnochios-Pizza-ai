/** Stable display-only prep time & rating per pizza (no backend fields yet). */

export function pizzaPrepMinutes(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 18 + (h % 13);
}

export function pizzaRating(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 17 + seed.charCodeAt(i)) >>> 0;
  }
  const rating = 4.2 + (h % 9) / 10;
  return rating.toFixed(1);
}
