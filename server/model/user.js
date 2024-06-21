import { DataTypes } from 'sequelize';
import { Sequelize_base } from '../sequelize.js';

const User = Sequelize_base.define('User', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    uuid: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        isEmail: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'PAYMENT_PENDING', 'TRIAL'),
        defaultValue: 'TRIAL',
        allowNull: false
    },
    accountUuid: {
        type: DataTypes.UUID,
        references: {
            model: 'Accounts',
            key: 'uuid'
        }
    },
    inactivated: {
        type: DataTypes.DATE
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

User.associate = function (models) {
    User.belongsTo(models.Account, {
        foreignKey: 'accountUuid',
        as: 'account'
    });
};

Sequelize_base.sync();

export { User };
