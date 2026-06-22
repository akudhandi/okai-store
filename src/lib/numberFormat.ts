export const formatPrice = (val: string | number) => {
  if (val === null || val === undefined) return '';
  const numStr = val.toString().replace(/[^0-9]/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatNumber = (val: string | number) => {
  if (val === null || val === undefined) return '';
  const numStr = val.toString().replace(/[^0-9]/g, '');
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseNumber = (val: string | number) => {
  if (val === null || val === undefined) return '';
  return val.toString().replace(/[^0-9]/g, '');
};
