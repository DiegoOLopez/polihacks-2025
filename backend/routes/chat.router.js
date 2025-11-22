const express = require ('express');

const Chat = require('./../services/chat.service')
const router = express.Router();


const service = new Chat();

// Buscar modulos



// Crear listas
router.post ('/',
async (req, res, next) => {
    try {
        const body = req.body;
        const respuesta = await service.chat(body);
        res.status(201).json(respuesta);
    } catch (error) {
        next (error);
    }
}
);

module.exports = router;
