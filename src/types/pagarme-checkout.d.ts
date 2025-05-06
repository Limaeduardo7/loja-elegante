interface PagarMeCheckoutOptions {
  encryption_key: string;
  success: (data: any) => void;
  error: (error: any) => void;
  close: () => void;
}

interface PagarMeCheckoutOpenOptions {
  amount: number;
  buttonText: string;
  buttonClass: string;
  customerData: string;
  createToken: string;
  paymentMethods: string;
  customer: {
    external_id: string;
    name: string;
    email: string;
    country: string;
    documents: Array<{
      type: string;
      number: string;
    }>;
    phone_numbers: string[];
  };
}

interface PagarMeCheckout {
  new(options: PagarMeCheckoutOptions): PagarMeCheckout;
  open(options: PagarMeCheckoutOpenOptions): void;
}

interface Window {
  PagarMeCheckout: PagarMeCheckout;
} 