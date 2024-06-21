import axios from 'axios';

const instanceLocalServer = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_API
});

const blankInstance = axios.create({});

export { instanceLocalServer, blankInstance };
