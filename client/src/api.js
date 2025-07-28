import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
export default api;

export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const fetchBooks = () => api.get("/books");
export const fetchBook = (id) => api.get(`/books/${id}`);
export const createReview = (data) => api.post("/reviews", data);

// TODO (API Layer): Backend Developer – ยืนยัน endpoint และ response shape ให้ตรงกับ server