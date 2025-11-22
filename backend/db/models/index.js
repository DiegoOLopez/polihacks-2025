const { estado_schema, Estado } = require('./estado.model')
const { municipio_schema, Municipio } = require('./municipio.model')
const { localidad_schema, Localidad } = require('./localidad.model')
const { cliente_schema, Cliente } = require('./cliente.model')
const { plan_schema, Plan } = require('./plan.model')
const { access_schema, Access } = require('./access_point.model')
const { servicio_schema, Servicio } = require('./servicio.model')
const { pago_schema, Pago } = require('./pago.model')
const { mes_schema, Mes } = require('./mes.model')
const { anio_schema, Anio } = require('./anio.model')
const { empresaSchema, Empresa } = require('./empresa.model')
const { UsuarioSchema, Usuario } = require('./usuario.model')
const { rolSchema, Rol } = require('./rol.model')
const { suscripcionSchema, Suscripcion } = require('./suscripcion.model')

function setupModels(sequelize) {
  Estado.init(estado_schema, Estado.config(sequelize))
  Municipio.init(municipio_schema, Municipio.config(sequelize))
  Localidad.init(localidad_schema, Localidad.config(sequelize))
  Cliente.init(cliente_schema, Cliente.config(sequelize))
  Plan.init(plan_schema, Plan.config(sequelize))
  Access.init(access_schema, Access.config(sequelize))
  Servicio.init(servicio_schema, Servicio.config(sequelize))
  Pago.init(pago_schema, Pago.config(sequelize))
  Mes.init(mes_schema, Mes.config(sequelize))
  Anio.init(anio_schema, Anio.config(sequelize))
  Empresa.init(empresaSchema, Empresa.config(sequelize))
  Usuario.init(UsuarioSchema, Usuario.config(sequelize))
  Rol.init(rolSchema, Rol.config(sequelize))
  Suscripcion.init(suscripcionSchema, Suscripcion.config(sequelize))

  // Relacionamos
  Estado.associate(sequelize.models);
  Municipio.associate(sequelize.models);
  Localidad.associate(sequelize.models);
  Cliente.associate(sequelize.models);
  Plan.associate(sequelize.models);
  Access.associate(sequelize.models);
  Servicio.associate(sequelize.models);
  Pago.associate(sequelize.models);
  Mes.associate(sequelize.models);
  Anio.associate(sequelize.models);
  Empresa.associate(sequelize.models);
  Rol.associate(sequelize.models);
  Suscripcion.associate(sequelize.models);
  Usuario.associate(sequelize.models);

}

module.exports = setupModels;
