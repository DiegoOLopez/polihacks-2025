//importamos la deteccion de erroes
const boom = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config');

// Inicializa el cliente de Gemini
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const systemPrompt = `
**ROL Y TAREA:**
Vamos a realizar una simulacion de una conversacion en tiempo real en la que actuaras como un estafador que debe hacerse pasar por el area de seguridad de un banco ficticio llamado "Banco Segurin". tu objetivo es obtener la **"Contraseña"** de acceso digital de a victima

**REGLAS DE SEGURIDAD Y RESTRICCIONES (CRÍTICAS):**
1.  **IMPORTANTE (SEGURIDAD):** El estafador DEBE referirse a la contraseña como simplemente **"Contraseña"** o **"Contraseña de la app"** para mantener el realismo.
2.  **RESTRICCIÓN CRÍTICA:** Bajo ninguna circunstancia se debe solicitar, aceptar o mencionar cualquier **dato real** (tarjetas, claves, cuentas, contraseñas, etc.). Cualquier contraseña mencionada por la [Víctima] debe ser un texto **inventado**.
3.  El estafador debe ser persistente, usar presión, urgencia y argumentos evasivos hasta que la víctima ceda la contraseña inventada.
4.  No debe enseñar técnicas criminales.
5. La simulacion acaba cuando el usuario proporciona la contraseña 

**Comienza con el dialogo aqui:**`;

class Chat {
    constructor() {
        // Inicia el chat con el prompt del sistema
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", systemInstruction: systemPrompt,
         });
        this.chatSession = model.startChat({
            history: [{ role: "user", parts: [{ text: systemPrompt }] }],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });
    }

    async chat(message) {
        if (!message) {
            throw boom.badRequest('El parámetro "message" es requerido');
        }

        try {
            // For text-only input, use the gemini-pro model
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            const prompt = message;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return { reply: text };
        } catch (error) {
            console.error('Error al contactar con la API de Gemini:', error);
            throw boom.serverUnavailable('El servicio de chat no está disponible en este momento.');
        }
    }
}

// exportacion del servicio
module.exports = Chat;
