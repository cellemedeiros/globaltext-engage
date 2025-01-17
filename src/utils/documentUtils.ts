export const calculatePrice = (wordCount: number): number => {
  const baseRate = 0.20; // R$0.20 per word
  return Number((wordCount * baseRate).toFixed(2));
};

export const formatPrice = (amount: number): string => {
  return `R$${amount.toFixed(2)}`;
};