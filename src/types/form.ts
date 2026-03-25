export interface PaymentFormData {
  firstName: string;
  lastName: string;
  accountNumber: string;
  routingNumber: string;
  amount: string;
  currency: string;
  memo: string;
  paymentDate: string;
}

export type FormField = keyof PaymentFormData;

export const FIELD_LABELS: Record<FormField, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  accountNumber: 'Account Number',
  routingNumber: 'Routing Number',
  amount: 'Amount',
  currency: 'Currency',
  memo: 'Memo / Note',
  paymentDate: 'Payment Date',
};

export const FIELD_HELP: Record<FormField, string> = {
  firstName: "The recipient's first name as it appears on their bank account.",
  lastName: "The recipient's last name as it appears on their bank account.",
  accountNumber: 'A unique number identifying the recipient\'s bank account (usually 8–12 digits).',
  routingNumber: 'A 9-digit number identifying the recipient\'s bank (also called ABA routing number).',
  amount: 'The amount of money to transfer. Enter numbers only (e.g. 500.00).',
  currency: 'The currency for this transfer (e.g. USD, EUR, GBP). Defaults to USD.',
  memo: 'An optional note or description for this payment (e.g. "Rent for March").',
  paymentDate: 'The date on which the payment should be processed.',
};

export const defaultForm: PaymentFormData = {
  firstName: '',
  lastName: '',
  accountNumber: '',
  routingNumber: '',
  amount: '',
  currency: 'USD',
  memo: '',
  paymentDate: '',
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
