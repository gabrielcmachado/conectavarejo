import { instanceBimer } from '../config/axiosBimer.js';

export const bimerController = async (req, res) => {
    try {
        const options = {
            method: req.method,
            url: req.url,
            headers: {
                Authorization: req.headers.Authorization
            },
            data: req.body
        };
        const resposta = await instanceBimer(options);
        res.json({resposta:resposta.data, tokenBimer:req.headers.Authorization});
    } catch (error) {
        if (error.response.data){
        res.status(400).json(error.response.data)
        } else{
            res.json(error)
        };
    }
};