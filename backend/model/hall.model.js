import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Hall = sequelize.define(
  "Hall",
  {
    hall_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("hall_name", value.trim());
      },
    },
    hall_location: {
      type: DataTypes.STRING(30),
      allowNull: false,
      set(value) {
        this.setDataValue("hall_location", value.trim());
      },
    },
    hall_contact: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("hall_contact", value.trim());
      },
    },
    license: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^091-\d{8}$/,
          msg: "License must be in 091-XXXXXXXX format",
        },
      },
      set(value) {
        this.setDataValue("license", value.trim());
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
    },
    registeredDate: {
      type: DataTypes.DATEONLY,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hallPoster: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "Hall",
    timestamps: true,
  },
);

export default Hall;
