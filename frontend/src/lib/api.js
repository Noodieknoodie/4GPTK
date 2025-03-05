const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Add a health check function
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

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
      console.error('API error response:', errorData);
      throw new Error(errorData.detail || `API error: ${response.status} ${response.statusText}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error, 'URL:', url);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to the server. Please make sure the backend is running.');
    }
    throw error;
  }
}

const api = {
  health: checkApiHealth,
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