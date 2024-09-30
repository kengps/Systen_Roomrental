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
import { logged } from '../../api/login_register';


const persistMiddleware = create(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: '',
            Login: async (value) => {
                const response = await logged(value);
                console.log(`⩇⩇:⩇⩇🚨  file: persistMiddleware.js:32  persist value :`, value);

                set({
                    user: response.data,
                    isAuthenticated: true
                })
                console.log('Save data in persist success');
                return response.data

            },
            Logout: () => {
                set({ user: '', isAuthenticated: false });
            }
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
            getStorage: () => localStorage // เลือกใช้ localStorage
        },
    ),
)
export default persistMiddleware;
