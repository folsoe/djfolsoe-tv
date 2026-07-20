# DJ FOLSOE MUSIC SERVER V3 — TIDAL EDITION

## Upload
Upload hele `music`-mappen til roden af dit GitHub-repository.

Sider:
- `https://folsoetv.dk/music/`
- `https://folsoetv.dk/music/admin.html`
- `https://folsoetv.dk/music/playlists.html`

## Migration
1. Eksportér Master CSV fra Spotify-versionen.
2. Importér CSV-filen i V3-admin.
3. Eksportér godkendte showplaner som TuneMyMusic/TIDAL eller Soundiiz/TIDAL CSV.
4. Overfør CSV-filen til TIDAL i TuneMyMusic eller Soundiiz.
5. Behold Spotify-versionen som backup, indtil alle lister er flyttet.

## Hvorfor hybrid
TIDALs offentlige API kan bruges til katalogsøgning og metadata, men direkte oprettelse og redigering af brugerplaylister er ikke dokumenteret som en stabil offentlig erstatning for Spotifys playlist-flow. V3 opfinder derfor ikke et endpoint. TuneMyMusic og Soundiiz bruges som sikker transport til TIDAL.

## TIDAL Developer
Opret en app på TIDAL Developer Dashboard. Client Secret må aldrig lægges i GitHub eller browserkode.
TIDAL bruger OAuth 2.1, og katalogkald kræver et Bearer-token.

## Hjemmeside
Efter eksport af `Website JSON`, upload filen som:
`music/data/music-database.json`

## Lokale filer
Kør:
`powershell -ExecutionPolicy Bypass -File .\music\tools\scan-local-music.ps1 -MusicFolder "D:\Music" -OutputCsv ".\local-music-library.csv"`

## TIDAL-branding
TIDAL-metadata skal vises med tydelig TIDAL-attribution. Brug officielle TIDAL embeds, når en TIDAL-playliste skal afspilles på hjemmesiden.
