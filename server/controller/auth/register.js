/* eslint-disable no-unused-vars */
import { User, Account } from '../../model/index.js';
import bcrypt from 'bcryptjs';
import { secret } from '../../config/auth.config.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Sequelize_base } from '../../sequelize.js';

const newAccount = async (req, res) => {
    const transaction = await Sequelize_base.transaction();
    try {
        const account = await Account.create(
            {
                nome: req.body.nome,
                endereco: req.body.endereco,
                cidade: req.body.cidade,
                cep: req.body.cep,
                uf: req.body.uf,
                bairro: req.body.bairro,
                numero: req.body.numero,
                complemento: req.body.complemento,
                cpfCnpj: req.body.cpfCnpj,
                rgIe: req.body.rgIe,
                emailCobranca: req.body.emailCobranca,
                telefone: req.body.telefone,
                celular: req.body.celular,
                status: 'TRIAL'
            },
            {
                transaction,
                userData: {
                    name: req.body.user.name,
                    email: req.body.user.email,
                    password: bcrypt.hashSync(req.body.user.password, 8),
                    roleId: 1,
                    status: 'TRIAL'
                }
            }
        );

        await transaction.commit();

        const firstUser = await User.findOne({
            where: {
                accountUuid: account.uuid
            }
        });

        return res.status(200).json({
            message: 'Conta criada com sucesso',
            account,
            user: firstUser
        });
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        return res.status(500).json({
            message: 'Erro ao criar conta',
            error: err.message
        });
    }
};

const registerNewUser = async (req, res) => {
    const newUser = {
        email: req.body.email,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 8),
        UUID: uuidv4(),
        roleId: 0,
        status: true,
        accountUuid: req.body.accountUuid
    };

    User.create(newUser)
        .then((newUser) => {
            res.status(200).send({ message: 'Usuário Registrado com Sucesso' });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};

export { registerNewUser, newAccount };
