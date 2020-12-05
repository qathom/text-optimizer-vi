export default function (number: number|string, decimals = 2): number {
  return parseFloat(parseFloat(`${number}`).toFixed(decimals));
};
