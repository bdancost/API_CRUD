// src/routes.js
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Caminho absoluto para o arquivo JSON que simula o "banco de dados"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, "database.json");

/**
 * Lê o conteúdo do "banco de dados" (database.json)
 * Retorna um array de tasks ou um array vazio se o arquivo estiver vazio
 */
function readDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, JSON.stringify([]));
  }

  const data = fs.readFileSync(databasePath, "utf-8");
  try {
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
}

/**
 * Salva os dados no "banco de dados" (database.json)
 */
function saveDatabase(tasks) {
  fs.writeFileSync(databasePath, JSON.stringify(tasks, null, 2));
}

export const routes = [
  // Criar uma task
  {
    method: "POST",
    path: /^\/tasks$/,
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        res
          .writeHead(400)
          .end(
            JSON.stringify({ error: "Title e Description são obrigatórios" })
          );
        return;
      }

      const tasks = readDatabase();
      const newTask = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      tasks.push(newTask);
      saveDatabase(tasks);

      res.writeHead(201).end(JSON.stringify(newTask));
    },
  },

  // Listar tasks (com filtro opcional)
  {
    method: "GET",
    path: /^\/tasks$/,
    handler: (req, res) => {
      const { search } = req.query || {};
      let tasks = readDatabase();

      if (search) {
        tasks = tasks.filter(
          (task) =>
            task.title.includes(search) || task.description.includes(search)
        );
      }

      res.writeHead(200).end(JSON.stringify(tasks));
    },
  },

  // Atualizar uma task
  {
    method: "PUT",
    path: /^\/tasks\/([a-z0-9-]+)$/,
    handler: (req, res) => {
      const id = req.url.split("/")[2];
      const { title, description } = req.body;
      const tasks = readDatabase();

      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) {
        res
          .writeHead(404)
          .end(JSON.stringify({ error: "Task não encontrada" }));
        return;
      }

      if (title) tasks[index].title = title;
      if (description) tasks[index].description = description;
      tasks[index].updated_at = new Date();

      saveDatabase(tasks);
      res.writeHead(200).end(JSON.stringify(tasks[index]));
    },
  },

  // Deletar uma task
  {
    method: "DELETE",
    path: /^\/tasks\/([a-z0-9-]+)$/,
    handler: (req, res) => {
      const id = req.url.split("/")[2];
      let tasks = readDatabase();

      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) {
        res
          .writeHead(404)
          .end(JSON.stringify({ error: "Task não encontrada" }));
        return;
      }

      tasks.splice(index, 1);
      saveDatabase(tasks);
      res.writeHead(204).end();
    },
  },

  // Marcar como completa/incompleta
  {
    method: "PATCH",
    path: /^\/tasks\/([a-z0-9-]+)\/complete$/,
    handler: (req, res) => {
      const id = req.url.split("/")[2];
      const tasks = readDatabase();

      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) {
        res
          .writeHead(404)
          .end(JSON.stringify({ error: "Task não encontrada" }));
        return;
      }

      tasks[index].completed_at = tasks[index].completed_at ? null : new Date();
      tasks[index].updated_at = new Date();

      saveDatabase(tasks);
      res.writeHead(200).end(JSON.stringify(tasks[index]));
    },
  },
];
