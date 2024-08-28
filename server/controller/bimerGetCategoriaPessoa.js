import { instanceBimer } from '../config/axiosBimer.js';

export const getAllCaracteristicasPessoasBimer = async (req, res) => {
    try {
        const options = {
            method: req.method,
            url: req.url,
            headers: {
                Authorization: req.headers.Authorization
            }
        };
        console.log(options)
        const resposta = await instanceBimer(options);

        const resultado = resposta.ListaObjetos.map(({ Identificador, Nome }) => ({ Identificador, Nome }));
        res.json({ resultado });
    } catch (error) {
        if (error.response.data) {
            res.status(400).json(error.response.data);
        } else {
            res.json(error);
        }
    }
};
