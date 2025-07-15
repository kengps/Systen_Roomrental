// const persistMiddleware = (key, config) => (set, get, api) => {
//     const savedData = localStorage.getItem(key);
//     if (savedData) {
//       set(JSON.parse(savedData));
//     }

//     return config(
//       (args) => {
//         set(args);
//         localStorage.setItem(key, JSON.stringify(get()));
//       },
//       get,
//       api
//     );
//   };

//   export default persistMiddleware;


import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { logged, logouted } from '../../api/login_register';
import { getDataApartment } from '../../api/apartment';


const persistMiddleware = create(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: '',
            token: '',
            expirationTime: null,
            apartmentData: '',
            Login: async (value) => {
                const response = await logged(value);
                const token = response.data.token; // Assuming your API returns a token
                const expiresIn = 2 * 60 * 60 * 1000; // 1 hour in milliseconds
                const expirationTime = Date.now() + expiresIn;

                set({
                    user: response.data,
                    isAuthenticated: true,
                    token: token,
                    expirationTime: expirationTime
                });

                // Set timeout to automatically logout after token expires
                setTimeout(() => {
                    get().Logout();
                }, expiresIn);

                console.log('Save data in persist success');
                return response.data;
            },
            Logout: async (userId) => {
                const res = await logouted(userId);
                set({ user: '', isAuthenticated: false, token: '', expirationTime: null, apartmentData: '' });
                localStorage.clear();
                return res

            },
            clearLocalStorage: async (userId) => {
                set({ user: '', isAuthenticated: false, token: '', expirationTime: null });
                localStorage.clear();
            },
            checkTokenExpiration: () => {
                const expirationTime = get().expirationTime;
                if (expirationTime && Date.now() > expirationTime) {
                    get().Logout(); // Auto logout if token has expired
                }
            },
            GetDataApartment: async (profileId) => {
                const res = await getDataApartment(profileId)
               
                set({ apartmentData: res.data })
            }
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage // Use localStorage
        }
    ),
);

export default persistMiddleware;
