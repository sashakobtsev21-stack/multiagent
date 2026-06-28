' Запускает refresh-dashboard.bat СКРЫТО (без вспышки консоли) — для частого таймера Планировщика.
' Пересобирает status.json + dashboard.html. Точка входа задачи "guidebooks-dashboard".
dir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
CreateObject("WScript.Shell").Run """" & dir & "refresh-dashboard.bat" & """", 0, False
