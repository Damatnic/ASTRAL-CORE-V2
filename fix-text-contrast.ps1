# Script to fix text contrast issues across the codebase

Write-Host "Fixing text contrast issues for better readability..." -ForegroundColor Cyan

$replacements = @{
    # Light gray text to darker shades for better contrast
    'text-gray-200' = 'text-gray-600'
    'text-gray-300' = 'text-gray-600'
    'text-gray-400' = 'text-gray-600'
    'text-gray-500' = 'text-gray-700'
    
    # For dark mode, ensure light colors are bright enough
    'dark:text-gray-300' = 'dark:text-gray-100'
    'dark:text-gray-400' = 'dark:text-gray-200'
    'dark:text-gray-500' = 'dark:text-gray-300'
    
    # Text on glass components needs high contrast
    'text-white/70' = 'text-gray-900'
    'text-white/80' = 'text-gray-900'
    'text-white/90' = 'text-gray-900'
    
    # Placeholder text
    'placeholder:text-gray-400' = 'placeholder:text-gray-600'
    'placeholder-gray-400' = 'placeholder-gray-600'
}

# Files to process
$files = Get-ChildItem -Path "apps/web/src" -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" -File

$totalFiles = $files.Count
$updatedFiles = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($oldValue in $replacements.Keys) {
        $newValue = $replacements[$oldValue]
        $content = $content -replace [regex]::Escape($oldValue), $newValue
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles++
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Contrast fix complete!" -ForegroundColor Green
Write-Host "Files updated: $updatedFiles / $totalFiles" -ForegroundColor Yellow