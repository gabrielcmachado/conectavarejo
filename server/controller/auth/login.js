/* eslint-disable no-unused-vars */
import { User } from '../../model/user.js';
import bcrypt from 'bcryptjs';
import { secret } from '../../config/auth.config.js';
import jwt from 'jsonwebtoken';

const newLogin = async (req, res) => {
    User.findOne({ where: { email: req.body.email } })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: 'Usuário ou senha inválido, verifique!' });
            }

            const validatedPass = bcrypt.compareSync(req.body.password, user.password);

            if (!validatedPass) {
                return res.status(401).send({ message: ' Usuário ou senha inválido, verifique!' });
            }

            const jwtToken = jwt.sign({ uuid: user.uuid }, secret, {
                expiresIn: 3600
            });

            res.status(200).send({
                uuid: user.uuid,
                email: user.email,
                account: user.accountUuid,
                status: user.status,
                role: user.roleId,
                accessToken: jwtToken
            });
        })
        .catch((err) => {
            res.status(500).send({ message: err.message });
        });
};


export { newLogin }