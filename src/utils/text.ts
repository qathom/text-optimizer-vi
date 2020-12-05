export default function isTextNeutral (value: number): boolean {
  return value < 0.2 && value > -0.2;
}
