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

function Render-Page-50-Style([System.Drawing.Graphics]$g, [float]$pageW, [float]$pageH, [int]$pageIndex, [string]$style = "compartment", [float]$scale = 1.0) {
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Header
    $title = "Alcool e Acqua Marker"
    $titleSizePt = 21.0 * $scale
    $titleFont = New-Object System.Drawing.Font("Georgia", $titleSizePt, [System.Drawing.FontStyle]::Regular)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 40, 40))
    $titleMeasure = $g.MeasureString($title, $titleFont)
    
    $flowerSize = 11.0 * $scale
    $totalHeaderWidth = $titleMeasure.Width + (14 * $scale) + ($flowerSize * 2)
    $titleX = ($pageW - $totalHeaderWidth) / 2
    $titleY = 46.0 * $scale
    $g.DrawString($title, $titleFont, $titleBrush, [float]$titleX, [float]$titleY)

    Draw-Flower $g ($titleX + $titleMeasure.Width + (12 * $scale)) ($titleY + (14 * $scale)) $flowerSize

    $startNum = ($pageIndex - 1) * 50 + 1
    $endNum = $pageIndex * 50
    $subText = "500 colori ($startNum - $endNum) - Pagina $pageIndex di 10"
    
    $subSizePt = 10.5 * $scale
    $subFont = New-Object System.Drawing.Font("Segoe Script", $subSizePt, [System.Drawing.FontStyle]::Italic)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 70, 70))
    $subMeasure = $g.MeasureString($subText, $subFont)
    $subX = ($pageW - $subMeasure.Width) / 2
    $subY = $titleY + $titleMeasure.Height + (2 * $scale)
    $g.DrawString($subText, $subFont, $subBrush, [float]$subX, [float]$subY)

    # Grid: 5 cols x 10 rows (50 boxes)
    $cols = 5
    $rows = 10
    $leftMargin = 42.0 * $scale
    $topGrid = 130.0 * $scale
    $gridW = $pageW - ($leftMargin * 2)
    $bottomGrid = 1118.0 * $scale
    $gridH = $bottomGrid - $topGrid

    $boxW = 132.0 * $scale
    $gapX = ($gridW - ($cols * $boxW)) / ($cols - 1)

    $boxH = 84.0 * $scale
    $gapY = ($gridH - ($rows * $boxH)) / ($rows - 1)

    $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 80, 80), [float](0.85 * $scale))
    $dividerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(155, 155, 155), [float](0.65 * $scale))
    $dotPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(195, 195, 195), [float](0.55 * $scale))
    $dotPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dot

    $labelFont = New-Object System.Drawing.Font("Segoe UI", [float](5.8 * $scale), [System.Drawing.FontStyle]::Regular)
    $labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 170, 170))

    $swatchH = $boxH * 0.60
    $nameH = $boxH - $swatchH

    $count = $startNum

    for ($r = 0; $r -lt $rows; $r++) {
        for ($c = 0; $c -lt $cols; $c++) {
            if ($count -le 500) {
                $x = $leftMargin + $c * ($boxW + $gapX)
                $y = $topGrid + $r * ($boxH + $gapY)

                # Outer Box
                $g.DrawRectangle($outerPen, [float]$x, [float]$y, [float]$boxW, [float]$boxH)

                if ($style -eq "compartment") {
                    # Clean horizontal divider line
                    $divY = $y + $swatchH
                    $g.DrawLine($dividerPen, [float]$x, [float]$divY, [float]($x + $boxW), [float]$divY)
                }
                elseif ($style -eq "guided") {
                    # Divider + light guide line and number
                    $divY = $y + $swatchH
                    $g.DrawLine($dividerPen, [float]$x, [float]$divY, [float]($x + $boxW), [float]$divY)
                    
                    $guideY = $divY + ($nameH * 0.72)
                    $g.DrawLine($dotPen, [float]($x + 5 * $scale), [float]$guideY, [float]($x + $boxW - 5 * $scale), [float]$guideY)

                    $promptText = "#$count"
                    $g.DrawString($promptText, $labelFont, $labelBrush, [float]($x + 4 * $scale), [float]($divY + 3 * $scale))
                }
                # if "open", no internal lines, just the big open box
            }
            $count++
        }
    }

    # Footer
    $footSizePt = 7.0 * $scale
    $footFont = New-Object System.Drawing.Font("Georgia", $footSizePt, [System.Drawing.FontStyle]::Italic)
    $footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(135, 135, 135))
    $footText = "Il mio mondo a colori!"
    $footMeasure = $g.MeasureString($footText, $footFont)
    $footX = $pageW - $leftMargin - $footMeasure.Width
    $footY = 1135.0 * $scale
    Draw-Flower $g ($footX - (10 * $scale)) ($footY + (4 * $scale)) (4.5 * $scale)
    $g.DrawString($footText, $footFont, $footBrush, [float]$footX, [float]$footY)

    # Dispose
    $outerPen.Dispose()
    $dividerPen.Dispose()
    $dotPen.Dispose()
    $labelFont.Dispose()
    $labelBrush.Dispose()
    $footFont.Dispose()
    $footBrush.Dispose()
    $subFont.Dispose()
    $subBrush.Dispose()
    $titleFont.Dispose()
    $titleBrush.Dispose()
}

function Build-10Page-Pdf([string]$outputPath, [string]$style) {
    $doc = New-Object System.Drawing.Printing.PrintDocument
    $doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController
    $doc.PrinterSettings.PrinterName = "Microsoft Print to PDF"
    $doc.PrinterSettings.PrintFileName = $outputPath
    $doc.PrinterSettings.PrintToFile = $true

    $a4 = $doc.PrinterSettings.PaperSizes | Where-Object { $_.PaperName -eq "A4" } | Select-Object -First 1
    if ($a4) { $doc.DefaultPageSettings.PaperSize = $a4 }

    $script:pNum = 1
    $doc.add_PrintPage({
        param($sender, $e)
        Render-Page-50-Style $e.Graphics $e.PageBounds.Width $e.PageBounds.Height $script:pNum $style 1.0

        if ($script:pNum -lt 10) {
            $e.HasMorePages = $true
            $script:pNum++
        } else {
            $e.HasMorePages = $false
        }
    })

    if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
    $doc.Print()
    $doc.Dispose()
    Start-Sleep -Milliseconds 600
    Write-Output "Successfully created: $outputPath"
}

Write-Output "Generating 10-page PDFs with extra-large boxes..."

# 1. Compartment version (Clean divider line for color + name) - RECOMMENDED
Build-10Page-Pdf "C:\Users\Jessica\Desktop\color chart\Alcool_e_Acqua_Marker_500_Riquadri_Grandi_con_Scomparto.pdf" "compartment"

# 2. Guided version (Divider + subtle #number and writing line)
Build-10Page-Pdf "C:\Users\Jessica\Desktop\color chart\Alcool_e_Acqua_Marker_500_Riquadri_Grandi_con_Guida.pdf" "guided"

# 3. Open version (Completely open large boxes, 3.4cm x 2.1cm)
Build-10Page-Pdf "C:\Users\Jessica\Desktop\color chart\Alcool_e_Acqua_Marker_500_Riquadri_Grandi_Aperti.pdf" "open"

# Save high-res preview of the recommended compartment version
$width = 2480
$height = 3508
$scale = 2480.0 / 827.0

for ($p = 1; $p -le 10; $p++) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    Render-Page-50-Style $g $width $height $p "compartment" $scale
    $start = ($p - 1) * 50 + 1
    $end = $p * 50
    $prevOut = "C:\Users\Jessica\Desktop\color chart\Riquadri_Grandi_Pagina_${p}_(${start}-${end}).png"
    if (Test-Path $prevOut) { Remove-Item $prevOut -Force }
    $bmp.Save($prevOut, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Saved image: $prevOut"
}

Copy-Item "C:\Users\Jessica\Desktop\color chart\Riquadri_Grandi_Pagina_1_(1-50).png" "C:\Users\Jessica\Desktop\color chart\Anteprima_Riquadri_Grandi_Nomi.png" -Force

Write-Output "All 10-page PDFs and PNGs generated successfully!"
