export const calculateExpectedFee = (contract, totalAssets) => {
    if (!contract) {
      return {
        fee: null,
        method: 'No contract data',
      };
    }
    
    if (contract.fee_type === 'flat') {
      return {
        fee: contract.flat_rate,
        method: 'Flat fee',
      };
    }
    
    if (contract.fee_type === 'percentage' || contract.fee_type === 'percent') {
      if (!totalAssets || !contract.percent_rate) {
        return {
          fee: null,
          method: 'Percentage fee (missing data)',
        };
      }
      
      const fee = totalAssets * contract.percent_rate;
      const ratePercentage = (contract.percent_rate * 100).toFixed(4);
      
      return {
        fee,
        method: `${ratePercentage}% of $${formatCurrency(totalAssets)}`,
      };
    }
    
    return {
      fee: null,
      method: 'Unknown fee type',
    };
  };
  
  export const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  export const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };
  
  export const generateFeeReferences = (contract) => {
    if (!contract) return null;
    
    let monthlyRate, quarterlyRate, annualRate;
    
    if (contract.fee_type === 'flat') {
      if (contract.payment_schedule === 'monthly') {
        monthlyRate = contract.flat_rate;
        quarterlyRate = monthlyRate * 3;
        annualRate = monthlyRate * 12;
      } else {
        quarterlyRate = contract.flat_rate;
        monthlyRate = quarterlyRate / 3;
        annualRate = quarterlyRate * 4;
      }
    } else if (contract.percent_rate) {
      monthlyRate = contract.payment_schedule === 'monthly' 
        ? contract.percent_rate 
        : contract.percent_rate / 3;
      
      quarterlyRate = contract.payment_schedule === 'monthly'
        ? contract.percent_rate * 3
        : contract.percent_rate;
        
      annualRate = contract.payment_schedule === 'monthly'
        ? contract.percent_rate * 12
        : contract.percent_rate * 4;
    } else {
      return null;
    }
    
    return {
      monthly: contract.fee_type === 'flat' ? formatCurrency(monthlyRate) : (monthlyRate * 100).toFixed(4) + '%',
      quarterly: contract.fee_type === 'flat' ? formatCurrency(quarterlyRate) : (quarterlyRate * 100).toFixed(4) + '%',
      annual: contract.fee_type === 'flat' ? formatCurrency(annualRate) : (annualRate * 100).toFixed(4) + '%',
    };
  };