//gemini.service.js
import { spawn } from "child_process";
import path from "path";

export function analizarTexto(texto) {
  return new Promise((resolve, reject) => {

    const motorPath = path.resolve("C:\\Users\\axedu\\Desktop\\polihacks-2025\\Gemini\\testGemini.wl");
    const inputJson = JSON.stringify({ texto });

    const proceso = spawn(
      `"C:\\Program Files\\Wolfram Research\\Wolfram Engine\\14.3\\wolframscript.exe"`,
      ["-file", motorPath, inputJson],
      { shell: true }
    );

    let output = "";
    let error = "";

    proceso.stdout.on("data", data => {
      output += data.toString();
    });

    proceso.stderr.on("data", data => {
      error += data.toString();
    });

    proceso.on("close", () => {
      if (error) return reject(error);

      try {
        resolve(JSON.parse(output));
      } catch (err) {
        reject("Error parseando la salida de Wolfram: " + err);
      }
    });
  });
}
