const API_BASE = '/api';

export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    register: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    }
  },
  company: {
    get: async (companyId: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch company');
      return res.json();
    },
    update: async (companyId: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update company');
      return res.json();
    }
  },
  products: {
    list: async (companyId: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    create: async (companyId: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    update: async (companyId: string, productId: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    delete: async (companyId: string, productId: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/products/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    }
  },
  sales: {
    list: async (companyId: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/sales`);
      if (!res.ok) throw new Error('Failed to fetch sales');
      return res.json();
    },
    create: async (companyId: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create sale');
      return res.json();
    }
  },
  generic: {
    list: async (companyId: string, collection: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/${collection}`);
      if (!res.ok) throw new Error(`Failed to fetch ${collection}`);
      return res.json();
    },
    create: async (companyId: string, collection: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Failed to create entry in ${collection}`);
      return res.json();
    },
    update: async (companyId: string, collection: string, id: string, data: any) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Failed to update entry in ${collection}`);
      return res.json();
    },
    delete: async (companyId: string, collection: string, id: string) => {
      const res = await fetch(`${API_BASE}/companies/${companyId}/${collection}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to delete entry in ${collection}`);
      return res.json();
    }
  }
};
