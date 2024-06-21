import { Sequelize } from 'sequelize';

// Sequelize bimer
const Sequelize_bimer = new Sequelize({
    dialect: 'mssql',
    host: 'server.vagalumedobrasil.com.br',
    dialectOptions: {
        authentication: {
            type: 'default',
            options: {
                userName: 'sa',
                password: '08gmhc89.',
                encrypt: false,
                trustServerCertificate: true
            }
        }
    },
    database: 'ALTERDATA',
    define: {
        timestamps: false
    },
    options: {
        instanceName: 'CONEXUSVAGALUME' // Substitua 'SuaInstancia' pelo nome da sua instância SQL Server
    }
});

// Sequelize Aplicação
const Sequelize_base = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '08Gmhc89*#@',
    database: 'conecta_varejo_db'
});

export { Sequelize_bimer, Sequelize_base };
