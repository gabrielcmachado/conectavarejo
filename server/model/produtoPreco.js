import { DataTypes } from 'sequelize';
import { Sequelize_bimer } from '../sequelize.js';

const ProdutoPreco = Sequelize_bimer.define('ProdutoPreco', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    }
    // Adicione outros campos conforme necessário
});

export { ProdutoPreco };
