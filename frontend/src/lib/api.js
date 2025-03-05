const API_BASE_URL = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

const api = {
  getClients: () => request('/clients'),
  getClient: (id) => request(`/clients/${id}`),
  
  getContract: (id) => request(`/contracts/${id}`),
  getClientContract: (clientId) => request(`/clients/${clientId}/contract`),
  
  getPayments: (clientId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/clients/${clientId}/payments?${queryString}`);
  },
  getPayment: (id) => request(`/payments/${id}`),
  createPayment: (data) => request('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePayment: (id, data) => request(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePayment: (id) => request(`/payments/${id}`, {
    method: 'DELETE',
  }),
  
  getAvailablePeriods: (contractId, clientId) => 
    request(`/contracts/${contractId}/periods?client_id=${clientId}`),
  
  getClientSummary: (clientId) => request(`/clients/${clientId}/summary`),
};

export default api;