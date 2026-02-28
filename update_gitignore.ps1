Get-ChildItem -Recurse -Filter ".gitignore" | ForEach-Object { 
    Add-Content -Path $_.FullName -Value "`n# FORCE TRACK EVERYTHING requested by user`n!node_modules/`n!.env`n!.env.local`n!.env.development.local`n!.env.test.local`n!.env.production.local" 
}