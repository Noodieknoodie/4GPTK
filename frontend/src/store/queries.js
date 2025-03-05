import { 
    QueryClient,
  } from '@tanstack/react-query';
  
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
    },
  });
  
  export const queryKeys = {
    clients: {
      all: ['clients'],
      detail: (id) => ['clients', id],
      contract: (id) => ['clients', id, 'contract'],
      payments: (id) => ['clients', id, 'payments'],
      summary: (id) => ['clients', id, 'summary'],
    },
    payments: {
      all: ['payments'],
      detail: (id) => ['payments', id],
    },
    contracts: {
      all: ['contracts'],
      detail: (id) => ['contracts', id],
    },
  };