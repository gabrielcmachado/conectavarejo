import { QueryTypes } from 'sequelize';
import { Sequelize_bimer } from '../sequelize.js';

const consultarClienteTelefoneController = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Parâmetro de consulta não fornecido' });
        }

        const consultaSql = `
        SELECT top 1 vwpc.IdPessoa, vwpc.dscontato, vwpc.nmcontato, vwpc.StContatoPrincipal, vwpc.IdTipoContato, p.nmpessoa from vw_PessoaEndereco_TipoContato as vwpc inner join
        pessoa as p on (vwpc.IdPessoa = p.IdPessoa) where (DsContato like :query) and (vwpc.StContatoPrincipal='S') 
      `;

        const contatos = await Sequelize_bimer.query(consultaSql, {
            replacements: { query: `%${query}%` },
            type: QueryTypes.SELECT
        });

        res.json({ contatos });
    } catch (error) {
        console.error(`Erro ao consultar contato: ${error.message}`);
        res.status(500).json({ error: 'Erro ao consultar contato' });
    }
};

export { consultarClienteTelefoneController };
