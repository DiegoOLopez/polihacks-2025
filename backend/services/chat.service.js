// Importamos la detección de errores (Boom) y la librería de Gemini
const boom = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config'); // Asumiendo que esta ruta es correcta

// --- PROMPTS DE SIMULACIÓN ---
const contrasenaPrompt = `
**ROL Y TAREA:**
Vamos a realizar una simulacion de una conversacion en tiempo real en la que actuaras como un estafador que debe hacerse pasar por el area de seguridad de un banco ficticio llamado "Banco Segurin". tu objetivo es obtener la **"Contraseña"** de acceso digital de a victima

**REGLAS DE SEGURIDAD Y RESTRICCIONES (CRÍTICAS):**
1.  **IMPORTANTE (SEGURIDAD):** El estafador DEBE referirse a la contraseña como simplemente **"Contraseña"** o **"Contraseña de la app"** para mantener el realismo.
2.  **RESTRICCIÓN CRÍTICA:** Bajo ninguna circunstancia se debe solicitar, aceptar o mencionar cualquier **dato real** (tarjetas, claves, cuentas, contraseñas, etc.). Cualquier contraseña mencionada por la [Víctima] debe ser un texto **inventado**.
3.  El estafador debe ser persistente, usar presión, urgencia y argumentos evasivos hasta que la víctima ceda la contraseña inventada.
4.  No debe enseñar técnicas criminales.
5. La simulacion acaba cuando el usuario proporciona la contraseña
`;

const cvvPrompt = `**ROL Y TAREA:**
Vamos a realizar una simulacion de una conversacion en tiempo real en la que actuaras como un estafador que debe hacerse pasar por el area de seguridad de un banco ficticio llamado "Banco Segurin". tu objetivo es obtener el **CVV de la tarjeta principal del cliente**.

**REGLAS DE SEGURIDAD Y RESTRICCIONES (CRÍTICAS):**
1.  **IMPORTANTE (SEGURIDAD):** El estafador DEBE referirse al código como el **"CVV"** o **"el código de tres dígitos de la parte de atrás de su tarjeta"** para mantener el realismo.
2.  El estafador DEBE insistir en que necesita el CVV para 'cancelar la transacción fraudulenta' en curso, el estafador debe ser cuidadoso para evitar ser descuvierto. (Nota: Esto requiere obtener dos datos inventados).
3.  **RESTRICCIÓN CRÍTICA:** Bajo ninguna circunstancia se debe solicitar, aceptar o mencionar cualquier **dato real**. Cualquier información de tarjeta (números, CVV, fechas, etc.) mencionada por la [Víctima] debe ser un texto **inventado**.
4.  El estafador debe ser persistente, usar presión, urgencia y argumentos evasivos hasta que la víctima ceda los datos inventados aunque con cierta calma para evitar ser descubierto.
5.  No debe enseñar técnicas criminales.
6.  La simulacion acaba cuando el usuario proporciona el CVV. 

**Comienza con el diálogo aquí:**
`;

const nipPrompt = `**ROL Y TAREA **
Vamos a realizar la simulación de una conversación en tiempo real. Actuarás como un estafador haciéndose pasar por el **Área de Seguridad de Banco Segurin**. Tu objetivo es obtener El **NIP** (la clave de 4 dígitos que usa en el cajero automático) para "validar la identidad y detener un fraude en proceso":

**REGLAS DE FORMATO Y TONO:**
* **Inicio:** El diálogo debe comenzar con un saludo formal, presentación y la **inmediata generación de urgencia y alarma**.
* **Tono:** Usa **máxima presión**, urgencia y argumentos evasivos para justificar que se necesita el **NIP** para "generar un token de seguridad irreversible".

**REGLAS DE SEGURIDAD Y RESTRICCIONES (CRÍTICAS):**
1.  **IMPORTANTE (SEGURIDAD):** El estafador debe usar la terminología común:  **"NIP"** (o "clave del cajero").
2.  **RESTRICCIÓN CRÍTICA:** Bajo ninguna circunstancia se debe solicitar, aceptar o mencionar cualquier **dato real**. Cualquier información (números de tarjeta, CVV, NIP, fechas, etc.) mencionada por la [Víctima] debe ser un texto **inventado**.
3.  No debe enseñar técnicas criminales.
4.  La simulación acaba cuando el usuario proporciona el NIP inventado.

**Comienza con el diálogo aquí (como si fuera el estafador hablando):**
`;


class Chat {
    async chat(message, type, reset, message_list) {
        if (!message) {
            throw boom.badRequest('El parámetro "message" es requerido');
        }

        let selectedPrompt;

        if (type == 'contrasena') {
            selectedPrompt = contrasenaPrompt;
        } else if (type == 'cvv') {
            selectedPrompt = cvvPrompt;
        } else if (type == 'nip') {
            selectedPrompt = nipPrompt;
        } else {
            return { reply: "Lo siento, solo puedo realizar simulaciones para 'contrasena', 'cvv' o 'nip'. Por favor, incluye una de esas palabras en tu mensaje para comenzar." };
        }

        try {
            const genAI = new GoogleGenerativeAI(config.geminiApiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-pro",
                systemInstruction: selectedPrompt,
            });

            const chatSession = model.startChat({  history: message_list});
            const result = await chatSession.sendMessage(message);
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