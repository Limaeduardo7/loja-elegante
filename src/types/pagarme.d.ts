declare module 'pagarme' {
  interface Client {
    transactions: {
      create: (options: any) => Promise<any>;
      find: (options: any) => Promise<any>;
    };
    // Outros métodos do cliente
  }

  interface PagarMeStatic {
    client: {
      connect: (options: { api_key: string; encryption_key?: string }) => Promise<Client>;
    };
  }

  const pagarme: PagarMeStatic;
  export default pagarme;
} 