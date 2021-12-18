export function truncateString(s: string, length: number) {
  return s.length > length ? s.substring(0, length) : s;
}
