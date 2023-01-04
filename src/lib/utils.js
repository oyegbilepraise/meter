export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(+value)
};

export const roundToNearestTen = (num) => {
  return Math.ceil(num / 10) * 10;
};
