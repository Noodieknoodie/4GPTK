import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { queryKeys } from '../store/queries';

export const usePaymentHistory = (clientId, options = {}) => {
  const { page = 1, limit = 10, year = null } = options;
  
  // Create params object without null/undefined values
  const params = { page, limit };
  if (year !== null) {
    params.year = year;
  }
  
  return useQuery(
    [...queryKeys.clients.payments(clientId), page, limit, year],
    () => api.getPayments(clientId, params),
    {
      enabled: !!clientId,
      keepPreviousData: true,
    }
  );
};

export const usePayment = (paymentId) => {
  return useQuery(
    queryKeys.payments.detail(paymentId),
    () => api.getPayment(paymentId),
    {
      enabled: !!paymentId,
    }
  );
};

export const useAvailablePeriods = (contractId, clientId) => {
  return useQuery(
    ['periods', contractId, clientId],
    () => api.getAvailablePeriods(contractId, clientId),
    {
      enabled: !!contractId && !!clientId,
    }
  );
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (paymentData) => api.createPayment(paymentData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(queryKeys.clients.payments(data.client_id));
        queryClient.invalidateQueries(queryKeys.clients.summary(data.client_id));
        queryClient.invalidateQueries(queryKeys.clients.detail(data.client_id));
      },
    }
  );
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => api.updatePayment(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(queryKeys.payments.detail(data.payment_id));
        queryClient.invalidateQueries(queryKeys.clients.payments(data.client_id));
        queryClient.invalidateQueries(queryKeys.clients.summary(data.client_id));
        queryClient.invalidateQueries(queryKeys.clients.detail(data.client_id));
      },
    }
  );
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, clientId }) => api.deletePayment(id).then(() => ({ id, clientId })),
    {
      onSuccess: ({ clientId }) => {
        queryClient.invalidateQueries(queryKeys.clients.payments(clientId));
        queryClient.invalidateQueries(queryKeys.clients.summary(clientId));
        queryClient.invalidateQueries(queryKeys.clients.detail(clientId));
      },
    }
  );
};