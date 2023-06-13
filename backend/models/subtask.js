"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subtask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Todo, { foreignKey: "TodoId", as: "todo" });
    }
  }
  Subtask.init(
    {
      title: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: DataTypes.DATE,
      TodoId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Todos",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subtask",
    },
  );
  return Subtask;
};
