import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { currentUser, logged } from '../../api/login_register';



const store = (set) => ({
    isAuthenticated: false,
    user: '',
    Login: async (value) => {
        const response = await logged(value);
        set({ user: response.data })
        return response.data
    }
    ,
    FetchUserInfo: async (token) => {
        console.log(`⩇⩇:⩇⩇🚨  file: loginStore.js:17  FetchUserInfo token :`, token);

        try {
            if (token) {
                await currentUser(token).then((res) => {
                    console.log(`⩇⩇:⩇⩇🚨  file: loginStore.js:22  res :`, res);

                    set({
                        isAuthenticated: true,
                        user: {
                            token: token,
                            payLoad: {
                                user: {
                                    username: res.data.username,
                                    role: res.data.role,
                                    id: res.data._id
                                }
                            }
                        }
                    });

                })

            }

        } catch (error) {
            console.log("➡️  file: storeZustand.js:16  error:", error.response.data)
        }
    }
});


export const storeAuth = create(devtools(store));