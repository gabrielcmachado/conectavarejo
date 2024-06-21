import { DataTypes, Sequelize } from 'sequelize';
import { Sequelize_base } from '../sequelize.js';
const AccountConfig = Sequelize_base.define('AccountConfig', {
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
    accountId: {
        type: DataTypes.UUID,
        references: {
            model: 'Accounts',
            key: 'uuid'
        }
    },
    configuration: {
        type: DataTypes.JSON
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

Sequelize_base.sync();

export { AccountConfig };
