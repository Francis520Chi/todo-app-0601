const assert = require("node:assert");
const {
  normalizeCategory,
  normalizeTodo,
  normalizeImportedTodos,
  formatBackupDate,
  formatTodoDate,
} = require("../todo-logic.js");

function test(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("合法分類會保留原值", () => {
  assert.equal(normalizeCategory("學習"), "學習");
});

test("未知分類會變成其他", () => {
  assert.equal(normalizeCategory("健康"), "其他");
});

test("舊任務沒有分類時會補其他", () => {
  const todo = normalizeTodo({
    id: 1,
    text: "練習 Codex",
    completed: false,
  });

  assert.equal(todo.category, "其他");
});

test("匯入陣列資料時會過濾空白任務", () => {
  const todos = normalizeImportedTodos([
    { id: 1, text: "買牛奶", category: "生活", completed: false },
    { id: 2, text: "   ", category: "工作", completed: false },
  ]);

  assert.equal(todos.length, 1);
  assert.equal(todos[0].text, "買牛奶");
});

test("匯入物件資料時會讀取 todos 欄位", () => {
  const todos = normalizeImportedTodos({
    exportedAt: "2026-06-08T00:00:00.000Z",
    todos: [{ id: 1, text: "回覆 Email", category: "工作", completed: true }],
  });

  assert.equal(todos.length, 1);
  assert.equal(todos[0].completed, true);
});

test("匯入格式錯誤時會丟出錯誤", () => {
  assert.throws(() => {
    normalizeImportedTodos({ tasks: [] });
  }, /Invalid todo backup/);
});

test("錯誤日期會回傳空字串", () => {
  assert.equal(formatTodoDate("not-a-date"), "");
});

test("備份檔名日期格式固定", () => {
  const date = new Date("2026-06-08T09:05:00");
  assert.equal(formatBackupDate(date), "20260608-0905");
});
