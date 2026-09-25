import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    return Promise.reject(error as any);
  }
);

export default axiosInstance;
