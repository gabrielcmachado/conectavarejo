import express from 'express';
// import { gerarTokenController } from '../controller/token.js';
import { consultarProdutoController } from '../controller/produtoPreco.js';
import { consultarProdutoCodigoController } from '../controller/produtoPrecoCodigo.js';
import { criarOrcamento, obterTodosOrcamentos, obterOrcamentoPorID } from '../controller/orcamento.js';
import { consultarClienteTelefoneController } from '../controller/clienteportelefone.js';
import { bimerController } from '../controller/bimerController.js';
import { verifyToken } from '../middleware/tokenBimer.js';

const router = express.Router();

router.get('/api/pessoas', verifyToken, bimerController);
router.post('/api/clientes', verifyToken, bimerController);
router.post('/api/pessoas/:identificador/caracteristicas', verifyToken, bimerController);
router.get('/api/setores', verifyToken, bimerController);
router.get('/api/empresas', verifyToken, bimerController);
router.get('/api/tabelaprecos/porNome', verifyToken, bimerController);
router.get('/consulta-produto', consultarProdutoController);
router.get('/consulta-produto-codigo', consultarProdutoCodigoController);
router.get('/consulta-cliente-telefone', consultarClienteTelefoneController);
router.post('/orcamento', criarOrcamento);
router.get('/orcamento', obterTodosOrcamentos);
router.get('/orcamento/:orcamentoId', obterOrcamentoPorID);


export default router;
