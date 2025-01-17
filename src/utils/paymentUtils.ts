export const calculatePrice = (wordCount: number): number => {
  const baseRate = 0.10; // R$0.10 per word
  return Number((wordCount * baseRate).toFixed(2));
};

export const formatPrice = (amount: number): string => {
  return `R$${amount.toFixed(2)}`;
};