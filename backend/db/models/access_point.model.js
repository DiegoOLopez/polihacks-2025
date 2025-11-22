const { Model, DataTypes, Sequelize } = require('sequelize')

const ACCESS = 'access';
const { EMPRESA } = require('./empresa.model')

const access_schema = {

  id_access: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  nombre_ubicacion: {
    allowNull: false,
    type: DataTypes.STRING
  },
  direccion: {
    allowNull: false,
    type: DataTypes.STRING
  },
  ubicacion: {
    allowNull: false,
    type: DataTypes.STRING
  },

  id_empresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_empresa',
    references: {
      model: EMPRESA,
      key: 'id_empresa'
    }
  }

}

class Access extends Model {
  static associate(models){
    // Relacion access point - servicio
    // Donde un access point puede tener muchos servicios
    // Y un servicio puede tener un access point
    // Especificamos que pertenece al model Servicio, donde dentro de servicio se tiene la foreign key de id_access
    this.belongsTo(models.Servicio, { as: 'servicio', foreignKey: 'id_access' })
    
  }

  static config(sequelize){
    return {
      sequelize,
      tableName: ACCESS,
      modelName: 'Access',
      timestamps: false
    }
  }
}

module.exports = { ACCESS, access_schema, Access }
