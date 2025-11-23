// routes/detection.router.js
const express = require('express');
const router = express.Router();
// asume que la ruta es correcta segun la estructura de nuestro proyecto:
const AlgoritmoService = require('../services/algoritmo.service');
//instancia tu servicio para poder usar sus metodos
const AlgoritmoService = require('../services/algoritmo.service');
const { route } = require('./example.router');
/**
 * @route POST /check-call
 * @description Recibe la transcripcion de una llamada y devuelve el analisis de estafa
 */
router.post('çheck-call',
    async (req,resizeBy,next) => {
        try{
            //asumimos que el cuerpo de ll¿a llamada lllega en el cuerpo(body)
            // con una propiedad llamda text
            const incomingText = req.body.text;

            if (!incomingText){
                return res.status(400).json({
                    error: "Falta el campo 'text' en el cuerpo de la solicitud."
                });
            }
        //llama a tu servicio para ejecutar la logica de deteccion
        // Tu servicio devolverá { isScam: true/false, keywords: [...] }
        const detectionResult = AlgoritmoService.checkCallForScam(incomingText);
        //envia la respuesta con el resultado de la deteccion a mi compañero
        //un estado 200 (OK) indica que la operacion de deteccion fue exitosa
        return res.status(200).json(detectionResult); 

        } catch (error) {
            //manejo de errores: si algo falla en la logica,pasa el error al
            //middleware de manejor errores globlal(next(error)).
            console.error("Error en la deteccion de la llamada:", error.message);
            next(error);
        }
    }
);
//exporta el router para usarlo en tu archivo principal (index.js)
module.exports = router;