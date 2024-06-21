import { DataTypes } from 'sequelize';
import { Sequelize_base } from '../sequelize.js';

// Modelo para a tabela Orcamento
const Orcamento = Sequelize_base.define('Orcamento', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vendedor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    geroupedido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dadosEmpresa:{
        type: DataTypes.JSON,
        allowNull: false
    }

});

// Modelo para a tabela Produto
const ProdutosOrcamento = Sequelize_base.define('ProdutosOrcamento', {
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valorunitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

// Relacionamento entre as tabelas Orcamento e Produto
Orcamento.hasMany(ProdutosOrcamento);
ProdutosOrcamento.belongsTo(Orcamento);

Sequelize_base.sync();

export { Orcamento, ProdutosOrcamento };
