import { differenceInDays, isAfter } from 'date-fns';

export const calculateEMI = (principal, rate, months) => {
  const p = parseFloat(principal) || 0;
  const r_monthly = (parseFloat(rate) || 0) / 100; // Rate is now monthly
  const t = parseFloat(months) || 0;

  if (p === 0 || t === 0) {
    return {
      emi: "0.00",
      totalInterest: "0.00",
      totalPayable: "0.00",
      documentCharges: "0.00",
      amountInHand: "0.00"
    };
  }

  // Monthly Interest Calculation
  const totalInterest = p * r_monthly * t;
  const totalPayable = p + totalInterest;
  const emi = totalPayable / t;
  const documentCharges = p * 0.10; // 10% deduction
  const amountInHand = p - documentCharges;

  return {
    emi: emi.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalPayable: totalPayable.toFixed(2),
    documentCharges: documentCharges.toFixed(2),
    amountInHand: amountInHand.toFixed(2)
  };
};

export const calculateLateFees = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);

  if (isAfter(today, due)) {
    const days = differenceInDays(today, due);
    return {
      days,
      amount: days * 10 // ₹10 per day
    };
  }

  return { days: 0, amount: 0 };
};

export const parseCSVData = (text) => {
  // Simple CSV parser for demo purposes
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
};



export const calculateRefinance = (customer, topUpAmount) => {
  const remainingMonths = customer.emiMonths - customer.paidEMI;
  const principalPerMonth = parseFloat(customer.loanAmount) / customer.emiMonths;
  const outstandingPrincipal = principalPerMonth * remainingMonths;
  const topUp = parseFloat(topUpAmount) || 0;
  const docCharge = topUp * 0.10;
  const newTotalLoan = outstandingPrincipal + topUp;
  
  return {
    outstandingPrincipal: Math.round(outstandingPrincipal),
    newTotalLoan: Math.round(newTotalLoan),
    topUpAmount: topUp,
    docCharge: Math.round(docCharge),
    amountToHandover: Math.round(topUp - docCharge),
    remainingMonths: remainingMonths
  };
};
