export const validateCnpj = (cnpj) => {
  // Remove all non-digit characters
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Check if CNPJ has 14 digits
  if (cleaned.length !== 14) {
    return false;
  }
  
  // Check for repeated digits (like 00000000000000)
  if (/^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  // Validate first check digit
  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleaned.charAt(12)) !== firstDigit) {
    return false;
  }
  
  // Validate second check digit
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleaned.charAt(13)) === secondDigit;
};

export default { validateCnpj };