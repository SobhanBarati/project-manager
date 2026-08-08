import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api-v1";

console.log("🔧 API Base URL:", BASE_URL); // ✅ چاپ آدرس API

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});

api.interceptors.request.use((config) => {
    console.log("📤 Request:", config.method?.toUpperCase(), config.url); // ✅ لاگ درخواست
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log("✅ Response:", response.status, response.config.url); // ✅ لاگ پاسخ
        return response;
    },
    (error: AxiosError) => {
        console.log("❌ Response Error:", error.response?.status, error.config?.url); // ✅ لاگ خطا
        console.log("❌ Error data:", error.response?.data); // ✅ لاگ دیتای خطا
        
        if(error.response && error.response.status === 401){
            window.dispatchEvent(new Event("force-logout"));
        }
        return Promise.reject(error);
    }
);

const postData = async<T>(path: string, data: unknown): Promise<T> => {
    console.log("📦 PostData called with:", { path, data }); // ✅ لاگ
    const response = await api.post(path, data);
    return response.data;
};

const fetchData = async<T>(path: string): Promise<T> => {
    const response = await api.get(path);

    return response.data;
};

const updateData = async<T>(path: string , data: unknown): Promise<T> => {
    const response = await api.put(path,data);
    
    return response.data;
};

const deleteData = async<T>(path: string): Promise<T> => {
    const response = await api.delete(path);

    return response.data;
};

export {
    postData,
    fetchData,
    updateData,
    deleteData,
};