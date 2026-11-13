Add-Type -AssemblyName System.Drawing

function Draw-Flower([System.Drawing.Graphics]$g, [float]$centerX, [float]$centerY, [float]$size) {
    $petalR = $size * 0.4
    $offset = $size * 0.52
    $flowerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 140, 160))
    $centerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 80, 110))
    
    for ($i = 0; $i -lt 5; $i++) {
        $angle = $i * [Math]::PI * 2 / 5 - ([Math]::PI / 2)
        $px = $centerX + [Math]::Cos($angle) * $offset
        $py = $centerY + [Math]::Sin($angle) * $offset
        $g.FillEllipse($flowerBrush, [float]($px - $petalR), [float]($py - $petalR), [float]($petalR * 2), [float]($petalR * 2))
    }
    $centerR = $size * 0.28
    $g.FillEllipse($centerBrush, [float]($centerX - $centerR), [float]($centerY - $centerR), [float]($centerR * 2), [float]($centerR * 2))
    $flowerBrush.Dispose()
    $centerBrush.Dispose()
}

function Render-Page([System.Drawing.Graphics]$g, [float]$pageW, [float]$pageH, [int]$pageIndex, [int]$totalPages, [int]$cols, [int]$rows, [string]$title, [string]$subtitleBase, [bool]$showNumbers, [float]$scale = 1.0) {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Title
    $titleSizePt = 22.0 * $scale
    $titleFont = New-Object System.Drawing.Font("Georgia", $titleSizePt, [System.Drawing.FontStyle]::Regular)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 40, 40))
    $titleMeasure = $g.MeasureString($title, $titleFont)
    $titleX = ($pageW - $titleMeasure.Width) / 2
    $titleY = 48.0 * $scale
    $g.DrawString($title, $titleFont, $titleBrush, [float]$titleX, [float]$titleY)

    # Flower icon
    Draw-Flower $g ($titleX + $titleMeasure.Width + (12 * $scale)) ($titleY + (14 * $scale)) (11 * $scale)

    # Subtitle
    $subSizePt = 11.0 * $scale
    $subFont = New-Object System.Drawing.Font("Segoe Script", $subSizePt, [System.Drawing.FontStyle]::Italic)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 70, 70))
    
    $perPage = $cols * $rows
    $startNum = ($pageIndex - 1) * $perPage + 1
    $endNum = [Math]::Min($pageIndex * $perPage, 500)
    
    if ($totalPages -gt 1) {
        $subText = "$subtitleBase ($startNum - $endNum)"
    } else {
        $subText = $subtitleBase
    }
    
    $subMeasure = $g.MeasureString($subText, $subFont)
    $subX = ($pageW - $subMeasure.Width) / 2
    $subY = $titleY + $titleMeasure.Height + (3 * $scale)
    $g.DrawString($subText, $subFont, $subBrush, [float]$subX, [float]$subY)

    # Grid calculations
    $leftMargin = 45.0 * $scale
    $topGrid = 132.0 * $scale
    $gridW = $pageW - ($leftMargin * 2)
    $bottomGrid = 1115.0 * $scale
    $gridH = $bottomGrid - $topGrid

    $gapX = if ($cols -gt 1) { ($gridW * 0.22) / ($cols - 1) } else { 0 }
    $boxW = ($gridW - ($gapX * ($cols - 1))) / $cols

    $gapY = if ($rows -gt 1) { ($gridH * 0.20) / ($rows - 1) } else { 0 }
    $boxH = ($gridH - ($gapY * ($rows - 1))) / $rows

    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(85, 85, 85), [float](0.8 * $scale))
    $numFont = New-Object System.Drawing.Font("Segoe UI", [float](6.5 * $scale), [System.Drawing.FontStyle]::Regular)
    $numBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 160, 160))

    $count = $startNum

    for ($r = 0; $r -lt $rows; $r++) {
        for ($c = 0; $c -lt $cols; $c++) {
            if ($count -le 500) {
                $x = $leftMargin + $c * ($boxW + $gapX)
                $y = $topGrid + $r * ($boxH + $gapY)
                
                $g.DrawRectangle($pen, [float]$x, [float]$y, [float]$boxW, [float]$boxH)

                if ($showNumbers) {
                    $nStr = "$count"
                    $nMeasure = $g.MeasureString($nStr, $numFont)
                    $nx = $x + ($boxW - $nMeasure.Width) / 2
                    $ny = $y + $boxH - $nMeasure.Height - (1 * $scale)
                    $g.DrawString($nStr, $numFont, $numBrush, [float]$nx, [float]$ny)
                }
            }
            $count++
        }
    }

    # Footer
    $footSizePt = 7.0 * $scale
    $footFont = New-Object System.Drawing.Font("Georgia", $footSizePt, [System.Drawing.FontStyle]::Italic)
    $footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(135, 135, 135))
    $footText = "Venha fazer parte do nosso mundo colorido!"
    $footMeasure = $g.MeasureString($footText, $footFont)
    $footX = $pageW - $leftMargin - $footMeasure.Width
    $footY = 1135.0 * $scale
    Draw-Flower $g ($footX - (10 * $scale)) ($footY + (4 * $scale)) (4.5 * $scale)
    $g.DrawString($footText, $footFont, $footBrush, [float]$footX, [float]$footY)

    # Dispose resources
    $pen.Dispose()
    $numFont.Dispose()
    $numBrush.Dispose()
    $footFont.Dispose()
    $footBrush.Dispose()
    $subFont.Dispose()
    $subBrush.Dispose()
    $titleFont.Dispose()
    $titleBrush.Dispose()
}

function Export-Pdf {
    param(
        [string]$outputPath,
        [int]$totalPages,
        [int]$cols,
        [int]$rows,
        [string]$title = "Marcadores",
        [string]$subtitle = "500 cores",
        [bool]$showNumbers = $false
    )

    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController
    $doc.PrinterSettings.PrinterName = "Microsoft Print to PDF"
    $doc.PrinterSettings.PrintFileName = $outputPath
    $doc.PrinterSettings.PrintToFile = $true
    
    $a4 = $doc.PrinterSettings.PaperSizes | Where-Object { $_.PaperName -eq "A4" } | Select-Object -First 1
    if ($a4) {
        $doc.DefaultPageSettings.PaperSize = $a4
    }

    $script:currentPage = 1

    $doc.add_PrintPage({
        param($sender, $e)
        Render-Page $e.Graphics $e.PageBounds.Width $e.PageBounds.Height $script:currentPage $totalPages $cols $rows $title $subtitle $showNumbers 1.0

        if ($script:currentPage -lt $totalPages) {
            $e.HasMorePages = $true
            $script:currentPage++
        } else {
            $e.HasMorePages = $false
        }
    })

    if (Test-Path $outputPath) {
        Remove-Item $outputPath -Force
    }

    $doc.Print()
    $doc.Dispose()
    Start-Sleep -Milliseconds 800
    Write-Output "Successfully generated: $outputPath"
}

function Export-PngPreview {
    param(
        [string]$outputPath,
        [int]$cols,
        [int]$rows,
        [string]$title = "Marcadores",
        [string]$subtitle = "500 cores",
        [bool]$showNumbers = $false
    )

    $width = 2480
    $height = 3508
    $scale = 2480.0 / 827.0  # ~3.0

    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)

    Render-Page $g $width $height 1 1 $cols $rows $title $subtitle $showNumbers $scale

    if (Test-Path $outputPath) {
        Remove-Item $outputPath -Force
    }
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Successfully generated image: $outputPath"
}

Write-Output "--- Starting Generation of Color Chart Models ---"

# 1. 1 Page Model (500 colors on 1 single sheet: 20x25)
Export-Pdf -outputPath "C:\Users\Jessica\Desktop\color chart\Modello_500_Colori_1_Pagina.pdf" -totalPages 1 -cols 20 -rows 25 -title "Marcadores" -subtitle "500 cores" -showNumbers $false

# 2. 2 Pages Model (250 colors per page: 10x25)
Export-Pdf -outputPath "C:\Users\Jessica\Desktop\color chart\Modello_500_Colori_2_Pagine.pdf" -totalPages 2 -cols 10 -rows 25 -title "Marcadores" -subtitle "500 cores" -showNumbers $false

# 3. 5 Pages Model (100 colors per page: 10x10 - spacious boxes)
Export-Pdf -outputPath "C:\Users\Jessica\Desktop\color chart\Modello_500_Colori_5_Pagine.pdf" -totalPages 5 -cols 10 -rows 10 -title "Marcadores" -subtitle "500 cores" -showNumbers $false

# 4. 5 Pages Model with numbers (1 to 500)
Export-Pdf -outputPath "C:\Users\Jessica\Desktop\color chart\Modello_500_Colori_5_Pagine_Numerato.pdf" -totalPages 5 -cols 10 -rows 10 -title "Marcadores" -subtitle "500 cores" -showNumbers $true

# 5. High-resolution PNG preview of 5-page format (page 1)
Export-PngPreview -outputPath "C:\Users\Jessica\Desktop\color chart\Anteprima_5_Pagine_100_colori.png" -cols 10 -rows 10 -title "Marcadores" -subtitle "500 cores (1 - 100)" -showNumbers $false

Write-Output "--- All files generated successfully! ---"
