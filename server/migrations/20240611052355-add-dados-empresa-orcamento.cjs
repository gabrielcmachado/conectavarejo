/* eslint-disable no-unused-vars */
'use strict';

/** @type {import('sequelize-cli').Migration} */
// eslint-disable-next-line no-undef
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    'Orcamentos',
                    'dadosEmpresa',
                    {
                        type: Sequelize.JSON
                    },
                    { transaction: t }
                )
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([queryInterface.removeColumn('Orcamentos', 'dadosEmpresa', { transaction: t.transaction })]);
        });
    }
};
