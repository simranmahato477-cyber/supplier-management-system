export const normalizeEmpty = (value) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

export const getPaymentStatus = (totalAmount, paidAmount) => {
  const total = Number(totalAmount || 0);
  const paid = Number(paidAmount || 0);
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
};

export const getNextPONumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `PO-${timestamp}`;
};
