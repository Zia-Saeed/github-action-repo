const API = `${window.API_BASE_URL || ""}/api/todos`;

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const statusEl = document.getElementById("status");
const filterButtons = document.querySelectorAll(".filters button");

let todos = [];
let filter = "all";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

function setStatus(msg = "") {
  statusEl.textContent = msg;
}

function render() {
  list.innerHTML = "";
  const visible = todos.filter((t) =>
    filter === "active" ? !t.completed : filter === "completed" ? t.completed : true
  );

  for (const todo of visible) {
    const li = document.createElement("li");
    li.className = todo.completed ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggle(todo));

    const span = document.createElement("span");
    span.textContent = todo.title;
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => edit(todo));

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete");
    del.addEventListener("click", () => remove(todo));

    li.append(checkbox, span, del);
    list.appendChild(li);
  }

  const left = todos.filter((t) => !t.completed).length;
  setStatus(todos.length ? `${left} item${left === 1 ? "" : "s"} left` : "Nothing to do 🎉");
}

async function loadTodos() {
  try {
    todos = await request(API);
    render();
  } catch (e) {
    setStatus("Could not reach the API. Is the backend running?");
  }
}

async function addTodo(title) {
  const todo = await request(API, { method: "POST", body: JSON.stringify({ title }) });
  todos.push(todo);
  render();
}

async function toggle(todo) {
  const updated = await request(`${API}/${todo.id}`, {
    method: "PUT",
    body: JSON.stringify({ completed: !todo.completed }),
  });
  Object.assign(todo, updated);
  render();
}

async function edit(todo) {
  const title = prompt("Edit todo", todo.title);
  if (!title || !title.trim()) return;
  const updated = await request(`${API}/${todo.id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
  Object.assign(todo, updated);
  render();
}

async function remove(todo) {
  await request(`${API}/${todo.id}`, { method: "DELETE" });
  todos = todos.filter((t) => t.id !== todo.id);
  render();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  try {
    await addTodo(title);
    input.value = "";
  } catch {
    setStatus("Failed to add todo.");
  }
});

filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  })
);

loadTodos();
