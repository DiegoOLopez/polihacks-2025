const express = require ('express');

const Example = require('./../services/example.service')
const router = express.Router();


const service = new Example();

// Buscar modulos



// Crear listas
router.post ('/',
async (req, res, next) => {
    try {
        const body = req.body;
        const respuesta = await service.hello(body);
        res.status(201).json(respuesta);
    } catch (error) {
        next (error);
    }
}
);

module.exports = router;
