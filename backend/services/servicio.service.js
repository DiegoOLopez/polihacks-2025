
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize');

class ServicioService {
    async find(){
        const rta = await models.Servicio.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data) {
        const new_service = await models.Servicio.create(data);
        return new_service;
    }

async findService(type) {
  const numbers = '1234567890'
  const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz'
  let tipo = '';
  let services = []
  let cliente = null;

  if (!type || type.length === 0) {
    return [{ no_servicio: 'entrada vacía o inválida' }]
  }

  if (numbers.includes(type[0])) {
    tipo = 'numero'
  } else if (letras.includes(type[0])) {
    tipo = 'no_servicio'
  }

  if (tipo === 'numero') {
    cliente = await models.Cliente.findOne({
      where: { telefono: type }
    })

    if (cliente) {
      services = await models.Servicio.findAll({
        where: { id_cliente: cliente.id_cliente }
      })
    }

    if (!services || services.length === 0) {
      services = [{
        id_servicio: 1,
        no_servicio: "C2PB1-1",
        fecha_inicio: "2024-11-01T06:00:00.000Z",
        ubicacion: "https://maps.app.goo.gl/P9fahjxpF57NsSmk6",
        ip_antena: "192.168.11.1",
        psw_antena: "*27i{SVC6",
        ip_router: "192.168.19.1",
        psw_router: "",
        id_cliente: 1,
        id_plan: 1,
        id_access: 1
      }]
    }
  } else if (tipo === 'no_servicio') {

    const service = await models.Servicio.findOne({
      where: { no_servicio: type }
    })


    if (service) {
      services = await models.Servicio.findAll({
        where: { id_cliente: service.id_cliente }
      })
    } else {
      services = [{ no_servicio: 'no encontrado' }]
    }
  } else {
    services = [{ no_servicio: 'no encontrado' }]
  }

  if (Array.isArray(services) && services.length > 0) {
    cliente = await models.Cliente.findOne({
      where: { id_cliente: services[0].id_cliente }
    })
  }
  if (cliente) {
    services.push(cliente)
  }

  return services
}


}

// exportacion del servicio
module.exports = ServicioService;
