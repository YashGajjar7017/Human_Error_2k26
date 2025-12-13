Set objShell = CreateObject("WScript.Shell")

' Start Backend server
objShell.Run "cmd /c cd Backend && npm start", 0, False

' Start Frontend server
objShell.Run "cmd /c cd Frontend && npm start", 0, False

WScript.Quit
