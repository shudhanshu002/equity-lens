import bcrypt from "bcryptjs";
import crypto from "crypto";

const PASSWORD_SALT_ROUNDS = 12;
const OTP_SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(crypto.randomInt(min, max + 1));
}

export async function hashOtp(otp: string) {
  return bcrypt.hash(otp, OTP_SALT_ROUNDS);
}

export async function verifyOtp(otp: string, otpHash: string) {
  return bcrypt.compare(otp, otpHash);
}

export function createOtpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isExpired(date: Date) {
  return date.getTime() < Date.now();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}