export default function isTextNeutral (value: number): boolean {
  const threshold = 0.1;

  return value < threshold && value > -threshold;
}
