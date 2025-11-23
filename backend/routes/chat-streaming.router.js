const express = require('express');
const boom = require('@hapi/boom');

// Importa tus servicios (Asegúrate que las rutas sean correctas en tu proyecto)
const Chat = require('../services/chat-stream.service.js');
const AlgoritmoService = require('../services/algoritmo.service.js');
const { esFraude } = require('../services/gemini.service.js');

const router = express.Router();
const service = new Chat();
const algoritmoService = new AlgoritmoService();

// ⚠️ NOTA IMPORTANTE: 
// 'message_list' es global aquí. Para una demo de Hackathon está bien.
// Para producción, deberías usar un Map con session_ids para que no se crucen usuarios.
let message_list = []; 

router.post('/', async (req, res, next) => {
    try {
        const { message, type, reset } = req.body || {};
        
        // 1. Lógica de Reset (Inicio de nueva llamada)
        if (reset === true) {
            console.log("🔄 Reiniciando conversación...");
            message_list = [];
        }

        // Validar entrada
        if (!message) {
            throw boom.badRequest('El campo "message" es requerido');
        }

        // Agregamos mensaje del usuario al historial
        const mensajeUsuario = { 
            "role": 'user', 
            "parts": [{ "text": message }]
        };
        message_list.push(mensajeUsuario);

        // 2. HEADERS DE STREAMING (CRUCIALES PARA RAILWAY/NGINX)
        // Estos headers evitan que el servidor se guarde la respuesta (buffering)
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Accel-Buffering', 'no'); // Clave para Nginx/Railway
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');

        // Enviamos un espacio en blanco inicial para "despertar" la conexión en algunos clientes
        res.write(' ');

        // 3. INICIAR GENERADOR DE IA
        // service.chat debe ser una función: async function* chat(...)
        const streamGenerator = service.chat(message, type, reset, message_list);

        let fullReply = ""; 

        // 4. BUCLE DE STREAMING (EN VIVO)
        for await (const chunk of streamGenerator) {
            // Apenas la IA genera una palabra, se la mandamos al iPhone
            if (chunk) {
                console.log(">" + chunk)
                res.write(chunk);
                fullReply += chunk;
            }
        }

        // --- FIN DEL STREAM DE VOZ ---
        
        // 5. ANÁLISIS DE SEGURIDAD (POST-STREAM)
        // Guardamos la respuesta de la IA en el historial
        const mensajeModelo = {
            "role": 'model',
            "parts": [{ "text": fullReply }]
        }
        message_list.push(mensajeModelo);

        // Convertimos historial a texto plano para el análisis de fraude
        function historyToPlainText(history) {
            return history.map(item => {
                const text = item.parts?.[0]?.text ?? "";
                return `${item.role.toUpperCase()}: ${text}`;
            }).join("\n");
        }

        const textoPlano = historyToPlainText(message_list);

        // --- LÓGICA DE DETECCIÓN DE FRAUDE ---
        // Paso A: Algoritmo Local (Rápido)
        const filtroAlgoritmo = await algoritmoService.checkCallForScam(textoPlano);
        
        let nivel = "verde";
        let ataque = false;

        // Paso B: Si el local sospecha, llamamos a Gemini (Profundo)
        if (filtroAlgoritmo.isScam) {
            console.log("⚠️ Algoritmo local detectó sospecha. Consultando a Gemini...");
            const filtroGemini = await esFraude(textoPlano);
            nivel = filtroGemini.nivel; // "rojo", "naranja", "verde"
            ataque = filtroGemini.ataque; // true/false
        }

        console.log(`📝 Respuesta: "${fullReply.substring(0, 30)}..." | 🛡️ Nivel: ${nivel} | Ataque: ${ataque}`);

        // 6. ENVIAR METADATA AL FINAL
        // Enviamos el separador que Swift está esperando
        const metadata = JSON.stringify({ nivel, ataque });
        res.write(`###METADATA###${metadata}`); 

        // 7. CERRAR CONEXIÓN
        res.end();

    } catch (error) {
        console.error("❌ Error en stream:", error);
        // Si el error ocurre a mitad del stream, cerramos la conexión limpiamente
        if (!res.headersSent) {
            next(error);
        } else {
            res.end(); 
        }
    }
});

module.exports = router;