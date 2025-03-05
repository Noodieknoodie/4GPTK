import { format, parseISO, addMonths } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
};

export const getNextPaymentDate = (lastPaymentDate, schedule) => {
  if (!lastPaymentDate) return null;
  
  try {
    const date = parseISO(lastPaymentDate);
    const months = schedule.toLowerCase() === 'monthly' ? 1 : 3;
    return addMonths(date, months);
  } catch (error) {
    return null;
  }
};

export const getDaysSincePayment = (lastPaymentDate) => {
  if (!lastPaymentDate) return null;
  
  try {
    const date = parseISO(lastPaymentDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return null;
  }
};

export const getQuarterFromMonth = (month) => {
  return Math.ceil(month / 3);
};

export const formatQuarter = (quarter, year) => {
  return `Q${quarter} ${year}`;
};