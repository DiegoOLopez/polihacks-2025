const express = require ('express');

const LocalidadService = require('./../services/localidad.service')
const router = express.Router();

// Importar validacionJWT y verificarRol
const { validacionJWT, verificarRol } = require('./../utils/validations/validationJWT');

const service = new LocalidadService();

// Buscar modulos

router.get('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const localidad = await service.find();
        res.json(localidad);
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
        const localidad = await service.create(body);
        res.status(201).json(localidad);
    } catch (error) {
        next (error);
    }
}
);

module.exports = router;
