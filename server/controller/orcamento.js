// Importe o modelo do Sequelize
import { Orcamento, ProdutosOrcamento } from '../model/orcamento.js';

// Controlador para a lógica relacionada a orçamentos
export const criarOrcamento = async (req, res) => {
    try {
        // Extraia as informações do corpo da requisição
        const { nome, telefone, produtos, vendedor, geroupedido, dadosEmpresa } = req.body;
        console.log (dadosEmpresa)
        // Crie um novo orçamento no banco de dados
        const novoOrcamento = await Orcamento.create({
            nome,
            telefone,
            vendedor,
            geroupedido,
            dadosEmpresa
        });

        // Adicione produtos associados ao orçamento
        await Promise.all(
            produtos.map(async (produto) => {
                await ProdutosOrcamento.create({
                    codigo: produto.codigo,
                    quantidade: produto.quantidade,
                    nome: produto.nome,
                    valorunitario: produto.valorunitario,
                    OrcamentoId: novoOrcamento.id
                });
            })
        );

        res.status(201).json({ message: 'Orçamento criado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar orçamento' });
    }
};

// Controlador para obter todos os orçamentos sem os produtos
export const obterTodosOrcamentos = async (req, res) => {
    try {
        // Busque todos os orçamentos no banco de dados, excluindo os produtos associados
        const orcamentos = await Orcamento.findAll({
            attributes: { exclude: ['updatedAt'] } // Exclui as timestamps
        });

        // Retorne os dados de todos os orçamentos sem os produtos
        res.status(200).json(orcamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter orçamentos' });
    }
};

// Controlador para obter todos os orçamentos sem os produtos
export const obterOrcamentoPorID = async (req, res) => {
    try {
        const { orcamentoId } = req.params;

        // Busque o orçamento no banco de dados, excluindo os produtos associados
        const orcamento = await Orcamento.findByPk(orcamentoId, {
            include: [{ model: ProdutosOrcamento }] // Exclui os produtos
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        // Retorne os dados do orçamento sem os produtos
        res.status(200).json(orcamento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter orçamentos' });
    }
};
