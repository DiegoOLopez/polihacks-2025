const express = require ('express');

const ServicioService = require('./../services/servicio.service')
const router = express.Router();

// Importar validacionJWT y verificarRol
const { validacionJWT, verificarRol } = require('./../utils/validations/validationJWT');

const service = new ServicioService();

// Buscar modulos

router.get('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const servicio = await service.find();
        res.json(servicio);
    } catch (error) {
        next (error);
    }
}
);

// Crear listas
router.post ('/', validacionJWT, verificarRol(['admin']),
async (req, res, next) => {
    try {
        const body = req.body;
        const { id_empresa } = req.user; // Asignamos el id_empresa del usuario autenticado
        delete body.id_empresa; // Eliminamos el id_empresa para evitar problemas de seguridad
        body.id_empresa = id_empresa; // Asignamos el id_empresa del usuario autenticado
        const servicio = await service.create(body);
        res.status(201).json(servicio);
    } catch (error) {
        next (error);
    }
}
);

// Buscamos el servicio
router.get('/search/:data', validacionJWT, verificarRol(['admin', 'user', ]),
  async (req, res, next) => {
    try {
      const { data } = req.params;
      const services = await service.findService(data);
      if (!services || services.length === 0) {
        return res.status(404).json({ message: 'Servicio no encontrado' });
      }
      res.json(services)
    } catch (error) {

    }
  }
)

module.exports = router;
