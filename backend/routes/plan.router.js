const express = require ('express');

const PlanService = require('./../services/plan.service')
const router = express.Router();

// Importar validacionJWT y verificarRol
const { validacionJWT, verificarRol } = require('./../utils/validations/validationJWT');

const service = new PlanService();

// Buscar modulos

router.get('/:id_plan', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const { id_plan } = req.params;
        const plan = await service.findOne(id_plan);
        res.json(plan);
    } catch (error) {
        next (error);
    }
}
);

router.get('/', validacionJWT, verificarRol(['admin', 'user']),
async (req, res, next) => {
    try {
        const { id_empresa } = req.user;
        const planes = await service.find(id_empresa);
        res.status(201).json(planes);
    } catch (error) {
        next(error);
    }
}
)

// Crear listas
router.post ('/', validacionJWT, verificarRol(['admin']),
async (req, res, next) => {
    try {
        const body = req.body;
        const plan = await service.create(body);
        res.status(201).json(plan);
    } catch (error) {
        next (error);
    }
}
);

module.exports = router;
