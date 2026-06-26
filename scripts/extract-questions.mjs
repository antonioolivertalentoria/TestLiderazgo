// ⚠️ ADVERTENCIA: Este extractor SOLO captura los textos y la respuesta marcada.
// NO captura el estilo (S1-S4) ni la efectividad (-2/-1/+1/+2) de cada opción, que
// son indispensables para calificar correctamente. El archivo questions.json fue
// corregido a mano con la clave oficial; volver a correr este script SOBRESCRIBIRÍA
// esa clave y dejaría el cálculo mal de nuevo. No lo ejecutes sin volver a inyectar
// styleCode/effectiveness por opción.
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Usage: node scripts/extract-questions.mjs <xlsx-path>");
  process.exit(1);
}

const workbook = xlsx.readFile(sourcePath);
const sheet = workbook.Sheets["TEST"];
if (!sheet) {
  console.error("Sheet 'TEST' not found");
  process.exit(1);
}

const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
const fixEncoding = (value) => {
  if (typeof value !== "string") return value;
  if (!/[ÃÂ]/.test(value)) return value;
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
};

const questions = [];

for (let i = 0; i < rows.length; i += 1) {
  const row = rows[i];
  const text = fixEncoding(String(row[0] ?? "").trim());
  if (!text.startsWith("Situación")) continue;

  const prompt = text;
  const options = [];

  for (let j = i + 1; j < rows.length; j += 1) {
    const r = rows[j];
    const letter = String(r[1] ?? "").trim();
    if (["A", "B", "C", "D"].includes(letter)) {
      const optionText = fixEncoding(String(r[2] ?? "").trim());
      const isCorrect = r[0] === 1 || r[0] === "1";
      options.push({ letter, text: optionText, isCorrect });
      if (options.length === 4) {
        i = j;
        break;
      }
    }
  }

  if (options.length) {
    questions.push({ prompt, options });
  }
}

const output = {
  meta: {
    sourceFile: path.basename(sourcePath),
    extractedAt: new Date().toISOString(),
    questionCount: questions.length,
  },
  questions,
};

const outPath = path.join(process.cwd(), "src", "data", "questions.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
console.log(`Saved ${questions.length} questions to ${outPath}`);
