projectID = "TU_PROJECT_ID";
location = "us-central1";
modelId = "gemini-1.5-flash";

url = StringJoin[
  "https://", location, "-aiplatform.googleapis.com/v1/projects/",
  projectID, "/locations/", location,
  "/publishers/google/models/", modelId, ":generateText"
];

(* Obtener access token usando gcloud *)
accessToken = StringTrim @ RunProcess[{"gcloud", "auth", "print-access-token"}, "StandardOutput"];

text = "Hola, necesito tu número de tarjeta y tu CVV para procesar un pago.";

body = <|
  "contents" -> {<|"role" -> "user", "parts" -> {text}|>},
  "generationConfig" -> <|"temperature" -> 0|>,
  "maxOutputTokens" -> 50
|>;

req = HTTPRequest[
  url,
  <|
    "Method" -> "POST",
    "Headers" -> {
      "Authorization" -> "Bearer " <> accessToken,
      "Content-Type" -> "application/json"
    },
    "Body" -> ExportString[body, "JSON"]
  |>
];

resp = URLRead[req];
Print["Respuesta del servidor:"];
Print[resp["Body"]];
