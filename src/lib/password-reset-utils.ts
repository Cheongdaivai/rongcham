// // Utility functions for password reset methods

// export type PasswordResetMethod = 'email' | 'otp'

// export function getDefaultResetMethod(): PasswordResetMethod {
//   if (typeof window !== 'undefined') {
//     return (process.env.NEXT_PUBLIC_PASSWORD_RESET_METHOD as PasswordResetMethod) || 'otp'
//   }
//   return 'otp'
// }

// export function formatOTPInput(value: string): string {
//   // Remove non-digits and limit to 6 characters
//   return value.replace(/\D/g, '').slice(0, 6)
// }

// export function isValidOTP(otp: string): boolean {
//   return /^\d{6}$/.test(otp)
// }

// export function isValidEmail(email: string): boolean {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   return emailRegex.test(email)
// }
