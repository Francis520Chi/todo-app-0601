const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const clearButton = document.querySelector("#clear-button");
const stats = document.querySelector("#todo-stats");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.querySelector("#theme-toggle");
const exportButton = document.querySelector("#export-button");
const importButton = document.querySelector("#import-button");
const importFile = document.querySelector("#import-file");

const storageKey = "codex-todo-items";
const themeStorageKey = "codex-todo-theme";

let todos = loadTodos();
let currentFilter = "all";
let searchText = "";

applySavedTheme();
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
    createdAt: new Date().toISOString(),
  });

  input.value = "";
  saveAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    renderTodos();
  });
});

searchInput.addEventListener("input", () => {
  searchText = searchInput.value.trim().toLowerCase();
  renderTodos();
});

themeToggle.addEventListener("click", () => {
  const shouldUseDarkMode = !document.body.classList.contains("dark-mode");
  setTheme(shouldUseDarkMode);
});

exportButton.addEventListener("click", () => {
  exportTodos();
});

importButton.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", () => {
  const file = importFile.files[0];

  if (!file) {
    return;
  }

  importTodos(file);
  importFile.value = "";
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

  const visibleTodos = getVisibleTodos();

  visibleTodos.forEach((todo) => {
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

    const content = document.createElement("div");
    content.className = "todo-content";

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    content.append(text);

    if (todo.createdAt) {
      const date = document.createElement("span");
      date.className = "todo-date";
      date.textContent = `建立於：${formatTodoDate(todo.createdAt)}`;
      content.append(date);
    }

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "編輯";
    editButton.setAttribute("aria-label", `編輯「${todo.text}」`);

    editButton.addEventListener("click", () => {
      const newText = prompt("請輸入新的任務內容：", todo.text);

      if (newText === null) {
        return;
      }

      const trimmedText = newText.trim();

      if (trimmedText === "") {
        return;
      }

      todo.text = trimmedText;
      saveAndRender();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);

    deleteButton.addEventListener("click", () => {
      todos = todos.filter((itemToKeep) => itemToKeep.id !== todo.id);
      saveAndRender();
    });

    item.append(checkbox, content, editButton, deleteButton);
    list.append(item);
  });

  emptyMessage.classList.toggle("hidden", visibleTodos.length > 0);
  clearButton.classList.toggle("hidden", todos.length === 0);
  updateStats();
}

function getVisibleTodos() {
  let filteredTodos = todos;

  if (currentFilter === "active") {
    filteredTodos = filteredTodos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    filteredTodos = filteredTodos.filter((todo) => todo.completed);
  }

  if (searchText !== "") {
    filteredTodos = filteredTodos.filter((todo) =>
      todo.text.toLowerCase().includes(searchText)
    );
  }

  return filteredTodos;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
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

function formatTodoDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  setTheme(savedTheme === "dark");
}

function setTheme(shouldUseDarkMode) {
  document.body.classList.toggle("dark-mode", shouldUseDarkMode);
  themeToggle.textContent = shouldUseDarkMode ? "關閉深色模式" : "開啟深色模式";
  localStorage.setItem(themeStorageKey, shouldUseDarkMode ? "dark" : "light");
}

function exportTodos() {
  const backup = {
    exportedAt: new Date().toISOString(),
    todos,
  };
  const fileContent = JSON.stringify(backup, null, 2);
  const file = new Blob([fileContent], { type: "application/json" });
  const fileUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");

  downloadLink.href = fileUrl;
  downloadLink.download = `todo-backup-${formatBackupDate(new Date())}.json`;
  downloadLink.click();
  URL.revokeObjectURL(fileUrl);
}

function importTodos(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const importedData = JSON.parse(reader.result);
      const importedTodos = normalizeImportedTodos(importedData);

      if (importedTodos.length === 0) {
        alert("匯入檔案沒有可用的任務資料。");
        return;
      }

      const confirmed = confirm("匯入後會取代目前所有任務，確定要繼續嗎？");

      if (!confirmed) {
        return;
      }

      todos = importedTodos;
      saveAndRender();
      alert("任務資料已匯入。");
    } catch {
      alert("匯入失敗，請確認檔案是正確的 JSON 備份。");
    }
  });

  reader.readAsText(file);
}

function normalizeImportedTodos(importedData) {
  const importedTodos = Array.isArray(importedData)
    ? importedData
    : importedData.todos;

  if (!Array.isArray(importedTodos)) {
    throw new Error("Invalid todo backup");
  }

  return importedTodos
    .filter((todo) => typeof todo.text === "string" && todo.text.trim() !== "")
    .map((todo) => ({
      id: Number.isFinite(todo.id) ? todo.id : Date.now() + Math.random(),
      text: todo.text.trim(),
      completed: Boolean(todo.completed),
      createdAt: typeof todo.createdAt === "string" ? todo.createdAt : undefined,
    }));
}

function formatBackupDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}`;
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
