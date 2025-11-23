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
    
    var esperandoRespuesta: Bool = false
    var esPrimerMensaje: Bool = true // Bandera de Reset
    
    // Variable para recordar qué escenario estamos jugando
    var escenarioKeyActual: String = "general"
    
    // Timers
    private var timerDuracion: Timer?
    private var timerFraude: Timer?
    private var timerSilencio: Timer?
    
    // ⚠️ URL DE TU BACKEND
    private let apiUrl = "https://polihacks-2025-production.up.railway.app/api/v1/chat"
    
    enum EstadoLlamada { case conectando, enLlamada, finalizada }
    
    override init() {
        super.init()
        sintetizadorVoz.delegate = self
    }
    
    // --- INICIO Y FIN ---
    func iniciarLlamada(escenarioKey: String) {
        self.escenarioKeyActual = escenarioKey
        self.esPrimerMensaje = true // Reseteamos bandera
        
        configurarSesionGlobal()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.estadoLlamada = .enLlamada
            self.iniciarContador()
            self.iniciarDetectorFraude()
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
    
    // --- ESCUCHA ---
    private func iniciarReconocimientoVoz() {
        guard !botHablando && !esperandoRespuesta else { return }
        
        detenerMotorVoz()
        
        request = SFSpeechAudioBufferRecognitionRequest()
        // Intenta forzar offline para evitar límite de cuota
        if #available(iOS 13, *) { request.requiresOnDeviceRecognition = true }
        request.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        
        recognitionTask = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }
            
            var isFinal = false
            
            if let result = result {
                self.textoDetectado = result.bestTranscription.formattedString
                print("TÚ: \(self.textoDetectado)")
                isFinal = result.isFinal
                
                // Debounce de silencio (3s)
                self.timerSilencio?.invalidate()
                self.timerSilencio = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { _ in
                    print("Silencio detectado. Procesando...")
                    self.procesarTurnoUsuario()
                }
            }
            
            // Manejo de errores y reinicio
            if error != nil || isFinal {
                self.detenerMotorVoz()
                
                // Solo reiniciamos si seguimos en llamada y nadie está hablando/procesando
                if self.estadoLlamada == .enLlamada && !self.botHablando && !self.esperandoRespuesta {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        self.iniciarReconocimientoVoz()
                    }
                }
            }
        }
        
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            self.request.append(buffer)
        }
        
        audioEngine.prepare()
        try? audioEngine.start()
        print("Escuchando...")
    }
    
    private func detenerMotorVoz() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionTask?.cancel()
        request.endAudio()
        timerSilencio?.invalidate()
    }
    
    private func procesarTurnoUsuario() {
        esperandoRespuesta = true
        detenerMotorVoz()
        enviarMensajeAPI(mensaje: textoDetectado, escenarioSend: self.escenarioKeyActual)
    }
    
    // --- API ---
    private func enviarMensajeAPI(mensaje: String, escenarioSend: String) {
        guard !mensaje.isEmpty, let url = URL(string: apiUrl) else {
            esperandoRespuesta = false
            iniciarReconocimientoVoz()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "message": mensaje,
            "type": escenarioSend,
            "reset": self.esPrimerMensaje
        ]
        
        // Apagamos bandera después de usarla
        self.esPrimerMensaje = false
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        print("Enviando: \(mensaje) | Type: \(escenarioSend) | Reset: \(body["reset"] ?? false)")
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self = self else { return }
            DispatchQueue.main.async { self.esperandoRespuesta = false }
            
            if let data = data {
                struct ChatResponse: Codable {
                    let reply: String
                    let ataque: Bool?
                    let nivel: String?
                }
                
                if let decoded = try? JSONDecoder().decode(ChatResponse.self, from: data) {
                    DispatchQueue.main.async {
                        
                        // Lógica de Seguridad (Rojo vs Naranja)
                        if decoded.ataque == true {
                            if decoded.nivel == "rojo" {
                                print("🚨 AMENAZA ROJA: Colgando.")
                                UINotificationFeedbackGenerator().notificationOccurred(.error)
                                self.finalizarLlamada()
                                return
                            } else if decoded.nivel == "naranja" {
                                print("⚠️ AMENAZA NARANJA: Alerta.")
                                self.mostrarAlertaFraude = true
                                UINotificationFeedbackGenerator().notificationOccurred(.warning)
                            }
                        }
                        
                        // Bot habla normal (incluso si es naranja)
                        print("🤖 BOT: \(decoded.reply)")
                        self.leerRespuestaBot(texto: decoded.reply)
                    }
                } else {
                    print("❌ JSON Error")
                    DispatchQueue.main.async { self.iniciarReconocimientoVoz() }
                }
            } else {
                print("❌ Red Error")
                DispatchQueue.main.async { self.iniciarReconocimientoVoz() }
            }
        }.resume()
    }
    
    // --- VOZ BOT ---
    private func leerRespuestaBot(texto: String) {
        botHablando = true
        
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
        botHablando = false
        textoDetectado = ""
        if estadoLlamada == .enLlamada { iniciarReconocimientoVoz() }
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
        ScenarioItem(titulo: "Pedida de CVV", descripcion: "Compras no reconocidas", icono: "creditcard.fill", key: "cvv")
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
            .sheet(isPresented: $mostrarPantallaSiguiente) {
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
        }
        .onAppear { manager.iniciarLlamada(escenarioKey: escenario.key) }
        .onDisappear { manager.finalizarLlamada() }
        .alert("⚠️ POSIBLE FRAUDE DETECTADO", isPresented: $manager.mostrarAlertaFraude) {
            Button("Colgar Ahora", role: .destructive) { manager.finalizarLlamada(); dismiss() }
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
