import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { queryKeys } from '../store/queries';

export const useClientList = (provider = null) => {
  return useQuery(
    queryKeys.clients.all,
    () => api.getClients(provider ? { provider } : undefined),
    {
      keepPreviousData: true,
    }
  );
};

export const useClient = (clientId) => {
  return useQuery(
    queryKeys.clients.detail(clientId),
    () => api.getClient(clientId),
    {
      enabled: !!clientId,
    }
  );
};

export const useClientContract = (clientId) => {
  return useQuery(
    queryKeys.clients.contract(clientId),
    () => api.getClientContract(clientId),
    {
      enabled: !!clientId,
    }
  );
};

export const useClientSummary = (clientId) => {
  return useQuery(
    queryKeys.clients.summary(clientId),
    () => api.getClientSummary(clientId),
    {
      enabled: !!clientId,
    }
  );
};