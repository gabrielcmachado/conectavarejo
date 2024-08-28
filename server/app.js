import express from 'express';
import https from 'https';
import fs from 'fs';
import routes from './routes/index.js';
import cors from 'cors';
import { config } from 'dotenv';
import http from 'http';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: envFile });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    req.socket.servername = null;
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    req.header('Access-Control-Allow-Origin', '*');
    req.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    req.header('Access-Control-Allow-Headers', 'Content-Type');
    req.header('Access-Control-Allow-Private-Network', true);
    res.header('Access-Control-Allow-Private-Network', true);
    next();
});

app.use('/', routes);

if (envFile == '.env.production') {
    const httpsOptions = {
        key: fs.readFileSync(`${process.env.CERTIFICATE_HTTPS_KEY}`),
        cert: fs.readFileSync(`${process.env.CERTIFICATE_HTTPS_CERT}`)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`Servidor rodando em produção na porta ${PORT}`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`Servidor rodando em dev na porta ${PORT}`);
    });
}
