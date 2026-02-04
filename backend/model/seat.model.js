import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Hall from "./hall.model.js";

const Seat = sequelize.define(
  "Seat",
  {
    seat_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    row_label: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
  },
  {
    tableName: "seats",
    timestamps: false,
  }
);

Hall.hasMany(Seat, { foreignKey: "hall_id" });
Seat.belongsTo(Hall, { foreignKey: "hall_id" });

export default Seat;
