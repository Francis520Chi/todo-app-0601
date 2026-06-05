# CNC Fanuc Monitor

這是一個用來練習連線 Fanuc CNC 控制器的 Python 專案。

## 目前目標

- 連線 Fanuc 0i-MF / 0i-MD 控制器
- 使用 FOCAS Ethernet 測試連線
- 先完成 `test_connect.py`
- 後續再擴充成手機可查看機台狀態的半 MES 系統

## 已知現場資訊

- 電腦 IP：192.168.1.11
- 機台 IP：192.168.1.2
- Fanuc FOCAS Port：8193
- Ping 結果：OK
- 控制器型號：Fanuc 0i-MF
- FOCAS / Ethernet Data Server：已開啟

## 專案檔案

```text
cnc-fanuc-monitor/
├─ README.md
├─ config.py
├─ test_connect.py
└─ requirements.txt
```

## 使用方式

1. 把 Fanuc FOCAS 的 `Fwlib32.dll` 或 `Fwlib64.dll` 放到可被 Python 找到的位置。
2. 確認電腦與機台同網段，且可以 ping 到機台。
3. 執行：

```bash
python test_connect.py
```

## 注意

本專案目前先建立連線測試骨架。若電腦沒有 Fanuc FOCAS DLL，程式會提示缺少 DLL，而不是直接當機。
