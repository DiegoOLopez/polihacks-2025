const express = require('express');
const boom = require('@hapi/boom');

const Chat = require('../services/chat.service');
const router = express.Router();

const service = new Chat();


const message_list = new Set();

router.post('/', async (req, res, next) => {
    try {
        const mensajeUsuario = { 
            author: 'user', // Valor por defecto si no envían type
            message: message 
        };
        
        message_list.add(mensajeUsuario);
        const { message, type, reset } = req.body || {};
        if (!message) {
            throw boom.badRequest('El campo "message" es requerido');
        }
        const respuesta = await service.chat(message, type, reset);

        const mensajeModelo = {
            author: 'model',
            message: respuesta
        }
        message_list.add(mensajeModelo)
        console.log(message_list)
        res.status(201).json(respuesta);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
