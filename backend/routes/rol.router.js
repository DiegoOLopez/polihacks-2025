const express = require('express');
const router = express.Router();

const RolController = require('../controller/rol.controller');
const {validacionJWT, verificarRol }= require('./../utils/validations/validationJWT');

// Crear un nuevo rol
router.post('/', validacionJWT, verificarRol (['superadmin']), (req, res, next) => RolController.create(req, res, next));

// Obtener todos los roles
router.get('/', validacionJWT, verificarRol (['superadmin']), (req, res, next) => RolController.findAll(req, res, next));

// Obtener un rol por ID
router.get('/:id_rol', validacionJWT, verificarRol (['superadmin']), (req, res, next) => RolController.findById(req, res, next));

// Actualizar un rol por ID
router.put('/:id_rol', validacionJWT, verificarRol (['superadmin']), (req, res, next) => RolController.updateById(req, res, next));

// Eliminar un rol por ID
router.delete('/:id_rol', validacionJWT, verificarRol (['superadmin']), (req, res, next) => RolController.deleteById(req, res, next));

module.exports = router;