import express from 'express';
// import { gerarTokenController } from '../controller/token.js';
import { consultarProdutoController } from '../controller/produtoPreco.js';
import { consultarProdutoCodigoController } from '../controller/produtoPrecoCodigo.js';
import { criarOrcamento, obterTodosOrcamentos, obterOrcamentoPorID } from '../controller/orcamento.js';
import { byPassBimerController } from '../controller/bimerController.js';
import { verifyToken } from '../middleware/tokenBimer.js';
import { consultarClienteTelefoneController } from '../controller/clienteportelefone.js';
import { getAllCaracteristicasPessoasBimer } from '../controller/bimerGetCategoriaPessoa.js';

const router = express.Router();

router.get('/api/configuracoes', verifyToken, byPassBimerController);
router.get('/api/produtos', verifyToken, byPassBimerController);
router.get('/api/operacoes', verifyToken, byPassBimerController);
router.get('/api/operacoes/:identificador', verifyToken, byPassBimerController);
router.get('/api/pessoas', verifyToken, byPassBimerController);
router.post('/api/clientes', verifyToken, byPassBimerController);
router.post('/api/pessoas/caracteristicas', verifyToken, getAllCaracteristicasPessoasBimer);
router.post('/api/pessoas/:identificador/caracteristicas', verifyToken, byPassBimerController);
router.post('/api/venda/pedidos', verifyToken, byPassBimerController);
router.get('/api/setores', verifyToken, byPassBimerController);
router.get('/api/empresas', verifyToken, byPassBimerController);
router.get('/api/tabelaprecos/porNome', verifyToken, byPassBimerController);
router.get('/consulta-produto', consultarProdutoController);
router.get('/consulta-produto-codigo', consultarProdutoCodigoController);
router.get('/consulta-cliente-telefone', consultarClienteTelefoneController);
router.post('/orcamento', criarOrcamento);
router.get('/orcamento', obterTodosOrcamentos);
router.get('/orcamento/:orcamentoId', obterOrcamentoPorID);

export default router;


