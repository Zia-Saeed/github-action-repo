const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 5000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

// ---------- simple JSON-file persistence ----------
fs.mkdirSync(DATA_DIR, { recursive: true });

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

let todos = load();

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// ---------- app ----------
const app = express();
app.use(express.json());

// CORS (lets the frontend call the API directly in local dev without nginx)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/todos", (req, res) => res.json(todos));

app.post("/api/todos", (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "title is required" });
  const todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  save();
  res.status(201).json(todo);
});

app.put("/api/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "not found" });
  if (typeof req.body.title === "string" && req.body.title.trim()) {
    todo.title = req.body.title.trim();
  }
  if (typeof req.body.completed === "boolean") {
    todo.completed = req.body.completed;
  }
  save();
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const before = todos.length;
  todos = todos.filter((t) => t.id !== req.params.id);
  if (todos.length === before) return res.status(404).json({ error: "not found" });
  save();
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Todo API listening on port ${PORT}`));
