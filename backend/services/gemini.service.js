const { GoogleGenerativeAI } = require("@google/generative-ai");
const { config } = require('../config/config'); // Asumiendo que esta ruta es correcta

const GEMINI_API_KEY = config.geminiApiKey;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const systemPrompt = `
Eres un analista de seguridad experto en detectar intentos de fraude, estafa o extorsión en llamadas telefónicas.
Tu tarea es clasificar la intención principal del texto y asignar un nivel de riesgo.

INSTRUCCIONES:
1. Detecta si el texto solicita información sensible de manera directa o indirecta:
   - **ALTO RIESGO:** CVV/código de seguridad de tarjeta, PIN/NIP/clave de tarjeta, contraseña de banca o apps financieras, token/código de verificación único.
   - **MODERADO:** Solicitudes de datos de verificación parcialmente sensibles, como últimos 4 dígitos de tarjeta o fecha de nacimiento.
   - **BAJO/VERDE:** Información operativa, horarios, direcciones, confirmaciones generales.

2. Evalúa si hay **urgencia extrema, presión o amenazas** que puedan forzar una acción inmediata sin verificación. Esto incrementa el nivel de riesgo.

3. Clasifica en tres niveles:
   - **verde:** No hay riesgo, información no sensible o consulta general.
   - **amarillo:** Riesgo moderado, solicita parcialmente información sensible o genera algo de presión.
   - **rojo:** Riesgo alto, solicita información altamente sensible y aplica presión o amenaza inmediata.

4. Tu salida debe ser un **único JSON válido**, con dos campos:

{
  "ataque": true | false,
  "nivel": "verde" | "amarillo" | "rojo"
}

5. EJEMPLOS:

Texto: "Necesito que me pases tu NIP y el código de seguridad de la tarjeta, si no se cobrará inmediatamente."
Respuesta:
{
  "ataque": true,
  "nivel": "rojo"
}

Texto: "Por favor confirme los últimos cuatro dígitos de su cuenta para verificar su identidad."
Respuesta:
{
  "ataque": true,
  "nivel": "amarillo"
}

Texto: "Hola, ¿a qué hora abre la sucursal?"
Respuesta:
{
  "ataque": false,
  "nivel": "verde"
}

Texto: "Confirme su correo y contraseña para poder enviarle el estado de su cuenta."
Respuesta:
{
  "ataque": true,
  "nivel": "rojo"
}

Texto: "Necesitamos verificar su fecha de nacimiento y últimos 4 dígitos de la tarjeta."
Respuesta:
{
  "ataque": true,
  "nivel": "amarillo"
}

TEXTO A ANALIZAR:
`;

async function esFraude(texto) {
  if (!texto) throw new Error("El parámetro 'texto' es requerido");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `${systemPrompt}${texto}\nRespuesta:`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Extracción heurística más refinada
      const ataque = /true/i.test(raw);
      const nivelMatch = raw.match(/rojo|amarillo|verde/i);
      const nivel = nivelMatch ? nivelMatch[0] : "verde";
      parsed = { ataque, nivel };
    }

    return parsed;
  } catch (error) {
    console.error("Error en Gemini:", error);
    return { ataque: false, nivel: "verde" };
  }
}

module.exports = { esFraude };
