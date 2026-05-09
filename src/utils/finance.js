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
  // Rule: 5 days grace from the due date
  const graceDate = new Date(due);
  graceDate.setDate(graceDate.getDate() + 5);

  if (isAfter(today, graceDate)) {
    const days = differenceInDays(today, graceDate);
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




export const calculatePreClosure = (customer) => {
  const today = new Date();
  const nextDue = new Date(customer.nextDueDate);
  const lastDue = new Date(nextDue);
  lastDue.setMonth(lastDue.getMonth() - 1);

  const originalPrincipal = parseFloat(customer.loanAmount) || 0;
  const emiMonths = parseFloat(customer.emiMonths) || 0;
  const principalPerMonth = originalPrincipal / emiMonths;
  const remainingMonths = emiMonths - customer.paidEMI;
  const outstandingPrincipal = principalPerMonth * remainingMonths;
  
  // 7.5% of original principal amount
  const preClosureCharges = originalPrincipal * 0.075;
  const lateFees = calculateLateFees(customer.nextDueDate).amount;
  
  const daysUsed = Math.max(0, differenceInDays(today, lastDue));
  const proRataEMI = (parseFloat(customer.emiAmount) / 30) * daysUsed;
  
  const total = outstandingPrincipal + preClosureCharges + lateFees + proRataEMI;
  
  return {
    outstandingPrincipal: Math.round(outstandingPrincipal),
    originalPrincipal: Math.round(originalPrincipal),
    preClosureCharges: Math.round(preClosureCharges),
    lateFees: Math.round(lateFees),
    proRataEMI: Math.round(proRataEMI),
    daysUsed,
    totalAmount: Math.round(total)
  };
};
