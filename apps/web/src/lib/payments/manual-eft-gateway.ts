import type { PaymentGateway, PaymentInitContext, PaymentInitResult } from "@/lib/payments/types";

export const manualEftGateway: PaymentGateway = {
  provider: "MANUAL_EFT",

  isConfigured() {
    return true;
  },

  async initiate({ order }: PaymentInitContext): Promise<PaymentInitResult> {
    return {
      kind: "manual",
      instructions:
        `EFT the total of ${order.currency} ${order.total.toFixed(2)} to Exobe Africa (Bank: First National Bank, ` +
        `Account: 000-000-000, Branch code: 250655) using reference "${order.orderNumber}". ` +
        "Your order will be confirmed once our team verifies the deposit, usually within 1 business day.",
    };
  },
};
