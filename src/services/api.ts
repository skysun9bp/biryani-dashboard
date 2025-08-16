// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RevenueEntry {
  id?: number;
  date: string;
  month: string;
  year: number;
  cashInReport?: number;
  card?: number;
  dd?: number;
  ue?: number;
  gh?: number;
  cn?: number;
  catering?: number;
  otherCash?: number;
  foodja?: number;
  zelle?: number;
  ezCater?: number;
  relish?: number;
  waiterCom?: number;
  ccFees?: number;
  ddFees?: number;
  ueFees?: number;
  ghFees?: number;
  foodjaFees?: number;
  ezCaterFees?: number;
  relishFees?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  user?: { name: string; email: string };
}

export interface ExpenseEntry {
  id?: number;
  date: string;
  month: string;
  year: number;
  costType: string;
  expenseType?: string;
  itemVendor?: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  user?: { name: string; email: string };
}

export interface SalaryEntry {
  id?: number;
  date: string;
  month: string;
  year: number;
  resourceName: string;
  amount: number;
  actualPaidDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  user?: { name: string; email: string };
}

export interface DashboardSummary {
  revenue: number;
  expenses: number;
  salaries: number;
  ccFees: number;
  commissionFees: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
}

export interface RevenueAnalytics {
  date: string;
  revenue: number;
  netIncome: number;
}

export interface ExpenseAnalytics {
  data: Array<{
    costType: string;
    amount: number;
    percentage: number;
  }>;
  total: number;
}

export interface SalaryAnalytics {
  data: Array<{
    employee: string;
    salary: number;
    percentage: number;
  }>;
  total: number;
  average: number;
  highestPaid: string | null;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API Service Class
class ApiService {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Revenue Operations
  async getRevenueEntries(params?: { year?: number; month?: string; page?: number; limit?: number }) {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/revenue?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createRevenueEntry(data: RevenueEntry): Promise<{ message: string; entry: RevenueEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/revenue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async updateRevenueEntry(id: number, data: Partial<RevenueEntry>): Promise<{ message: string; entry: RevenueEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/revenue/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async deleteRevenueEntry(id: number): Promise<{ message: string }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/revenue/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Expense Operations
  async getExpenseEntries(params?: { year?: number; month?: string; costType?: string; page?: number; limit?: number }) {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);
    if (params?.costType) queryParams.append('costType', params.costType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/expense?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createExpenseEntry(data: ExpenseEntry): Promise<{ message: string; entry: ExpenseEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async updateExpenseEntry(id: number, data: Partial<ExpenseEntry>): Promise<{ message: string; entry: ExpenseEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expense/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async deleteExpenseEntry(id: number): Promise<{ message: string }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expense/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getCostTypes(): Promise<string[]> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/expense/categories/cost-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Salary Operations
  async getSalaryEntries(params?: { year?: number; month?: string; resourceName?: string; page?: number; limit?: number }) {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);
    if (params?.resourceName) queryParams.append('resourceName', params.resourceName);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/salary?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createSalaryEntry(data: SalaryEntry): Promise<{ message: string; entry: SalaryEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/salary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async updateSalaryEntry(id: number, data: Partial<SalaryEntry>): Promise<{ message: string; entry: SalaryEntry }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/salary/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  async deleteSalaryEntry(id: number): Promise<{ message: string }> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/salary/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getResourceNames(): Promise<string[]> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/salary/resources/names`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Dashboard Analytics
  async getDashboardSummary(params?: { year?: number; month?: string }): Promise<DashboardSummary> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);

    const response = await fetch(`${API_BASE_URL}/dashboard/summary?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getRevenueAnalytics(params?: { year?: number; month?: string }): Promise<RevenueAnalytics[]> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);

    const response = await fetch(`${API_BASE_URL}/dashboard/revenue-analytics?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getExpenseAnalytics(params?: { year?: number; month?: string }): Promise<ExpenseAnalytics> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);

    const response = await fetch(`${API_BASE_URL}/dashboard/expense-analytics?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getSalaryAnalytics(params?: { year?: number; month?: string }): Promise<SalaryAnalytics> {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');

    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);

    const response = await fetch(`${API_BASE_URL}/dashboard/salary-analytics?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type {
  User,
  LoginResponse,
  RevenueEntry,
  ExpenseEntry,
  SalaryEntry,
  DashboardSummary,
  RevenueAnalytics,
  ExpenseAnalytics,
  SalaryAnalytics,
};
