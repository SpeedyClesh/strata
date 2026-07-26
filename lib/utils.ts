import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function maskAccountNumber(accountNumber: string) {
  return `•••• •••• ${accountNumber.slice(-4)}`;
}

export function formatAccountType(type: string) {
  switch (type) {
    case "CHECKING":
      return "Checking Account";
    case "TRADITIONAL":
      return "Traditional Account";
    case "SAVINGS":
    default:
      return "Savings Account";
  }
}
