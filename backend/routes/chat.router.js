const express = require('express');
const boom = require('@hapi/boom');

const Chat = require('../services/chat.service');
const AlgoritmoService = require('../services/algoritmo.service.js');
const { esFraude } = require('../services/gemini.service.js');

const router = express.Router();
const service = new Chat();
const algoritmoService = new AlgoritmoService();

const message_list = new Set();

router.post('/', async (req, res, next) => {
    try {
        const { message, type, reset } = req.body || {};

        const mensajeUsuario = { 
            author: 'user',
            message: message 
        };
        message_list.add(mensajeUsuario);

        if (!message) {
            throw boom.badRequest('El campo "message" es requerido');
        }

        // Primer filtro: Algoritmo 
        const filtroAlgoritmo = await algoritmoService.checkCallForScam(message);
        // filtroAlgoritmo = { isScam: true|false, keywords: [...], timestamp }

        if (!filtroAlgoritmo.isScam) {
            // Si no es scam, respondemos directamente
            const respuesta = {
                respuesta: "Mensaje seguro, no se detectó intento de estafa.",
                ataque: false,
                keywords: filtroAlgoritmo.keywords
            };

            const mensajeModelo = {
                author: 'model',
                message: respuesta
            };
            message_list.add(mensajeModelo);

            return res.status(201).json(respuesta);
        }

        // Segundo filtro: Gemini
        const filtroGemini = await esFraude(message);
        // filtroGemini = { ataque: true|false, nivel: 'verde'|'amarillo'|'rojo' }

        // Llamamos al chat solo si Gemini detecta ataque
        const respuestaChat = await service.chat(message, type, reset, message_list);

        const mensajeModelo = {
            author: 'model',
            message: respuestaChat
        };
        message_list.add(mensajeModelo);

        res.status(201).json({
            respuesta: respuestaChat,
            nivel: filtroGemini.nivel,
            ataque: filtroGemini.ataque,
            keywords: filtroAlgoritmo.keywords
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
