"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Subtask, { foreignKey: "TodoId", as: "subtasks" });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Todo",
      defaultScope: {
        order: [["id", "ASC"]],
      },
    },
  );
  return Todo;
};
