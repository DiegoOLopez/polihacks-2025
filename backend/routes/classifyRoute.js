// classifyRoute.js
const express = require("express");
const { analizarTexto } = require("../services/gemini.service");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "Falta 'texto' en el body" });
    }

    const resultado = await analizarTexto(texto);
    res.json(resultado);

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
