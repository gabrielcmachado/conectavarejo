/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict';

const { v4:uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'Users',
            [
                {
                    email: 'gabriel@beng.digital',
                    UUID:uuidv4(),
                    password: '08Gmhc89*#@',
                    roleId: 0,
                    status: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
    }
};
