export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
  color: string;
}

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

export async function checkPasswordPwned(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    const hashes = text.split('\n');
    const found = hashes.some(line => {
      const [hashSuffix] = line.split(':');
      return hashSuffix === suffix;
    });

    return found;
  } catch (error) {
    console.error('Error checking password against breach database:', error);
    return false;
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
    return {
      score: 0,
      feedback,
      isValid: false,
      color: 'red'
    };
  }

  score += 25;

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const characterTypesCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  if (characterTypesCount < 3) {
    feedback.push('Password must contain at least 3 of the following: lowercase, uppercase, numbers, special characters');
    return {
      score: 25,
      feedback,
      isValid: false,
      color: 'red'
    };
  }

  score += characterTypesCount * 15;

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  const hasCommonPatterns = /^(password|123456|qwerty|admin|letmein)/i.test(password);
  if (hasCommonPatterns) {
    feedback.push('Avoid common password patterns');
    score = Math.max(0, score - 30);
  }

  score = Math.min(100, score);

  let color = 'red';
  let strengthText = 'Weak';

  if (score >= 80) {
    color = 'green';
    strengthText = 'Strong';
  } else if (score >= 60) {
    color = 'yellow';
    strengthText = 'Good';
  } else if (score >= 40) {
    color = 'orange';
    strengthText = 'Fair';
  }

  if (feedback.length === 0) {
    feedback.push(`Password strength: ${strengthText}`);
  }

  return {
    score,
    feedback,
    isValid: score >= 40 && characterTypesCount >= 3 && password.length >= 8,
    color
  };
}
