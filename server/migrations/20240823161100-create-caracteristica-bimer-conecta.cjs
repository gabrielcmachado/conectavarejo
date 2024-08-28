/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('CaracteristicaBimerConecta', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            caracteristicaConecta: {
                type: Sequelize.ENUM('BAIXO_POTENCIAL', 'CAMPEAO_DESPEDINDO', 'CAMPEAO', 'CARENTE', 'CLIENTE_FIEL', 'EX_CAMPEAO', 'FIEL_ABANDONADO', 'PERDIDO', 'POTENCIAL_CAMPEAO', 'PROMESSA', 'RECEM_CHEGADO', 'TALENTO_DESPERDICADO'),
                allowNull: false
            },
            idCaracteristicaBimer: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            nomeCaracteristicaBimer: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('CaracteristicaBimerConecta');
    }
};
