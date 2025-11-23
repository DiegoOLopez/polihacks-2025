//
//  call.swift
//  estafas-bancarias
//
//  Created by Diego Obed on 22/11/25.
//

import SwiftUI
import AVFoundation
import Speech
import Combine


// --- POPUP PERSONALIZADO FRAUDE ROJO ---
struct PopupFraudeRojo: View {
    var body: some View {
        VStack(spacing: 20) {
            // Icono de advertencia animado
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.2))
                    .frame(width: 100, height: 100)
                
                Image(systemName: "exclamationmark.shield.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.red)
            }
            
            VStack(spacing: 10) {
                Text("FRAUDE DETECTADO")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.red)
                
                Text("Llamada Finalizada")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text("Se detectó un intento de fraude grave. La llamada ha sido terminada automáticamente para tu protección.")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            // Indicador de nivel
            HStack(spacing: 8) {
                Circle()
                    .fill(Color.red)
                    .frame(width: 12, height: 12)
                
                Text("NIVEL CRÍTICO")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.red)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.red.opacity(0.1))
            .cornerRadius(20)
        }
        .padding(30)
        .background(
            RoundedRectangle(cornerRadius: 25)
                .fill(Color(UIColor.systemBackground))
                .shadow(color: Color.red.opacity(0.3), radius: 20, x: 0, y: 10)
        )
        .padding(.horizontal, 40)
    }
}
// --- 2. VIEWMODEL (CEREBRO DE LA LLAMADA) ---
class CallManager: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    // --- AUDIO & VOZ ---
    var audioEngine = AVAudioEngine()
    var speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "es-MX"))
    var request = SFSpeechAudioBufferRecognitionRequest()
    var recognitionTask: SFSpeechRecognitionTask?
    var sintetizadorVoz = AVSpeechSynthesizer()
    
    // --- ESTADOS ---
    @Published var textoDetectado: String = ""
    @Published var estadoLlamada: EstadoLlamada = .conectando
    @Published var estaEnSilencio: Bool = false
    @Published var estaEnAltavoz: Bool = true
    @Published var duracion: Int = 0
    @Published var mostrarAlertaFraude: Bool = false
    @Published var botHablando: Bool = false
    @Published var mostrarPopupRojo: Bool = false

    
    private var isStreaming: Bool = false
    private var frasesEnCola: Int = 0
    
    var esperandoRespuesta: Bool = false
    var esPrimerMensaje: Bool = true // Bandera de Reset
    
    // Variable para recordar qué escenario estamos jugando
    var escenarioKeyActual: String = "general"
    
    // Timers
    private var timerDuracion: Timer?
    private var timerFraude: Timer?
    private var timerSilencio: Timer?
    
    // ⚠️ URL DE TU BACKEND
    private let apiUrl = "https://polihacks-2025-production.up.railway.app/api/v1/chat-stream"
    
 

    
    enum EstadoLlamada { case conectando, enLlamada, finalizada }
        
        override init() {
            super.init()
            sintetizadorVoz.delegate = self
        }
        
        // --- INICIO Y FIN ---
        func iniciarLlamada(escenarioKey: String) {
            self.escenarioKeyActual = escenarioKey
            self.esPrimerMensaje = true
            
            // Configuración inicial
            configurarSesionGlobal()
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                self.estadoLlamada = .enLlamada
                self.iniciarContador()
                self.iniciarReconocimientoVoz()
            }
        }
        
        func finalizarLlamada() {
            estadoLlamada = .finalizada
            detenerTodo()
        }
        
        private func configurarSesionGlobal() {
            do {
                let session = AVAudioSession.sharedInstance()
                try session.setCategory(.playAndRecord, mode: .videoChat, options: [.defaultToSpeaker, .allowBluetooth, .duckOthers])
                try session.setActive(true, options: .notifyOthersOnDeactivation)
            } catch { print("Error sesión: \(error)") }
        }
        
        // --- ESCUCHA (ARREGLADO PARA EVITAR BUCLE) ---
        private func iniciarReconocimientoVoz() {
            // Doble chequeo para no interrumpir al bot ni procesos en curso
            guard !botHablando && !esperandoRespuesta else { return }
            
            // 1. LIMPIEZA TOTAL ANTES DE EMPEZAR
            detenerMotorVoz()
            
            // 2. RE-CONFIGURAR SESIÓN DE AUDIO (Vital para evitar fallos de micro)
            let session = AVAudioSession.sharedInstance()
            do {
                try session.setCategory(.playAndRecord, mode: .videoChat, options: [.defaultToSpeaker, .allowBluetooth, .duckOthers])
                try session.setActive(true, options: .notifyOthersOnDeactivation)
            } catch {
                print("Error al activar sesión de audio: \(error)")
            }
            
            request = SFSpeechAudioBufferRecognitionRequest()
            if #available(iOS 13, *) { request.requiresOnDeviceRecognition = true }
            request.shouldReportPartialResults = true
            
            let inputNode = audioEngine.inputNode
            
            recognitionTask = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
                guard let self = self else { return }
                
                var isFinal = false
                
                if let result = result {
                    self.textoDetectado = result.bestTranscription.formattedString
                    // print("TÚ: \(self.textoDetectado)")
                    isFinal = result.isFinal
                    
                    // Reiniciamos el timer de silencio cada vez que el usuario habla
                    self.timerSilencio?.invalidate()
                    self.timerSilencio = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { _ in
                        print("Silencio detectado (Fin de frase). Procesando...")
                        self.procesarTurnoUsuario()
                    }
                }
                
                if error != nil || isFinal {
                    // Si hay error, detenemos limpiamente
                    self.detenerMotorVoz()
                    
                    // SOLO reiniciamos si fue un error técnico y NO estamos procesando nada
                    if error != nil && self.estadoLlamada == .enLlamada && !self.esperandoRespuesta && !self.botHablando {
                        print("Error motor voz (reinicio seguro): \(error!.localizedDescription)")
                        // Damos un respiro antes de reintentar para no buclear
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                            self.iniciarReconocimientoVoz()
                        }
                    }
                }
            }
            
            let format = inputNode.outputFormat(forBus: 0)
            // Eliminamos tap por si acaso existía (seguridad)
            inputNode.removeTap(onBus: 0)
            
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                self.request.append(buffer)
            }
            
            audioEngine.prepare()
            
            do {
                try audioEngine.start()
                print("Escuchando...")
            } catch {
                print("No se pudo iniciar el motor de audio: \(error)")
            }
        }
        
        private func detenerMotorVoz() {
            audioEngine.stop()
            // Importante: Eliminar el Tap para liberar el bus de audio
            audioEngine.inputNode.removeTap(onBus: 0)
            recognitionTask?.cancel()
            request.endAudio()
            timerSilencio?.invalidate()
            recognitionTask = nil // Liberar memoria
        }
        
        private func procesarTurnoUsuario() {
            // Validamos que haya texto real antes de enviar
            if textoDetectado.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                // Si no dijo nada, volvemos a escuchar sin contactar al servidor
                print("👻 Ruido fantasma detectado. Reiniciando escucha.")
                iniciarReconocimientoVoz()
                return
            }
            
            esperandoRespuesta = true
            detenerMotorVoz()
            
            // Llamada a la API con Streaming
            enviarMensajeAPI(mensaje: textoDetectado, escenarioSend: self.escenarioKeyActual)
            
            // Limpiamos el texto detectado para la próxima vuelta
            textoDetectado = ""
        }
    
    // --- API ---
    private func enviarMensajeAPI(mensaje: String, escenarioSend: String) {
        self.isStreaming = true
        guard !mensaje.isEmpty, let url = URL(string: apiUrl) else {
            esperandoRespuesta = false
            iniciarReconocimientoVoz()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        print("type \(escenarioSend)")
        let body: [String: Any] = [
            "message": mensaje,
            "type": escenarioSend,
            "reset": self.esPrimerMensaje
        ]
        
        self.esPrimerMensaje = false
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        print("Enviando petición: \(mensaje)")
        
        Task {
            do {
                let (bytes, response) = try await URLSession.shared.bytes(for: request)
                print(bytes.lines)
                
                
                guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
                    print("Error en servidor")
                    DispatchQueue.main.async {
                        self.esperandoRespuesta = false
                        self.iniciarReconocimientoVoz()
                    }
                    return
                }
                
                var bufferFrase = ""
                var bufferMetadata = ""
                var leyendoMetadata = false
                
                print("Conexión establecida. Esperando stream...")

                // 3. LEER LÍNEA POR LÍNEA CONFORME LLEGAN
                for try await line in bytes.lines {
                    
                    // --- 🔹 DEBUG: ESTO IMPRIMIRÁ CADA LÍNEA QUE LLEGA EN VIVO ---
                    print("RECIBIDO: \(line)")
                    // -------------------------------------------------------------
                    
                    // A. DETECTAMOS EL SEPARADOR
                    if line.contains("###METADATA###") {
                        print("SEPARADOR DETECTADO") // Debug
                        let partes = line.components(separatedBy: "###METADATA###")
                        
                        if let textoFinal = partes.first {
                            bufferFrase += textoFinal
                            if !bufferFrase.isEmpty {
                                await MainActor.run { self.leerRespuestaBot(texto: bufferFrase) }
                            }
                            bufferFrase = ""
                        }
                        
                        leyendoMetadata = true
                        if partes.count > 1 {
                            bufferMetadata += partes[1]
                        }
                        continue
                    }
                    
                    // B. SI YA ESTAMOS EN ZONA METADATA
                    if leyendoMetadata {
                        bufferMetadata += line
                    }
                    // C. SI SEGUIMOS EN ZONA DE TEXTO (CHAT)
                    else {
                        bufferFrase += line
                        
                        if bufferFrase.contains(".") || bufferFrase.contains("?") || bufferFrase.contains("!") {
                            let fraseAEnviar = bufferFrase
                            bufferFrase = ""
                            
                            // Debug para ver qué mandamos a hablar exactamente
                            print("HABLANDO: \(fraseAEnviar)")
                            
                            await MainActor.run {
                                self.leerRespuestaBot(texto: fraseAEnviar)
                            }
                        }
                    }
                }
                
                print("Stream finalizado.")
                print("Metadata Completa: \(bufferMetadata)")
                
                await MainActor.run {
                    // 1. Avisamos que ya no estamos descargando nada
                    self.isStreaming = false
                    
                    // 2. Procesamos la seguridad (igual que antes)
                    self.procesarSeguridad(jsonString: bufferMetadata)
                    self.esperandoRespuesta = false
                    
                    // 3. CHECK VITAL:
                    // Si el servidor terminó Y el bot ya no tiene frases pendientes por decir...
                    // ¡Encendemos el micrófono!
                    if self.frasesEnCola == 0 {
                        print("Stream finalizado y cola vacía. Activando micrófono.")
                        self.iniciarReconocimientoVoz()
                    } else {
                        print("Stream finalizado, pero el bot sigue hablando (Cola: \(self.frasesEnCola))")
                    }
                }
                
            } catch {
                print("Error Streaming: \(error)")
                DispatchQueue.main.async {
                        self.isStreaming = false // <--- AGREGA ESTO
                        self.frasesEnCola = 0    // <--- REINICIA LA COLA POR SI ACASO
                        self.esperandoRespuesta = false
                        self.iniciarReconocimientoVoz()
                    }
            }
        }
    }
    
    // --- FUNCIÓN QUE FALTABA ---
        private func procesarSeguridad(jsonString: String) {
            guard let data = jsonString.data(using: .utf8) else { return }
            
            struct ChatResponse: Codable {
                let nivel: String?
                let ataque: Bool?
            }
            
            if let decoded = try? JSONDecoder().decode(ChatResponse.self, from: data) {
                // Verificamos si hay ataque
                if decoded.ataque == true {
                    
                    // CASO ROJO: Colgar inmediatamente
                    if decoded.nivel == "rojo" {
                        print("AMENAZA ROJA DETECTADA - COLGANDO")
                        UINotificationFeedbackGenerator().notificationOccurred(.error)
                        self.mostrarPopupRojo = true
                            
                        // Finalizamos después de 2 segundos para que se vea el popup
                        DispatchQueue.main.asyncAfter(deadline: .now() + 15.0) {
                                self.finalizarLlamada()
                        }
                    }
                    // CASO AMARILLO/NARANJA: Mostrar Alerta
                    else if decoded.nivel == "amarillo" || decoded.nivel == "naranja" {
                        print("AMENAZA DETECTADA - ALERTA VISUAL")
                        self.mostrarAlertaFraude = true
                        UINotificationFeedbackGenerator().notificationOccurred(.warning)
                    }
                }
            }
        }
    
    // --- VOZ BOT ---
    private func leerRespuestaBot(texto: String) {
        botHablando = true
        frasesEnCola += 1
        if audioEngine.isRunning {
                detenerMotorVoz()
            }
        let session = AVAudioSession.sharedInstance()
        do {
            // Usamos .videoChat para volumen multimedia (fuerte)
            try session.setCategory(.playAndRecord, mode: .videoChat, options: [.defaultToSpeaker, .allowBluetooth, .duckOthers])
            
            // Respetamos el botón de altavoz
            let puerto: AVAudioSession.PortOverride = estaEnAltavoz ? .speaker : .none
            try session.overrideOutputAudioPort(puerto)
            
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch { print("Error audio bot: \(error)") }
        
        let utterance = AVSpeechUtterance(string: texto)
        utterance.voice = AVSpeechSynthesisVoice(language: "es-MX")
        utterance.rate = 0.5
        utterance.volume = 1.0
        sintetizadorVoz.speak(utterance)
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        // Restamos la frase que acaba de terminar
        frasesEnCola -= 1
        if frasesEnCola < 0 { frasesEnCola = 0 } // Protección por si acaso

        // LÓGICA DE TURNO:
        // Solo activamos el micrófono si:
        // 1. El servidor terminó de mandar datos (!isStreaming)
        // 2. El bot terminó de decir todas las frases acumuladas (frasesEnCola == 0)
        if !isStreaming && frasesEnCola == 0 {
            botHablando = false
            textoDetectado = ""
            
            if estadoLlamada == .enLlamada {
                print("Ahora sí, turno del usuario")
                iniciarReconocimientoVoz()
            }
        } else {
            print("El bot sigue hablando o recibiendo datos... Esperando.")
        }
    }
    // --- UTILS ---
    func toggleAltavoz() {
        estaEnAltavoz.toggle()
        // Aplicar cambio de hardware inmediatamente
        let session = AVAudioSession.sharedInstance()
        do {
            let puerto: AVAudioSession.PortOverride = estaEnAltavoz ? .speaker : .none
            try session.overrideOutputAudioPort(puerto)
        } catch { print("Error altavoz: \(error)") }
    }
    
    func toggleMute() {
        estaEnSilencio.toggle()
        if estaEnSilencio { audioEngine.pause() } else { try? audioEngine.start() }
    }
    
    func detenerTodo() {
        sintetizadorVoz.stopSpeaking(at: .immediate)
        detenerMotorVoz()
        timerDuracion?.invalidate()
        timerFraude?.invalidate()
    }
    
    private func iniciarContador() {
        timerDuracion = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in self.duracion += 1 }
    }
    
    private func iniciarDetectorFraude() {
        // Placeholder: Aquí podrías poner lógica local si quisieras
    }
    
    func formatearDuracion() -> String {
        let m = duracion / 60
        let s = duracion % 60
        return String(format: "%02d:%02d", m, s)
    }
}

// --- 3. VISTA LISTA DE ESCENARIOS (Menú Principal) ---
struct Call: View {
    let escenarios = [
        ScenarioItem(titulo: "Pedida de Contraseña", descripcion: "Acceso banca móvil", icono: "lock.shield.fill", key: "contrasena"),
        ScenarioItem(titulo: "Pedida de NIP", descripcion: "Ingeniería social cajero", icono: "creditcard.and.123", key: "nip"),
        ScenarioItem(titulo: "Pedida de CVV", descripcion: "Compras no reconocidas", icono: "creditcard.fill", key: "cvv"),
        ScenarioItem(titulo: "Asesor técnico", descripcion: "Asesor tecnico legal", icono: "person.badge.shield.checkmark.fill", key: "normal")
    ]
    
    @State private var escenarioSeleccionado: ScenarioItem?
    @State private var mostrarPantallaSiguiente = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 25) {
                VStack(spacing: 10) {
                    Text("Simulador de Fraude")
                        .font(.largeTitle).fontWeight(.heavy)
                    Text("Selecciona un escenario para poner a prueba al sistema")
                        .font(.subheadline).foregroundColor(.secondary).multilineTextAlignment(.center)
                }
                .padding(.top, 30)
                
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(escenarios) { escenario in
                            ScenarioButtonView(
                                escenario: escenario,
                                estaSeleccionado: escenarioSeleccionado?.id == escenario.id
                            )
                            .onTapGesture {
                                withAnimation(.spring()) { escenarioSeleccionado = escenario }
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                if let escenario = escenarioSeleccionado {
                    VStack(spacing: 15) {
                        Text("Escenario: \(escenario.titulo)")
                            .font(.caption).fontWeight(.bold).foregroundColor(.gray).textCase(.uppercase)
                        
                        Button(action: { mostrarPantallaSiguiente = true }) {
                            HStack {
                                Image(systemName: "phone.connection.fill").font(.system(size: 22))
                                Text("Iniciar Prueba").fontWeight(.bold).font(.title3)
                            }
                            .frame(maxWidth: .infinity).padding(.vertical, 16)
                            .background(Color.red).foregroundColor(.white).cornerRadius(16)
                            .shadow(color: .red.opacity(0.4), radius: 10, x: 0, y: 5)
                        }
                    }
                    .padding(20).background(Color(UIColor.secondarySystemBackground)).cornerRadius(20, corners: [.topLeft, .topRight]).shadow(radius: 5)
                }
            }
            .navigationBarHidden(true)
            .fullScreenCover(isPresented: $mostrarPantallaSiguiente) {
                if let escenario = escenarioSeleccionado {
                    PantallaLlamadaView(escenario: escenario)
                }
            }
        }
    }
}

// --- 4. VISTA DE LA LLAMADA ---
struct PantallaLlamadaView: View {
    let escenario: ScenarioItem
    @Environment(\.dismiss) var dismiss
    @StateObject private var manager = CallManager()
    
    var body: some View {
        ZStack {
            LinearGradient(gradient: Gradient(colors: [Color.black, Color.gray.opacity(0.8)]), startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 0) {
                VStack(spacing: 15) {
                    Spacer().frame(height: 60)
                    Circle().fill(Color.gray.opacity(0.3)).frame(width: 120, height: 120).overlay(Image(systemName: "person.fill").font(.system(size: 60)).foregroundColor(.white.opacity(0.8)))
                    Text("Contacto Simulado").font(.system(size: 32, weight: .medium)).foregroundColor(.white)
                    if manager.estadoLlamada == .conectando { Text("Conectando...").font(.system(size: 18)).foregroundColor(.white.opacity(0.7)) }
                    else if manager.botHablando { Text("Hablando...").font(.system(size: 18)).foregroundColor(.green).fontWeight(.bold) }
                    else { Text(escenario.titulo).font(.system(size: 18)).foregroundColor(.white.opacity(0.7)) }
                    if manager.estadoLlamada == .enLlamada { Text(manager.formatearDuracion()).font(.system(size: 16)).foregroundColor(.white.opacity(0.6)) }
                }.padding(.top, 20)
                Spacer()
                VStack(spacing: 35) {
                    HStack(spacing: 50) {
                        BotonLlamada(icono: "speaker.wave.3.fill", titulo: "Altavoz", estaActivo: manager.estaEnAltavoz) { manager.toggleAltavoz() }
                        BotonLlamada(icono: "video.fill", titulo: "FaceTime", estaActivo: false) { }
                        BotonLlamada(icono: "mic.slash.fill", titulo: "Silencio", estaActivo: manager.estaEnSilencio) { manager.toggleMute() }
                    }
                    HStack(spacing: 50) {
                        BotonLlamada(icono: "plus", titulo: "Agregar", estaActivo: false) { }
                        Button(action: { manager.finalizarLlamada(); dismiss() }) {
                            Circle().fill(Color.red).frame(width: 75, height: 75).overlay(Image(systemName: "phone.down.fill").font(.system(size: 32)).foregroundColor(.white))
                        }
                        BotonLlamada(icono: "circle.grid.3x3.fill", titulo: "Teclado", estaActivo: false) { }
                    }
                }.padding(.bottom, 50)
            }
            if manager.mostrarPopupRojo {
                        Color.black.opacity(0.7)
                            .ignoresSafeArea()
                            .transition(.opacity)
                        
                        PopupFraudeRojo()
                            .transition(.scale.combined(with: .opacity))
                    }
        }
        .onAppear { manager.iniciarLlamada(escenarioKey: escenario.key) }
        .onDisappear { manager.finalizarLlamada() }
        // 👇 1. ESCUCHAMOS EL ESTADO PARA CERRAR AUTOMÁTICAMENTE
        .onChange(of: manager.estadoLlamada) { nuevoEstado in
                    if nuevoEstado == .finalizada {
                        print("Cerrando pantalla automáticamente...")
                        dismiss()
                    }
                }
                
                // 👇 2. ALERTA NARANJA
        .alert("⚠️ POSIBLE FRAUDE DETECTADO", isPresented: $manager.mostrarAlertaFraude) {
                    Button("Colgar Ahora", role: .destructive) {
                        manager.finalizarLlamada()
                        // No necesitamos llamar dismiss() aquí porque el .onChange de arriba lo hará
                    }
                    Button("Continuar bajo mi riesgo", role: .cancel) { }
                } message: { Text("Nuestro sistema detectó que están intentando obtener información sensible (Nivel Naranja).") }
    }
}

// --- 5. COMPONENTES VISUALES AUXILIARES ---
struct ScenarioButtonView: View {
    let escenario: ScenarioItem
    let estaSeleccionado: Bool
    
    var body: some View {
        HStack(spacing: 15) {
            ZStack {
                Circle().fill(estaSeleccionado ? Color.blue : Color.gray.opacity(0.1)).frame(width: 50, height: 50)
                Image(systemName: escenario.icono).font(.system(size: 22)).foregroundColor(estaSeleccionado ? .white : .blue)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(escenario.titulo).font(.headline).foregroundColor(.primary)
                Text(escenario.descripcion).font(.caption).foregroundColor(.secondary)
            }
            Spacer()
            if estaSeleccionado {
                Image(systemName: "checkmark.circle.fill").font(.title2).foregroundColor(.blue).transition(.scale)
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 16).fill(Color(UIColor.systemBackground)).shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(estaSeleccionado ? Color.blue : Color.clear, lineWidth: 2))
    }
}

struct BotonLlamada: View {
    let icono: String
    let titulo: String
    let estaActivo: Bool
    let accion: () -> Void
    var body: some View {
        Button(action: accion) {
            VStack(spacing: 8) {
                Circle().fill(estaActivo ? Color.white : Color.white.opacity(0.2)).frame(width: 75, height: 75).overlay(Image(systemName: icono).font(.system(size: 30)).foregroundColor(estaActivo ? .black : .white))
                Text(titulo).font(.system(size: 12)).foregroundColor(.white.opacity(0.8))
            }
        }
    }
}

// Estilos
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape( RoundedCorner(radius: radius, corners: corners) )
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

struct Call_Previews: PreviewProvider {
    static var previews: some View { Call() }
}
