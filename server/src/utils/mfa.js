import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate MFA secret for user
 */
export const generateMFASecret = (userEmail, appName = 'EduEval') => {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    length: 32
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
};

/**
 * Generate QR code for MFA setup
 */
export const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify MFA token
 */
export const verifyMFAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock skew
  });
};

/**
 * Generate backup codes for MFA
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from({ length: 8 }, () => 
      '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)]
    ).join('');
    
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};
