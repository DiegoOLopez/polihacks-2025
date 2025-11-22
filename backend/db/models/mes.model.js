const { Model, DataTypes, Sequelize } = require('sequelize')

const MES = 'mes'

const mes_schema = {
  id_mes:{
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  mes:{
    allowNull: false,
    type: DataTypes.STRING
  }
}

class Mes extends Model{
  static associate(models){
    this.belongsTo(models.Pago, { as: 'pago', foreignKey: 'id_mes'})
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: MES,
      modelName: 'Mes',
      timestamps: false
    }
  }
}


// Exportar tabla, esquema y modelo
module.exports = { MES, mes_schema, Mes }
