/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('accounts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            uuid: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                unique: true
            },
            inactivatedAt: {
                type: Sequelize.DATE
            },
            status: {
                type: Sequelize.ENUM('ACTIVE', 'CANCELLED', 'PAYMENT_PENDING', 'TRIAL'),
                defaultValue: 'TRIAL',
                allowNull: false
            },
            userMaster: {
                type: Sequelize.STRING,
                unique: true
            },
            nome: {
                type: Sequelize.STRING
            },
            endereco: {
                type: Sequelize.STRING
            },
            cidade: {
                type: Sequelize.STRING
            },
            cep: {
                type: Sequelize.STRING
            },
            uf: {
                type: Sequelize.STRING
            },
            bairro: {
                type: Sequelize.STRING
            },
            numero: {
                type: Sequelize.STRING
            },
            complemento: {
                type: Sequelize.STRING
            },
            cpfCnpj: {
                type: Sequelize.STRING
            },
            rgIe: {
                type: Sequelize.STRING
            },
            emailCobranca: {
                type: Sequelize.STRING,
                isEmail: true
            },
            telefone: {
                type: Sequelize.STRING
            },
            celular: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('accounts');
    }
};
