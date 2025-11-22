const express = require ('express');

const MunicipioService = require ('./../services/municipio.service');

const router = express.Router();

// Importar validacionJWT y verificarRol
const { validacionJWT, verificarRol } = require('./../utils/validations/validationJWT');

const service = new MunicipioService();

// Buscar modulos

router.get('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const municipios = await service.find();
        res.json(municipios);
    } catch (error) {
        next (error);
    }
}
);

// Crear listas
router.post ('/',
validacionJWT, verificarRol(['admin']),
async (req, res, next) => {
    try {
        const body = req.body;
        const municipio = await service.create(body);
        res.status(201).json(municipio);
    } catch (error) {
        next (error);
    }
}
);

module.exports = router;
