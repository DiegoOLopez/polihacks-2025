const express = require('express');
const boom = require('@hapi/boom');

const Chat = require('../services/chat.service');
const router = express.Router();

const service = new Chat();


let message_list = [];

router.post('/', async (req, res, next) => {
    try {
        const { message, type, reset } = req.body || {};
        if (reset == true){
            message_list = []
        }
        console.log(message_list)

        const mensajeUsuario = { 
            "role": 'user', // Valor por defecto si no envían type
            "parts": [{ "text": message }]
        };
        message_list.push(mensajeUsuario);

        if (!message) {
            throw boom.badRequest('El campo "message" es requerido');
        }
        const respuesta = await service.chat(message, type, reset, message_list);

        const mensajeModelo = {
            "role": 'model',
            "parts": [{ "text": respuesta.reply }]
        }
        message_list.push(mensajeModelo)
        res.status(201).json(respuesta);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
