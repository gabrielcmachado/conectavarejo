import { instanceBimer } from '../config/axiosBimer.js';

export const getClienteBimerId = async (req, res) => {
    try {
        const pessoaBimer = await instanceBimer.get(`/api/pessoas/${req.IdPessoa}`);
        res.status(200).json({pessoaBimer})
    } catch (erro) {
        console.log(erro);
    }
};

