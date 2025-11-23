const express = require("express");
const { esFraude } = require("../services/gemini.service");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: "Falta 'texto' en el body" });

    const resultado = await esFraude(texto);
    res.json({ ataque: resultado.ataque, nivel: resultado.nivel }); //devuelve si es true o false y el nivel de riesgo
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
