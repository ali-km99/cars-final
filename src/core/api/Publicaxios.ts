import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7024/api";

// جذر السيرفر بدون /api — للـ endpoints العامة (public/cars/{token})
const PUBLIC_BASE = BASE_URL.replace(/\/api\/?$/, "");

const publicApi = axios.create({
  baseURL: PUBLIC_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default publicApi;
