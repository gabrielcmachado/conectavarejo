import { QueryTypes } from 'sequelize';
import { Sequelize_bimer } from '../sequelize.js';
import { instanceBimer } from '../config/axiosBimer.js';
import { verifyToken } from '../middleware/tokenBimer.js';

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

        if (contatos.length === 0) {
            return res.status(404).json({ error: 'Contato não encontrado' });
        }

        const { IdPessoa } = contatos[0];

        verifyToken(req, res, async () => {
            const options = {
                headers: {
                    Authorization: req.headers.Authorization
                }
            };
            try {
                const response = await instanceBimer.get(`/api/pessoas/${IdPessoa}`, options);
                const detalhesPessoa = response.data;
                res.json({ detalhesPessoa });
            } catch (error) {
                console.error(`Erro ao consultar detalhes da pessoa: ${error.message}`);
                res.status(500).json({ error: 'Erro ao consultar detalhes da pessoa' });
            }
        });
    } catch (error) {
        console.error(`Erro ao consultar contato: ${error.message}`);
        res.status(500).json({ error: 'Erro ao consultar contato' });
    }
};

export { consultarClienteTelefoneController };
