# Sobe API (porta 5080), ERP (5090) e loja web em modo dev (5173) em janelas separadas.
# Uso: clique com o botão direito > "Executar com o PowerShell"  (ou: powershell -ExecutionPolicy Bypass -File iniciar.ps1)
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\src\VinoBebidas.Api'; dotnet run"
Start-Sleep -Seconds 8
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\src\VinoBebidas.Erp'; dotnet run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\web'; if (!(Test-Path node_modules)) { npm install }; npm run dev"
Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5090"
