let currentUserId = localStorage.getItem('ares_active_user_id') || '';

export const setApiUser = (userId) => {
  currentUserId = userId || '';
  if (userId) {
    localStorage.setItem('ares_active_user_id', userId);
  } else {
    localStorage.removeItem('ares_active_user_id');
  }
};

export const getApiUser = () => currentUserId;

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(currentUserId ? { 'x-user-id': currentUserId } : {}),
    ...(options.headers || {})
  };

  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.error || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth & Roles
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (userData) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  quickLogin: (userId) => request('/auth/quick-login', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
  getCurrentUser: () => request('/auth/me'),
  getAllUsers: async () => {
    const res = await request('/auth/users');
    const users = Array.isArray(res) ? res : (res.users || []);
    return { users };
  },

  // Bases & Categories
  getBases: async () => {
    const res = await request('/bases');
    const bases = Array.isArray(res) ? res : (res.bases || []);
    return { bases };
  },
  getCategories: async () => {
    const res = await request('/bases/categories');
    const categories = Array.isArray(res) ? res : (res.categories || []);
    return { categories };
  },
  getInventory: async (baseId, categoryId) => {
    const params = new URLSearchParams();
    if (baseId) params.append('baseId', baseId);
    if (categoryId) params.append('categoryId', categoryId);
    const res = await request(`/bases/inventory?${params.toString()}`);
    const items = Array.isArray(res) ? res : (res.items || []);
    return { items };
  },

  // Dashboard Metrics & Popups
  getDashboardMetrics: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    return request(`/dashboard/metrics?${params.toString()}`);
  },

  // Purchases
  getPurchases: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    const res = await request(`/purchases?${params.toString()}`);
    const purchases = Array.isArray(res) ? res : (res.purchases || []);
    return { purchases };
  },
  recordPurchase: (data) => request('/purchases', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Transfers
  getTransfers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    const res = await request(`/transfers?${params.toString()}`);
    const transfers = Array.isArray(res) ? res : (res.transfers || []);
    return { transfers };
  },
  initiateTransfer: (data) => request('/transfers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  receiveTransfer: (transferId) => request(`/transfers/${transferId}/receive`, {
    method: 'PATCH'
  }),

  // Assignments
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const res = await request(`/assignments?${params.toString()}`);
    const assignments = Array.isArray(res) ? res : (res.assignments || []);
    return { assignments };
  },
  assignAsset: (data) => request('/assignments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  returnAssignment: (assignmentId) => request(`/assignments/${assignmentId}/return`, {
    method: 'POST'
  }),

  // Expenditures
  getExpenditures: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const res = await request(`/assignments/expenditures?${params.toString()}`);
    const expenditures = Array.isArray(res) ? res : (res.expenditures || []);
    return { expenditures };
  },
  recordExpenditure: (data) => request('/assignments/expenditures', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Audit Logs
  getAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.baseId) params.append('baseId', filters.baseId);
    if (filters.action) params.append('action', filters.action);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.limit) params.append('limit', filters.limit.toString());
    const res = await request(`/audit?${params.toString()}`);
    const logs = Array.isArray(res) ? res : (res.logs || []);
    return { logs, total: res.total || logs.length };
  }
};
