import { instanceBimer } from '../config/axiosBimer.js';
import qs from 'qs';

export const verifyToken = async (req, res, next) => {
    let token = req.headers['authorization'];
    try {
        token = await gerarToken();
        req.headers.Authorization = 'Bearer ' + token;
        next();
    } catch (err) {
        return res.status(401).send({ message: err.message });
    }
};
const gerarToken = async () => {
    try {
        const dadosAutenticacao = {
            client_id: 'IntegracaoBimer.js',
            grant_type: 'password',
            username: 'supervisor',
            nonce: '5621e0f499111e5cbbbe854aa2c45e84',
            password: '169c1ded0badeeb4b8f81ac2eac4dc1e'
        };

        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(dadosAutenticacao),
            url: `/oauth/token`,
            mode: 'no-cors'
        };

        const response = await instanceBimer(options);
        return response.data.access_token;
    } catch (error) {
        console.error(error);
        throw new Error(`Erro ao obter o token: ${error.message}`);
    }
};
