import axios from 'axios';

let logoutFunction = null;

export const setLogout = (logout) => {
    logoutFunction = logout;
};

const axiosInstance = axios.create({
    baseURL: 'http://localost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    response => response,
     error => {
        if (error.response && error.response.status === 401) {
            console.warn('401 detected - logging out');
            logoutFunction();
        }
        return Promise.reject(error);
     }
);

export default axiosInstance;