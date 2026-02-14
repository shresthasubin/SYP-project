import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Hallroom from "./hall.model.js";
import Hallclass from "./hallclass.model.js";

const Seat = sequelize.define(
  "Seat",
  {
    seatName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    row: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    column: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM("sold","pending","available"),
      allowNull: false,
      defaultValue: "available"
    },
    layoutStatus: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: false,
      defaultValue: "enabled"
    }
  },
  {
    timestamps: true,
  }
);

Hallroom.hasMany(Seat, { foreignKey: "hallroom_id" });
Seat.belongsTo(Hallroom, { foreignKey: "hallroom_id" });

Hallclass.hasMany(Seat, { foreignKey: "seatType" });
Seat.belongsTo(Hallclass, {foreignKey: "seatType"})

export default Seat;
