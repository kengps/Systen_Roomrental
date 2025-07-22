import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_REACT_APP_API}`,
    withCredentials: true // สำคัญ! เพื่อส่ง cookie refresh token
})

// Interceptor ดักจับ error

// ใส่ token ในทุก request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;

});

// ดักจับ 401 ใน response แล้วรีเฟรช token
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {

                const { data } = await api.post('/refresh');



                localStorage.setItem('token', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;