const express = require('express');
const boom = require('@hapi/boom');

const Chat = require('../services/chat.service');
const router = express.Router();

const service = new Chat();

router.post('/', async (req, res, next) => {
    try {
        const { message } = req.body || {};
        if (!message) {
            throw boom.badRequest('El campo "message" es requerido');
        }
        const respuesta = await service.chat(message);
        res.status(201).json(respuesta);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
