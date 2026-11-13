$port = 8080
$folder = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")
try {
    $listener.Start()
} catch {
    # If wildcard fails without admin, fallback to localhost + local IP
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
Write-Host "  🎨 DECOTIME COLOR TRACKER - SERVER LOCALE AVVIATO!      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 SUL TUO TELEFONO ANDROID (connesso allo stesso Wi-Fi):" -ForegroundColor Yellow
Write-Host "   Apri Chrome e vai su: http://$($localIp):$port" -ForegroundColor White -BackgroundColor DarkRed
Write-Host ""
Write-Host "💻 SUL TUO COMPUTER:" -ForegroundColor Yellow
Write-Host "   Apri il browser su: http://localhost:$port" -ForegroundColor White
Write-Host ""
Write-Host "👉 Sul telefono tocca i 3 puntini ⋮ e scegli 'Installa App'!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Premi CTRL+C per arrestare il server quando hai finito."
Write-Host ""

# Open in browser on PC automatically
Start-Process "http://localhost:$port"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($urlPath)) {
        $urlPath = "index.html"
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
