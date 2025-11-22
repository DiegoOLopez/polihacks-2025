(*testGemini.wl*)
(*CONFIG*)
apiKey = "AIzaSyAO774id7b2y1XUhKqTmRMuQHdMw0bYcBw"; 
model = "gemini-2.5-flash";

url = "https://generativelanguage.googleapis.com/v1beta/models/" <> 
      model <> ":generateContent?key=" <> apiKey;

Off[AppendTo::rvalue];

(*PROMPTS*)

promptRol = "
Eres un analista profesional de ciberseguridad experto en detección de fraude,
ingeniería social, estafas y extorsión. Siempre respondes SOLO con JSON válido.
";

promptDeteccion = "
Clasifica el siguiente texto. Devuelve SOLO este JSON:

{
  \"isAttack\": true/false,
  \"classification\": \"...\",
  \"justification\": \"...\"
}

Reglas para determinar si es ataque:
- Solicita CVV, código de seguridad, NIP, PIN.
- Pide token SMS, contraseña o código de banca.
- Se hace pasar por el banco sin autenticación.
- Hay amenazas, presión o urgencia extrema.
";

(*MÉTODO PRINCIPAL*)

analizarTexto[text_] := Module[
  {promptFinal, body, req, resp, salida},

  promptFinal = promptRol <> "\n" <> promptDeteccion <> "\nTEXTO:\n" <> text;

  body = <|
    "contents" -> {
      <|"role" -> "user", "parts" -> {<|"text" -> promptFinal|>}|>
    }
  |>;

  req = HTTPRequest[
    url,
    <|
      "Method" -> "POST",
      "Headers" -> {"Content-Type" -> "application/json"},
      "Body" -> ExportString[body, "JSON"]
    |>
  ];

  resp = URLRead[req];
  salida = resp["Body"];
  Return[salida];
];

(*recibirJSON*)

recibirJSON[data_] := Module[{texto},
  texto = data["texto"];
  analizarTexto[texto]
];

(*enviarJSON*)

enviarJSON[result_] := ExportString[result, "JSON"];


(*EJECUCIÓN DESDE NODE*)

argumentos = Rest[$ScriptCommandLine];

If[Length[argumentos] > 0,
  entrada = ImportString[argumentos[[1]], "JSON"];
  salida = recibirJSON[entrada];
  Print[salida];
];
