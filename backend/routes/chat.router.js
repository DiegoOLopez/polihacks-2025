const express = require('express');
const boom = require('@hapi/boom');

const Chat = require('../services/chat.service');
const AlgoritmoService = require('../services/algoritmo.service.js');
const { esFraude } = require('../services/gemini.service.js');

const router = express.Router();
const service = new Chat();
const algoritmoService = new AlgoritmoService();

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

        // Primero el estafador responde
        const respuestaChat = await service.chat(message, type, reset, message_list);
        
        const mensajeModelo = {
            "role": 'model',
            "parts": [{ "text": respuestaChat.reply }]
        }

        message_list.push(mensajeModelo)

        function historyToPlainText(history) {
        return history.map(item => {
        const text = item.parts?.[0]?.text ?? "";
        return `${item.role.toUpperCase()}: ${text}`;
        }).join("\n");
        }

        const plano = historyToPlainText(message_list);

        // Primer filtro: Algoritmo 
        const filtroAlgoritmo = await algoritmoService.checkCallForScam(plano);
        console.log(filtroAlgoritmo)
        // filtroAlgoritmo = { isScam: true|false, keywords: [...], timestamp }
        let nivel = "verde"
        let ataque = false
        if (filtroAlgoritmo.isScam) {
            // Si no es scam, respondemos directamente
            const filtroGemini = await esFraude(plano);
            nivel = filtroGemini.nivel
            ataque = filtroGemini.ataque
        }


        // Llamamos al chat solo si Gemini detecta ataque



        res.status(201).json({
            respuesta: respuestaChat,
            nivel: nivel,
            ataque: ataque,
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
