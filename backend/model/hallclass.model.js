import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";
import Hall from "./hall.model.js";

const Hallclass = sequelize.define(
    "Hallclass",
    {
        seatType: {
            type: DataTypes.ENUM("regular", "premium"),
            allowNull: false,
            primaryKey: true
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        id: false
    }
)

export default Hallclass