//
//  models.swift
//  estafas-bancarias
//
//  Created by Diego Obed on 22/11/25.
//

import Foundation

// Modelo para representar un audio
struct ScenarioItem: Identifiable {
    let id = UUID()
    let titulo: String          
    let descripcion: String
    let icono: String
    let key: String
}
