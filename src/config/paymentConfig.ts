export interface PaymentAccount {
  id: 'telebirr' | 'cbe';
  nameKey: string;
  accountNumber: string;
  accountName: string;
  icon: string;
}

export const paymentAccounts: PaymentAccount[] = [
  {
    id: 'telebirr',
    nameKey: 'payment.telebirr',
    accountNumber: '0912345678',       // 👈 your real Telebirr number
    accountName: 'የእኛ ሱቅ',              // 👈 your registered name
    icon: '📱',
  },
  {
    id: 'cbe',
    nameKey: 'payment.cbe',
    accountNumber: '1000123456789',    // 👈 your real CBE account
    accountName: 'የእኛ ሱቅ',              // 👈 your account holder name
    icon: '🏦',
  },
];

// ✅ Your real bot username — NO @ symbol
export const BOT_USERNAME = 'our_suk_bot';