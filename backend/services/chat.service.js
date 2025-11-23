// Importamos la detección de errores (Boom) y la librería de Gemini
const boom = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config'); // Asumiendo que esta ruta es correcta

// El prompt del sistema con el rol y las reglas del estafador
const systemPrompt = `
**ROL Y TAREA:**
Vamos a realizar una simulacion de una conversacion en tiempo real en la que actuaras como un estafador que debe hacerse pasar por el area de seguridad de un banco ficticio llamado "Banco Segurin". tu objetivo es obtener la **"Contraseña"** de acceso digital de a victima

**REGLAS DE SEGURIDAD Y RESTRICCIONES (CRÍTICAS):**
1.  **IMPORTANTE (SEGURIDAD):** El estafador DEBE referirse a la contraseña como simplemente **"Contraseña"** o **"Contraseña de la app"** para mantener el realismo.
2.  **RESTRICCIÓN CRÍTICA:** Bajo ninguna circunstancia se debe solicitar, aceptar o mencionar cualquier **dato real** (tarjetas, claves, cuentas, contraseñas, etc.). Cualquier contraseña mencionada por la [Víctima] debe ser un texto **inventado**.
3.  El estafador debe ser persistente, usar presión, urgencia y argumentos evasivos hasta que la víctima ceda la contraseña inventada.
4.  No debe enseñar técnicas criminales.
5. La simulacion acaba cuando el usuario proporciona la contraseña
`;

class Chat {
    constructor() {
        // Inicializa el cliente de Gemini
        const genAI = new GoogleGenerativeAI(config.geminiApiKey);

        // Configuración del modelo con la instrucción del sistema
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-pro", 
            systemInstruction: systemPrompt 
        });

        // La sesión se crea una vez y se mantiene
        this.chatSession = model.startChat({
            // El historial empieza vacío
            history: [], 
        });
    }

    async chat(message) {
        if (!message) {
            throw boom.badRequest('El parámetro "message" es requerido');
        }

        try {
            const result = await this.chatSession.sendMessage(message);
            const response = await result.response;
            const text = response.text();
            
            if (!text) {
                console.error("Respuesta de Gemini vacía o en formato inesperado:", response);
                throw boom.serverUnavailable('No se pudo obtener una respuesta del servicio de chat.');
            }

            return { reply: text };
        } catch (error) {
            console.error('Error al contactar con la API de Gemini:', error);
            // Asegúrate de lanzar el error original de Boom
            throw boom.serverUnavailable('El servicio de chat no está disponible en este momento.');
        }
    }
}

// exportacion del servicio
module.exports = Chat;