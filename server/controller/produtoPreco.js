import { QueryTypes } from 'sequelize';
import { Sequelize_bimer } from '../sequelize.js';

const consultarProdutoController = async (req, res) => {
    try {
        const { query, idempresa, idpreco } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Parâmetro de consulta não fornecido' });
        }

        const consultaSql = `
        SELECT vpe.IdProduto, vp.CdChamada as codigo, vp.NmProduto as nome, vpep.VlPreco as preco
        FROM vw_produto AS vp
        INNER JOIN vw_ProdutoEmpresa AS vpe ON vp.IdProduto = vpe.IdProduto
        INNER JOIN vw_ProdutoEmpresaPreco AS vpep ON vpe.IdProduto = vpep.IdProduto
        WHERE
          vpe.CdEmpresa = :idempresa AND
          vpep.CdEmpresa = :idempresa AND
          vpep.VlPreco IS NOT NULL AND
          vpep.idpreco = :idpreco AND
          vp.StAtivo = 's' AND
          vp.StCodigoPrincipal = 's' AND
          vp.NmProduto LIKE :query
        ORDER BY vp.NmProduto;
      `;

        const produtos = await Sequelize_bimer.query(consultaSql, {
            replacements: { query: `%${query}%`, idpreco: `${idpreco}`, idempresa: `${idempresa}` },
            type: QueryTypes.SELECT
        });

        res.json({ produtos });
    } catch (error) {
        console.error(`Erro ao consultar produtos: ${error.message}`);
        res.status(500).json({ error: 'Erro ao consultar produtos' });
    }
};

export { consultarProdutoController };
