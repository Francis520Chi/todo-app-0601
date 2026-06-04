# 我的待辦清單 App

這是我的第一個 Codex 練習專案，使用 HTML、CSS、JavaScript 製作。

這個專案的目標是練習如何用 Codex 建立小型網頁 App，並學習規劃、修改、檢查和使用 Git 保存版本。

## 目前功能
- 新增任務
- 勾選完成任務
- 刪除任務
- 清除全部任務
- 顯示任務數量統計
- 篩選全部、未完成、已完成任務
- 搜尋任務
- 編輯任務文字
- 切換深色模式
- 顯示任務建立日期
- 匯出和匯入任務資料
- 使用 `localStorage` 保存任務資料

## 使用方式
直接用瀏覽器開啟 `index.html`。

目前專案位置：

```text
C:\Users\F\OneDrive\Documents\0601\index.html
```

注意：`localStorage` 的資料會存在目前使用的瀏覽器中。不同瀏覽器之間不會共享同一份待辦事項資料。

## 檔案結構
```text
index.html   網頁結構
styles.css   畫面樣式
script.js    App 互動邏輯
AGENTS.md    個人 Codex 工作規則
README.md    專案說明文件
TESTING.md   手動測試清單
```

## 測試方式
此專案目前使用手動測試。每次修改、commit 或 push 前，可以參考 `TESTING.md` 檢查主要功能是否正常。

## 開發流程紀錄
目前已建立的 Git 版本紀錄：

```text
Initial todo app
Add todo stats
Add todo filters
Add edit todo
Add README
Add todo search
Add dark mode
Add todo created date
Add manual testing checklist
Document testing checklist
Add todo import export
```

## 學到的重點
- 如何用 Codex 建立小型網頁專案
- 如何先規劃，再修改檔案
- 如何在修改後做基本檢查
- 如何使用 Git 保存版本
- 如何使用 `localStorage` 保存前端資料
- 如何把專案整理成可閱讀的結構

## 下一步可以改進
- 改用後端或資料庫保存任務
- 加入任務分類或標籤
- 加入拖曳排序
- 加入自動化測試
