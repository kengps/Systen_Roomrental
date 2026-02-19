import axios from "axios";
import {localStorageUtils} from "@/lib/utils";

const api = axios.create({
    baseURL: process.env.VITE_REACT_APP_API,
    withCredentials: true, // เพื่อส่ง cookie refresh
    headers: {"Content-Type": "application/json"},
});

let accessToken = localStorageUtils.getAccessToken();
let isRefreshing = false;
let refreshQueue = [];

const setAccessToken = (t) => {
    accessToken = t;
    if (typeof window !== "undefined") {
        if (t) localStorage.setItem("access_token", t);
        else localStorage.removeItem("access_token");
    }
};

// ✅ Export function เพื่อให้ apiCall สามารถอัปเดต token ได้
export const updateAccessToken = (t) => {
    setAccessToken(t);
};

api.interceptors.request.use((config) => {
    // ✅ ดึง token ใหม่จาก localStorage ทุกครั้ง
    const currentToken = localStorageUtils.getAccessToken();
    if (currentToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${currentToken}`;
        accessToken = currentToken;
    }
    return config;
});

// helper: รอจน refresh เสร็จ
function subscribeTokenRefresh(cb) {
    refreshQueue.push(cb);
}

function onRefreshed(newToken) {
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // กัน loop: อย่า refresh ถ้าเป็น endpoint refresh เอง
        const isRefreshCall = original?.url?.includes("/auth/refresh");
        if (error?.response?.status === 401 && !original?._retry && !isRefreshCall) {
            if (isRefreshing) {
                // มีการ refresh ค้างอยู่ → รอให้เสร็จ
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(api(original));
                    });
                });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                const {data} = await api.post("/auth/refresh"); // ใช้ cookie ในตัว
                setAccessToken(data.accessToken);
                onRefreshed(data.accessToken);

                // ✅ อัปเดต token ใน localStorage เพื่อให้ apiCall ใช้ได้
                if (typeof window !== "undefined") {
                    localStorage.setItem("access_token", data.accessToken);
                }

                return api(original);
            } catch (refreshErr) {
                setAccessToken(null);
                onRefreshed(""); // ให้คิว fail เร็วขึ้น หรือจะ reject ก็ได้

                // ✅ ลบ token จาก localStorage
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                }

                if (typeof window !== "undefined") {
                    window.location.href = "/auth/login";
                }

                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// ========================================
// apiCall (JS version)
// ========================================

const getAuthToken = () => {
    return localStorageUtils.getAccessToken();
};

export const apiCall = async (options, retryCount = 0) => {
    try {
        const token = getAuthToken();
        const isFormData = typeof FormData !== "undefined" && options.data instanceof FormData;

        // สร้าง headers พื้นฐาน
        const defaultHeaders = {};
        if (!isFormData) {
            defaultHeaders["Content-Type"] = "application/json";
        }

        // รวม headers: default -> custom -> token
        const headers = {
            ...defaultHeaders,
            ...(options.headers || {}),
        };

        // เพิ่ม token อัตโนมัติ (ถ้ายังไม่มี Authorization header)
        if (token && !headers["Authorization"]) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            method: options.method,
            url: `${process.env.NEXT_PUBLIC_INTERNAL_KEY_CLIENT}${options.url}`,
            headers,
            withCredentials: true,
            ...(options.data ? {data: options.data} : {}),
            ...(options.params ? {params: options.params} : {}),
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        // Handle 401 error with retry
        if (error?.response?.status === 401 && retryCount < 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return apiCall(options, retryCount + 1);
        }

        console.error("API Call Error:", error);
        throw error;
    }
};

// ========================================
// Helper functions - headers เป็น optional
// ========================================

export const apiGet = (url, params, headers) => {
    return apiCall({method: "GET", url, params, headers});
};

export const apiPost = (url, data, headers) => {
    return apiCall({method: "POST", url, data, headers});
};

export const apiPut = (url, data, headers) => {
    return apiCall({method: "PUT", url, data, headers});
};

export const apiDelete = (url, data, headers) => {
    return apiCall({method: "DELETE", url, data, headers});
};

export const apiPatch = (url, data, headers) => {
    return apiCall({method: "PATCH", url, data, headers});
};
