const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const categorySelect = document.querySelector("#category-select");
const categoryFilter = document.querySelector("#category-filter");
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
const allowedCategories = ["工作", "生活", "學習", "其他"];

let todos = loadTodos();
let currentFilter = "all";
let currentCategoryFilter = "全部分類";
let searchText = "";

initializeApp();

function initializeApp() {
  applySavedTheme();
  renderTodos();
  registerEventListeners();
}

function registerEventListeners() {
  form.addEventListener("submit", handleTodoSubmit);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleFilterClick(button);
    });
  });

  searchInput.addEventListener("input", handleSearchInput);
  categoryFilter.addEventListener("change", handleCategoryFilterChange);
  themeToggle.addEventListener("click", handleThemeToggle);
  exportButton.addEventListener("click", exportTodos);
  importButton.addEventListener("click", openImportFilePicker);
  importFile.addEventListener("change", handleImportFileChange);
  clearButton.addEventListener("click", handleClearTodos);
}

function handleTodoSubmit(event) {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  todos.push({
    id: Date.now(),
    text,
    category: normalizeCategory(categorySelect.value),
    completed: false,
    createdAt: new Date().toISOString(),
  });

  input.value = "";
  saveAndRender();
}

function handleFilterClick(button) {
  currentFilter = button.dataset.filter;
  updateFilterButtons();
  renderTodos();
}

function handleSearchInput() {
  searchText = searchInput.value.trim().toLowerCase();
  renderTodos();
}

function handleCategoryFilterChange() {
  currentCategoryFilter = categoryFilter.value;
  renderTodos();
}

function handleThemeToggle() {
  const shouldUseDarkMode = !document.body.classList.contains("dark-mode");
  setTheme(shouldUseDarkMode);
}

function openImportFilePicker() {
  importFile.click();
}

function handleImportFileChange() {
  const file = importFile.files[0];

  if (!file) {
    return;
  }

  importTodos(file);
  importFile.value = "";
}

function handleClearTodos() {
  const confirmed = confirm("確定要清除全部任務嗎？這個動作無法復原。");

  if (!confirmed) {
    return;
  }

  todos = [];
  saveAndRender();
}

function renderTodos() {
  list.innerHTML = "";

  const visibleTodos = getVisibleTodos();

  visibleTodos.forEach((todo) => {
    list.append(createTodoItem(todo));
  });

  emptyMessage.classList.toggle("hidden", visibleTodos.length > 0);
  clearButton.classList.toggle("hidden", todos.length === 0);
  updateStats();
}

function createTodoItem(todo) {
  const todoIndex = todos.findIndex((item) => item.id === todo.id);
  const item = document.createElement("li");
  item.className = "todo-item";

  if (todo.completed) {
    item.classList.add("completed");
  }

  const checkbox = createTodoCheckbox(todo);
  const content = createTodoContent(todo);
  const editButton = createEditButton(todo);
  const deleteButton = createDeleteButton(todo);

  if (canReorderTodos()) {
    const moveControls = createMoveControls(todoIndex);
    item.append(checkbox, content, moveControls, editButton, deleteButton);
  } else {
    item.append(checkbox, content, editButton, deleteButton);
  }

  return item;
}

function createTodoCheckbox(todo) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `標記「${todo.text}」是否完成`);

  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    saveAndRender();
  });

  return checkbox;
}

function createTodoContent(todo) {
  const content = document.createElement("div");
  content.className = "todo-content";

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;
  content.append(text);

  const category = document.createElement("span");
  category.className = "todo-category";
  category.textContent = `分類：${normalizeCategory(todo.category)}`;
  content.append(category);

  if (todo.createdAt) {
    const date = document.createElement("span");
    date.className = "todo-date";
    date.textContent = `建立於：${formatTodoDate(todo.createdAt)}`;
    content.append(date);
  }

  return content;
}

function createEditButton(todo) {
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

  return editButton;
}

function createDeleteButton(todo) {
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "刪除";
  deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);

  deleteButton.addEventListener("click", () => {
    todos = todos.filter((itemToKeep) => itemToKeep.id !== todo.id);
    saveAndRender();
  });

  return deleteButton;
}

function createMoveControls(todoIndex) {
  const controls = document.createElement("div");
  controls.className = "move-controls";

  const moveUpButton = document.createElement("button");
  moveUpButton.type = "button";
  moveUpButton.className = "move-button";
  moveUpButton.textContent = "上移";
  moveUpButton.disabled = todoIndex === 0;

  moveUpButton.addEventListener("click", () => {
    moveTodo(todoIndex, todoIndex - 1);
  });

  const moveDownButton = document.createElement("button");
  moveDownButton.type = "button";
  moveDownButton.className = "move-button";
  moveDownButton.textContent = "下移";
  moveDownButton.disabled = todoIndex === todos.length - 1;

  moveDownButton.addEventListener("click", () => {
    moveTodo(todoIndex, todoIndex + 1);
  });

  controls.append(moveUpButton, moveDownButton);

  return controls;
}

function getVisibleTodos() {
  let filteredTodos = todos;

  if (currentFilter === "active") {
    filteredTodos = filteredTodos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    filteredTodos = filteredTodos.filter((todo) => todo.completed);
  }

  if (currentCategoryFilter !== "全部分類") {
    filteredTodos = filteredTodos.filter(
      (todo) => normalizeCategory(todo.category) === currentCategoryFilter
    );
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

function moveTodo(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= todos.length) {
    return;
  }

  const movedTodo = todos[fromIndex];
  todos[fromIndex] = todos[toIndex];
  todos[toIndex] = movedTodo;
  saveAndRender();
}

function canReorderTodos() {
  return (
    currentFilter === "all" &&
    currentCategoryFilter === "全部分類" &&
    searchText === ""
  );
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
    const parsedTodos = JSON.parse(savedTodos);

    if (!Array.isArray(parsedTodos)) {
      return [];
    }

    return parsedTodos
      .filter((todo) => typeof todo.text === "string" && todo.text.trim() !== "")
      .map(normalizeTodo);
  } catch {
    return [];
  }
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
    .map(normalizeTodo);
}

function normalizeTodo(todo) {
  return {
    id: Number.isFinite(todo.id) ? todo.id : Date.now() + Math.random(),
    text: todo.text.trim(),
    category: normalizeCategory(todo.category),
    completed: Boolean(todo.completed),
    createdAt: typeof todo.createdAt === "string" ? todo.createdAt : undefined,
  };
}

function normalizeCategory(category) {
  if (allowedCategories.includes(category)) {
    return category;
  }

  return "其他";
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

function formatBackupDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hour}${minute}`;
}
