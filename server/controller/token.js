// import { gerarToken } from '../model/token.js';

// const gerarTokenController = async (req, res) => {
//     const baseUrl = 'https://server.vagalumedobrasil.com.br'; // Use a mesma baseUrl ou altere conforme necessário
//     try {
//         const token = await gerarToken(baseUrl);
//         res.json({ token });
//         console.log(`Token gerado com sucesso para a requisição de ${req.headers.origin}`);
//     } catch (error) {
//         console.error(`Erro ao obter o token: ${error.message}`);
//         res.status(500).json({ error: 'Erro ao obter o token' });
//     }
// };

// export { gerarTokenController };
