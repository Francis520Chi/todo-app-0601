"""CNC Fanuc Monitor configuration."""

# 現場網路設定
PC_IP = "192.168.1.11"
MACHINE_IP = "192.168.1.2"
FOCAS_PORT = 8193
TIMEOUT_SECONDS = 10

# 控制器資訊
CONTROLLER_MODEL = "Fanuc 0i-MF"

# FOCAS DLL 名稱
# 64 位元 Python 通常使用 Fwlib64.dll
# 32 位元 Python 通常使用 Fwlib32.dll
FOCAS_DLL_CANDIDATES = [
    "Fwlib64.dll",
    "Fwlib32.dll",
]
