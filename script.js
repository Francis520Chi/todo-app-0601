const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const clearButton = document.querySelector("#clear-button");
const stats = document.querySelector("#todo-stats");

const storageKey = "codex-todo-items";

let todos = loadTodos();

renderTodos();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  todos.push({
    id: Date.now(),
    text,
    completed: false,
  });

  input.value = "";
  saveAndRender();
});

clearButton.addEventListener("click", () => {
  const confirmed = confirm("確定要清除全部任務嗎？這個動作無法復原。");

  if (!confirmed) {
    return;
  }

  todos = [];
  saveAndRender();
});

function renderTodos() {
  list.innerHTML = "";

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";

    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `標記「${todo.text}」是否完成`);

    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveAndRender();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((itemToKeep) => itemToKeep.id !== todo.id);
      saveAndRender();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyMessage.classList.toggle("hidden", todos.length > 0);
  clearButton.classList.toggle("hidden", todos.length === 0);
  updateStats();
}

function updateStats() {
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = totalCount - completedCount;

  stats.innerHTML = `
    <span>全部：${totalCount}</span>
    <span>已完成：${completedCount}</span>
    <span>未完成：${activeCount}</span>
  `;
}

function saveAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(todos));
  renderTodos();
}

function loadTodos() {
  const savedTodos = localStorage.getItem(storageKey);

  if (!savedTodos) {
    return [];
  }

  try {
    return JSON.parse(savedTodos);
  } catch {
    return [];
  }
}
