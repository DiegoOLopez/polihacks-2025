/**
 * Importante: La lista de RegEx debe ser lo más exhaustiva posible para
 * detectar variaciones de CVV, PIN, Contraseña, Urgencia, etc.
 * (Usaremos la lista que ya definimos antes).
 */
const sensitiveKeywords = [
    // 1. Seguridad y Acceso (CVV, PIN, Contraseña, etc.)
    /\b(?:cvv|sms|cvc|c[óo]digo\s+seguridad|p[íi]n|n[íi]p|contrase[ñn]a|clave|password|d[íi]gitos|acceso|credenciales|t[óo]ken)\b/gi,
    
    // 2. Información de Tarjetas y Vencimiento
    /\b(?:fecha\s+vencimiento|expiraci[óo]n|[úu]ltimos\s+\d{1,4}\s+d[íi]gitos|n[úu]mero\s+tarjeta|d[íi]gito[s]?\s+verificaci[óo]n)\b/gi,

    // 3. Códigos de Un Solo Uso (OTP)
    /\b(?:c[óo]digo\s+sms|c[óo]digo\s+otp|clave\s+din[áa]mica|c[óo]digo\s+temporal|c[óo]digo\s+autorizaci[óo]n)\b/gi,

    // 4. Urgencia y Estados de Cuenta
    /\b(?:bloqueada|suspendida|hackeada|urgente|act[úu]e\s+ahora|movimiento\s+inusual)\b/gi,

    // 5. Transferencias y Datos de Cuenta
    /\b(?:transferencia\s+bancaria|dep[óo]sito\s+a\s+otra\s+cuenta|clabe|beneficiario)\b/gi,
    
    // 6. Acceso Remoto o Datos de Identidad
    /\b(?:anydesk|teamviewer|instale\s+app|acceso\s+remoto|rfc|curp|identificaci[óo]n\s+oficial|ine|firma\s+digital)\b/gi,
];

/**
 * Analiza un texto y determina si contiene palabras clave sensibles.
 *
 * @param {string} text La transcripción de la llamada.
 * @returns {{isScam: boolean, foundKeywords: string[]}}
 */
function analyzeTranscription(text) {
    if (!text || typeof text !== 'string') {
        return { isScam: false, foundKeywords: [] };
    }

    const foundKeywords = [];
    
    for (const regex of sensitiveKeywords) {
        const matches = text.match(regex);
        if (matches) {
            // Solo necesitamos saber si encontramos ALGO, pero también guardamos las palabras
            foundKeywords.push(...matches.map(m => m.trim()));
        }
    }

    const uniqueKeywords = [...new Set(foundKeywords)];
    return {
        // Esta es la parte binaria: TRUE si se encontró algo, FALSE si no
        isScam: uniqueKeywords.length > 0, 
        foundKeywords: uniqueKeywords
    };
}

module.exports = {
    analyzeTranscription
};