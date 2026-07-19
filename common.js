# DJ FOLSOE MUSIC SERVER V2

V2 er en additiv Music Director-platform. Den ændrer ikke de låste V1701 broadcastdele.

## Moduler

- **Spotify Sync:** login med PKCE, egne playlister, Liked Songs, Top Tracks og Recently Played.
- **Music Database:** IndexedDB, deduplikering, søgning, CSV-import og website-JSON.
- **Internet Research:** adapterbaserede kilder med separat cache og fejlstatus.
- **Show Pools:** Morning, Retro, Eurodance, Trance og Fredagsbar.
- **Music Director:** showregler, rotationskarantæne, højst to tracks pr. artist og Spotify-publicering.
- **Local Music Scanner:** PowerShell-script til at lave en import-CSV fra lokale lydmapper.

## Researcharkitektur

GitHub Actions kører ugentligt og kan startes manuelt. Hver kilde opdateres uafhængigt. Hvis en kilde fejler, bruges seneste cache, og resten fortsætter.

Stabile feedkilder er prioriteret. HTML-baserede hitlister er sekundære, fordi layoutændringer kan få en adapter til at gå i stale-status.

## Start lokalt

```bash
cd music
npm ci
npm run research:all
python -m http.server 5500 --bind 127.0.0.1
```

Åbn `http://127.0.0.1:5500/admin.html`.

## Lokale musikfiler

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\scan-local-music.ps1 -MusicFolder "D:\Music" -OutputCsv ".\local-music-library.csv"
```

Importer derefter CSV-filen i admin under Spotify Sync → Alternativ filimport.

## Datafiler

```text
data/research/manifest.json
data/research/current-all.json
data/research/apple-dk.json
data/research/apple-gb.json
data/research/hitlisten.json
data/research/official-uk.json
data/research/pools/morning.json
data/research/pools/retro.json
data/research/pools/eurodance.json
data/research/pools/trance.json
data/research/pools/fredagsbar.json
```

## Begrænsninger

- Spotify tillader kun direkte læsning af playlist-items, når du ejer playlisten eller er collaborator.
- BPM, key og energi bør analyseres fra den konkrete lokale lydfil i Serato.
- HTML-baserede hitlister kan ændre struktur. V2 viser kildefejlen og beholder cache i stedet for at stoppe hele systemet.
