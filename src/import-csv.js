import fs from "node:fs";
import readline from "node:readline";
import { randomUUID } from "node:crypto";

export async function importCSV(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const tasks = JSON.parse(fs.readFileSync("src/database.json", "utf8"));

  for await (const line of rl) {
    const [title, description] = line.split(",");
    tasks.push({
      id: randomUUID(),
      title,
      description,
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  fs.writeFileSync("src/database.json", JSON.stringify(tasks, null, 2));
}
