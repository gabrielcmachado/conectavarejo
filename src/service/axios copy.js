import axios from 'axios';

const instanceBimer = axios.create({
    baseURL: 'https://server.vagalumedobrasil.com.br/api/'
});
const instanceLocalServer = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_API
});

const blankInstance = axios.create({});

let oldToken;

const getNewToken = async () => {
    try {
        const token = await instanceLocalServer.get('gerar-token');
        oldToken = token.data.token;
        return oldToken;
    } catch (error) {
        console.error('Erro ao obter novo token:', error);
        throw error;
    }
};
         
const requestHandler = async (config) => {
    if (!oldToken) {
        oldToken = await getNewToken();
    }
    config.headers.Authorization = `Bearer ${oldToken}`;
    return config;
};

const errorHandler = async (error) => {
    if (error.response && error.response.status === 401) {
        // Unauthorized, obtém um novo token
        try {
            oldToken = await getNewToken();
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${oldToken}`;
            return instanceBimer(originalRequest);
        } catch (tokenError) {
            console.error('Erro ao obter novo token:', tokenError);
            return Promise.reject(error);
        }
    }
    return Promise.reject(error);
};

// Interceptadores de requisição e resposta
instanceBimer.interceptors.request.use(requestHandler, errorHandler);
instanceBimer.interceptors.response.use((response) => response, errorHandler);

export { instanceBimer, instanceLocalServer, blankInstance };
