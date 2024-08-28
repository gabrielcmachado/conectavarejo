import { DataTypes } from 'sequelize';
import { Sequelize_base } from '../sequelize.js';

const CaracteristicaBimerConecta = Sequelize_base.define('CaracteristicaBimerConecta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    caracteristicaConecta: {
        type: DataTypes.ENUM('BAIXO_POTENCIAL', 'CAMPEAO_DESPEDINDO', 'CAMPEAO', 'CARENTE', 'CLIENTE_FIEL', 'EX_CAMPEAO', 'FIEL_ABANDONADO', 'PERDIDO', 'PORENCIAL_CAMPEAO', 'PROMESSA', 'RECEM_CHEGADO', 'TALENTO_DESPERDICADO'),
        allowNull: false
    },
    idCaracteristicaBimer: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nomeCaracteristicaBimer: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default CaracteristicaBimerConecta;
