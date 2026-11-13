$port = 8080
$folder = $PSScriptRoot
$inventoryFile = Join-Path $folder "inventory.json"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")
try {
    $listener.Start()
} catch {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://+:$port/")
    try {
        $listener.Start()
    } catch {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
    }
}

$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🎨 DECOTIME COLOR TRACKER - SERVER LOCALE & SYNC        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 SUL TUO TELEFONO / TABLET (stesso Wi-Fi):" -ForegroundColor Yellow
Write-Host "   Apri il browser o l'app: http://$localIp`:$port" -ForegroundColor White -BackgroundColor DarkRed
Write-Host ""
Write-Host "💻 SUL TUO COMPUTER:" -ForegroundColor Yellow
Write-Host "   Apri il browser su: http://localhost:$port" -ForegroundColor White
Write-Host ""
Write-Host "🔄 SINCRONIZZAZIONE AUTOMATICA:" -ForegroundColor Cyan
Write-Host "   Tutte le modifiche fatte su Telefono, Tablet o PC" -ForegroundColor White
Write-Host "   verranno salvate e condivise istantaneamente in Wi-Fi!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Premi CTRL+C per arrestare il server quando hai finito."
Write-Host ""

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept")

    if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }

    $urlPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($urlPath)) {
        $urlPath = "index.html"
    }

    if ($urlPath -eq "api/inventory") {
        if ($request.HttpMethod -eq "GET") {
            if (Test-Path $inventoryFile) {
                $bytes = [System.IO.File]::ReadAllBytes($inventoryFile)
            } else {
                $timeNow = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                $emptyObj = @{ inventory = @{}; lastUpdated = $timeNow }
                $bytes = [System.Text.Encoding]::UTF8.GetBytes(($emptyObj | ConvertTo-Json -Compress))
            }
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }
        elseif ($request.HttpMethod -eq "POST") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()

                if (-not [string]::IsNullOrWhiteSpace($body)) {
                    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
                    [System.IO.File]::WriteAllText($inventoryFile, $body, $utf8NoBom)
                    $logTime = Get-Date -Format "HH:mm:ss"
                    Write-Host "[SYNC $logTime] Dati sincronizzati ricevuti con successo!" -ForegroundColor Green
                }

                $timeNow = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                $replyObj = @{ success = $true; timestamp = $timeNow }
                $replyBytes = [System.Text.Encoding]::UTF8.GetBytes(($replyObj | ConvertTo-Json -Compress))
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $replyBytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($replyBytes, 0, $replyBytes.Length)
            } catch {
                $errObj = @{ success = $false; error = $_.Exception.Message }
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes(($errObj | ConvertTo-Json -Compress))
                $response.StatusCode = 500
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }
    }

    $filePath = Join-Path $folder $urlPath

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            ".png"  { "image/png" }
            ".svg"  { "image/svg+xml" }
            ".apk"  { "application/vnd.android.package-archive" }
            Default { "application/octet-stream" }
        }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $contentType
        $response.ContentLength64 = $bytes.Length
        $response.StatusCode = 200
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found")
        $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
    }
    $response.Close()
}
