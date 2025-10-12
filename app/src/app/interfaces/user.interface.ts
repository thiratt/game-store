export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  walletBalance: number;
}

export interface UserTransactionDetail {
  id: string;
  email: string;
  username: string;
  walletBalance: number;
  role: string;
  profileImage?: string;
  transactionHistories: TransactionHistory[];
}

export interface TransactionHistory {
  id: string;
  amount: number;
  type: string;
  transactionDate: Date;
}
