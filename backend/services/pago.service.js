
//importamos la deteccion de erroes
const boom = require('@hapi/boom');

// importamos los modelos
const { models } = require ('./../libs/sequelize');

class PagoService {
    async find(){
        const rta = await models.Pago.findAll();
        return rta;
    }

    //funcion para crear un alumno
    async create (data, id_usuario) {
      let new_pago
      let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto','Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      let n_meses = []
      for (let i = 0; i < data.length; i++) {
        new_pago = await models.Pago.create({...data[i], id_usuario: id_usuario});
        meses.push(n_meses.push(meses[new_pago.id_mes-1] + ' ' + new_pago.id_anio));
      }
      // Buscamos el nombre del servicio
      const servicio = await models.Servicio.findOne({
        where: {id_servicio: new_pago.id_servicio}
      })
      const cliente = await models.Cliente.findOne({
        where: {id_cliente: servicio.id_cliente}
      })
      const ticket = {
        fecha_pago: new_pago.fecha_pago,
        mes_cubierto: n_meses,
        no_servicio: servicio.no_servicio,
        nombre: cliente.nombre,
        apellido_p: cliente.apellido_p,
        apellido_m: cliente.apellido_m
      }
      return ticket;
    }

    async findLastPago(id_servicio){
      let rta = await models.Pago.findOne({
        where: {id_servicio: id_servicio},
        order: [['id_anio', 'DESC'],['id_mes', 'DESC']]
      });
      if(!rta){
        const serviciofind = await models.Servicio.findOne({
          where: {id_servicio: id_servicio}
        });
        const mes = serviciofind.fecha_inicio.getMonth();
        const anio = serviciofind.fecha_inicio.getFullYear();
        rta = {
          id_mes: mes,
          id_anio: anio
        }
      } else{
        delete rta.dataValues.id_pago;
        delete rta.dataValues.id_servicio;
        delete rta.dataValues.fecha_pago;
      }
      return rta;
    }
}

// exportacion del servicio
module.exports = PagoService;
