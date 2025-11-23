const { analyzeTranscription } = require('../libs/scamDetector'); 

class AlgoritmoService {
    /**
     * Procesa la transcripción de la llamada, analiza el contenido y 
     * devuelve el resultado de la detección.
     *
     * @param {string} transcribedText El texto de la llamada.
     * @returns {{isScam: boolean, keywords: string[]}}
     */
    checkCallForScam(transcribedText) {
        
        // El body en tu caso es solo la cadena de texto, no un objeto completo.
        // Si tu equipo te pasa un objeto { text: "..." }, ajusta esta línea.
        
        // 1. Ejecutar el análisis
        const analysis = analyzeTranscription(transcribedText);

        // 2. Reportar el resultado (Este resultado es el que usaría tu compañero)
        return {
            isScam: analysis.isScam,             // <-- El valor binario que necesita el otro equipo
            keywords: analysis.foundKeywords,     // <-- Palabras que activaron la alarma
            timestamp: new Date().toISOString()   // <-- Puede ser útil para el registro
        };
    }
}

module.exports = AlgoritmoService;