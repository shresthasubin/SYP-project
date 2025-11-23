import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const User = sequelize.define(
    'User',
    {
        fullname: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                is: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            }
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        agreeTerm: {
            type: DataTypes.BOOLEAN
        },
        role: {
            type: DataTypes.ENUM("user", "hall-admin", "brand-admin", "super-admin"),
            defaultValue: 'user'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        timestamps: true
    }
)

export default User;