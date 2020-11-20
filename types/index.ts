export type Metrics = {
  countWords: number,
  countCharacters: number,
  sentiments: number[],
  neutralityScore: number,
  languages: Map<string, number>,
};
