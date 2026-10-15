# Sobe API (porta 5080), ERP (5090) e loja web em modo dev (5173) em janelas separadas.
# Uso: clique com o botão direito > "Executar com o PowerShell"  (ou: powershell -ExecutionPolicy Bypass -File iniciar.ps1)
# Pode rodar de novo a qualquer momento: ele encerra a API e o ERP que estiverem abertos e sobe a versão atual do código.
# A saída de cada janela também fica gravada na pasta logs\ (api.log, erp.log).
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$logs = Join-Path $raiz "logs"
New-Item -ItemType Directory -Force $logs | Out-Null
Remove-Item "$logs\api.log", "$logs\erp.log" -ErrorAction SilentlyContinue

Write-Host "Encerrando API/ERP em execucao (se houver)..."
Get-Process VinoBebidas.Api, VinoBebidas.Erp -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Subindo a API (a primeira vez baixa os pacotes e compila; pode levar alguns minutos)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\src\VinoBebidas.Api'; dotnet run 2>&1 | Tee-Object -FilePath '$logs\api.log'"

# Espera a API responder (ate 5 minutos) antes de abrir o resto
$pronta = $false
foreach ($i in 1..150) {
    Start-Sleep -Seconds 2
    try {
        $saude = Invoke-RestMethod "http://localhost:5080/api/saude" -TimeoutSec 2
        $pronta = $true
        Write-Host "API no ar. Banco: $($saude.banco)"
        break
    } catch { }
}
if (-not $pronta) { Write-Host "A API nao respondeu. Veja o erro na janela da API ou em logs\api.log." -ForegroundColor Yellow }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\src\VinoBebidas.Erp'; dotnet run 2>&1 | Tee-Object -FilePath '$logs\erp.log'"

# A loja web so e iniciada se ainda nao houver nada na porta 5173
$lojaAberta = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $lojaAberta) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$raiz\web'; if (!(Test-Path node_modules)) { npm install }; npm run dev"
}
Start-Sleep -Seconds 10
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5090"
