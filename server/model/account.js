/* eslint-disable no-unused-vars */
import { DataTypes, Sequelize } from 'sequelize';
import { Sequelize_base } from '../sequelize.js';
import bcrypt from 'bcryptjs';
import { AccountConfig } from './accountConfig.js';

const Account = Sequelize_base.define('Account', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true
    },
    inactivatedAt: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'PAYMENT_PENDING', 'TRIAL'),
        defaultValue: 'TRIAL',
        allowNull: false
    },
    userMaster: {
        type: DataTypes.STRING
    },
    nome: {
        type: DataTypes.STRING
    },
    endereco: {
        type: DataTypes.STRING
    },
    cidade: {
        type: DataTypes.STRING
    },
    cep: {
        type: DataTypes.STRING
    },
    uf: {
        type: DataTypes.STRING
    },
    bairro: {
        type: DataTypes.STRING
    },
    numero: {
        type: DataTypes.STRING
    },
    complemento: {
        type: DataTypes.STRING
    },
    cpfCnpj: {
        type: DataTypes.STRING
    },
    rgIe: {
        type: DataTypes.STRING
    },
    emailCobranca: {
        type: DataTypes.STRING,
        isEmail: true
    },
    telefone: {
        type: DataTypes.STRING
    },
    celular: {
        type: DataTypes.STRING
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
    }
});

Account.associate = function (models) {
    Account.hasMany(models.User, {
        foreignKey: 'accountUuid',
        as: 'users'
    });
    Account.hasMany(models.AccountConfig, {
        foreignKey: 'accountId',
        as: 'accountConfigs'
    });
};

Account.addHook('afterCreate', async (account, options) => {
    const { transaction, userData } = options;
    const User = Sequelize_base.models.User;

    try {
        const masterUser = await User.create(
            {
                ...userData,
                accountUuid: account.uuid
            },
            { transaction }
        );

        const config = await AccountConfig.create(
            {
                accountId: account.uuid,
                configuration: {
                    account: {},
                    modules: {
                        bimer: {}
                    }
                }
            },
            { transaction }
        );

        account.userMaster = masterUser.uuid;

        await account.save({ transaction });
    } catch (error) {
        console.error('Erro ao criar o usuário inicial:', error);
    }
});

Account.addHook('beforeUpdate', async (account, options) => {
    if (account.changed('status')) {
        const User = Sequelize_base.models.User;
        await User.update({ status: account.status }, { where: { accountUuid: account.uuid }, transaction: options.transaction });
    }
});

Sequelize_base.sync();

export { Account };
