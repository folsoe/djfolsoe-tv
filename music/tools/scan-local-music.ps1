param([Parameter(Mandatory=$true)][string]$MusicFolder,[string]$OutputCsv="local-music-library.csv")
$ext=@("*.mp3","*.flac","*.wav","*.m4a","*.aac","*.ogg","*.aiff")
$files=foreach($e in $ext){Get-ChildItem $MusicFolder -Filter $e -File -Recurse -ErrorAction SilentlyContinue}
$rows=$files|ForEach-Object{$a='';$t=$_.BaseName;if($_.BaseName -match '^\s*(.+?)\s+-\s+(.+?)\s*$'){$a=$matches[1];$t=$matches[2]};[PSCustomObject]@{Artist=$a;Title=$t;Album='';Year='';Genre='';BPM='';Key='';Camelot='';ISRC='';'TIDAL ID'='';'TIDAL URL'='';Source='Local Scanner';FilePath=$_.FullName}}
$rows|Export-Csv $OutputCsv -NoTypeInformation -Encoding UTF8
Write-Host "Færdig: $($rows.Count) filer"