'use strict';
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Users', 'roleId', {
            type: Sequelize.JSON,
            allowNull: true // ou false, dependendo se você permite valores nulos
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('User', 'roleId', {
            type: Sequelize.INTEGER,
            allowNull: true // ou false, dependendo da configuração original
        });
    }
};
