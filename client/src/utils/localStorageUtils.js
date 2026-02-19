export const getToken = () => localStorage.getItem('token');
export const setToken = token => localStorage.setItem('token', token);

export const getAccessToken = () => localStorage.getItem('accessToken');
export const setAccessToken = token => localStorage.setItem('accessToken', token);