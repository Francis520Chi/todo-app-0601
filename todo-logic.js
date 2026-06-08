(function (root) {
  const allowedCategories = ["工作", "生活", "學習", "其他"];

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

  const todoLogic = {
    allowedCategories,
    normalizeImportedTodos,
    normalizeTodo,
    normalizeCategory,
    formatTodoDate,
    formatBackupDate,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = todoLogic;
  }

  if (root) {
    root.todoLogic = todoLogic;
  }
})(typeof window !== "undefined" ? window : globalThis);
