'use strict';
const {ESTADO, estado_schema} = require('./../models/estado.model')
const { MUNICIPIO, municipio_schema } = require('./../models/municipio.model')
const { LOCALIDAD, localidad_schema } = require('./../models/localidad.model')
const { CLIENTE, cliente_schema } = require('./../models/cliente.model')
const { PLAN, plan_schema } = require('./../models/plan.model')
const { ACCESS, access_schema } = require('./../models/access_point.model')
const { SERVICIO, servicio_schema } = require('./../models/servicio.model')
const { PAGO, pago_schema } = require('./../models/pago.model')
const { MES, mes_schema } = require('./../models/mes.model')
const { ANIO, anio_schema } = require('./../models/anio.model')
const { USUARIO, UsuarioSchema } = require('./../models/usuario.model')
const { ROL, rolSchema } = require('./../models/rol.model')
const { EMPRESA, empresaSchema } = require('./../models/empresa.model')
const { SUSCRIPCION, suscripcionSchema } = require('./../models/suscripcion.model')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(MES, mes_schema)
    await queryInterface.createTable(ANIO, anio_schema)
    await queryInterface.createTable(ESTADO, estado_schema);
    await queryInterface.createTable(MUNICIPIO, municipio_schema);
    await queryInterface.createTable(LOCALIDAD, localidad_schema);
    await queryInterface.createTable(EMPRESA, empresaSchema)
    await queryInterface.createTable(CLIENTE, cliente_schema);
    await queryInterface.createTable(PLAN, plan_schema)
    await queryInterface.createTable(ACCESS, access_schema)
    await queryInterface.createTable(SERVICIO, servicio_schema)
    await queryInterface.createTable(ROL, rolSchema)
    await queryInterface.createTable(SUSCRIPCION, suscripcionSchema)
    await queryInterface.createTable(USUARIO, UsuarioSchema)
    await queryInterface.createTable(PAGO, pago_schema)

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(MES)
    await queryInterface.dropTable(ANIO)
    await queryInterface.dropTable(ESTADO);
    await queryInterface.dropTable(MUNICIPIO);
    await queryInterface.dropTable(LOCALIDAD);
    await queryInterface.dropTable(CLIENTE);
    await queryInterface.dropTable(PLAN)
    await queryInterface.dropTable(ACCESS)
    await queryInterface.dropTable(SERVICIO)
    await queryInterface.dropTable(PAGO)
    await queryInterface.dropTable(ROL)
    await queryInterface.dropTable(EMPRESA)
    await queryInterface.dropTable(SUSCRIPCION)
    await queryInterface.dropTable(USUARIO)
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
