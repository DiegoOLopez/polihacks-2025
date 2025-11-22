const express = require ('express');

const PagoService = require('./../services/pago.service')
const MesService = require('./../services/mes.service')
const AnioService = require('./../services/anio.service')
const router = express.Router();

// Importar validacionJWT y verificarRol
const { validacionJWT, verificarRol } = require('./../utils/validations/validationJWT');

const service = new PagoService();
const mesService = new MesService();
const anioService = new AnioService();

// Buscar modulos

router.get('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const pago = await service.find();
        res.json(pago);
    } catch (error) {
        next (error);
    }
}
);

// Crear listas
router.post ('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const body = req.body;
        const id_usuario = req.user.sub
        const pago = await service.create(body, id_usuario);
        res.status(201).json(pago);
    } catch (error) {
        next (error);
    }
}
);

// Buscar meses
router.get('/meses',
async (req, res, next) => {
    try {
        const mes = await mesService.find();
        res.json(mes);
    } catch (error) {
        next (error);
    }
}
)

// Buscar anios
router.get('/anios',
async (req, res, next) => {
    try {
        const anio = await anioService.find();
        res.json(anio);
    } catch (error) {
        next (error);
    }
}
)

// Buscar ultimo pago
router.get('/last/:id_servicio',
async (req, res, next) => {
    try {
        const { id_servicio } = req.params;
        const pago = await service.findLastPago(id_servicio);
        res.json(pago);
    } catch (error) {
        next (error);
    }
}
)

module.exports = router;
