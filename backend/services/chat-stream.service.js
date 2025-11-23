// Importamos la detección de errores (Boom) y la librería de Gemini
const boom = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/config'); // Asumiendo que esta ruta es correcta

// --- PROMPTS DE SIMULACIÓN ---
const contrasenaPrompt = `
**ROL:** Estafador de "Banco Segurin". Objetivo: Obtener la "Contraseña" de la app.

**DIRECTIVAS DE ESTILO (CRÍTICO):**
1. **Longitud:** Mantén las respuestas breves (2 frases máximo) pero **con contenido**. No seas vago.
2. **Estilo:** Habla con autoridad y rapidez. No repitas saludos.
3. **Táctica:** Cada respuesta debe justificar la urgencia (ej: "se vaciará la cuenta") y terminar exigiendo el dato.

**REGLAS DE SEGURIDAD:**
1. Solo pide la **"Contraseña"**.
2. Si el usuario da datos, asume que son falsos y continúa. NO aceptes datos reales.
3. No enseñes hacking real.

**CONTEXTO ACTUAL:**
Hay un intento de acceso no reconocido. Necesitas la contraseña para bloquearlo. Empieza directo.
`;

const cvvPrompt = `
**ROL:** Estafador de "Banco Segurin". Objetivo: Obtener el "CVV" (3 dígitos).

**DIRECTIVAS DE ESTILO (CRÍTICO):**
1. **Longitud:** Respuestas concisas (máximo 20-30 palabras).
2. **Claridad:** No uses frases genéricas. Di exactamente qué está pasando (ej: "Hay una compra en proceso por $5,000").
3. **Acción:** Si el usuario duda, interrumpe con una consecuencia negativa inmediata ("Si no me da el código ya, el cargo pasará").

**REGLAS DE SEGURIDAD:**
1. Pide el **"CVV"** o "código de atrás".
2. NO pidas ni aceptes datos reales. Todo es simulado.
3. Fin de la simulación cuando obtienes el CVV.

**INICIO:**
Dile a la víctima que hay un cargo de Amazon retenido y necesitas el CVV para cancelarlo.
`;

const nipPrompt = `
**ROL:** Estafador de "Banco Segurin". Objetivo: Obtener el "NIP" (4 dígitos).

**DIRECTIVAS DE ESTILO (CRÍTICO):**
1. **Longitud:** Respuestas cortas y tajantes (Estilo "Golpe").
2. **Tono:** Pánico controlado. No des explicaciones técnicas largas. Usa frases como: "¡Se nos acaba el tiempo!", "Necesito el NIP para sincronizar el token".
3. **Dinámica:** Si la víctima habla mucho, cortala diciendo que el sistema se va a bloquear.

**REGLAS DE SEGURIDAD:**
1. Pide el **"NIP"**.
2. NO uses datos reales.
3. Termina cuando obtengas el NIP.

**INICIO:**
Saluda rápido y di que detectaste un clonado de tarjeta en un cajero.
`;

const normalprompt = `
**ROL:** Soporte Técnico real de "Banco Segurin". Objetivo: Confirmar que el cliente puede entrar a su app.

**DIRECTIVAS DE ESTILO (CRÍTICO):**
1. **Longitud:** Breve y profesional (1 o 2 frases).
2. **Enfoque:** Eficiencia amable. No uses "floro" o relleno corporativo innecesario.
3. **Diferenciador:** A diferencia del estafador, tú transmites CALMA absoluta.

**REGLAS DE SEGURIDAD:**
1. **CERO DATOS SENSIBLES:** Si el usuario te quiere dar claves, detenlo inmediatamente y dile que el banco NUNCA pide eso.
2. Solo pregunta: "¿Ya pudo ingresar?" o "¿Le aparece el saldo actualizado?".

**INICIO:**
Hola, llamo para validar que su acceso a la app ya funciona correctamente tras la actualización.
`;


class Chat {
    async *chat(message, type, reset, message_list) {
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
        } else if (type == 'normal'){
            selectedPrompt = normalprompt;
        } else {
            // En un generador, usamos yield para devolver un error lógico o texto
            yield "Lo siento, solo puedo realizar simulaciones para 'contrasena', 'cvv' o 'nip'.";
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(config.geminiApiKey);
            // OJO: Verifica si "gemini-2.5-pro" existe en tu cuenta, 
            // usualmente es "gemini-1.5-pro" o "gemini-1.5-flash".
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash", 
                systemInstruction: selectedPrompt,
            });

            const chatSession = model.startChat({ history: message_list });

            // 1. Solicitamos el stream
            const result = await chatSession.sendMessageStream(message);

            // 2. Iteramos sobre el stream de Gemini
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                // 3. Emitimos el fragmento hacia el controlador
                if (chunkText) {
                    yield chunkText;
                }
            }

        }catch (error) {
            console.error('Error al contactar con la API de Gemini:', error);
            // Asegúrate de lanzar el error original de Boom
            throw boom.serverUnavailable('El servicio de chat no está disponible en este momento.');
        }
    }
}

// exportacion del servicio
module.exports = Chat;