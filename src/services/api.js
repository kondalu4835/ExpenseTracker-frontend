import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth APIs
export const registerUser = async (name, email, password) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Expense APIs
export const getExpenses = async (userId) => {
  const response = await api.get(`/expenses/user/${userId}`);
  return response.data;
};

export const getExpensesByDate = async (userId, startDate, endDate) => {
  const response = await api.get(`/expenses/user/${userId}/filter`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const addExpense = async (expense) => {
  const response = await api.post("/expenses", expense);
  return response.data;
};

export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export default api;