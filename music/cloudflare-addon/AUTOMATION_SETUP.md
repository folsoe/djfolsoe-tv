# DJ FOLSOE Music Research Worker V1801

## Formål
Denne Worker er et additivt research-modul. Den ændrer ikke V1701 eller dine eksisterende broadcast-ruter.

## Manuel research
Deploy Worker-filen og sæt Research API i admin til Worker-adressen efterfulgt af `/api/music/research`.

## Ugentlig automatisk Spotify-playliste
Opret disse secrets i Cloudflare:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

Tilføj en Cron Trigger, eksempelvis mandag kl. 06:00 UTC. Workeren henter Hitlisten, matcher numrene i Spotify og opretter en privat Good Morning-playliste.

## Vigtigt
- Hitlisten- og Shazam-parserne afhænger af deres offentlige HTML og kan kræve justering, hvis siderne ændrer struktur.
- Brug adminens preview og godkendelse som den primære arbejdsform.
- Spotify-numre tilføjes i batches på højst 100 via `/playlists/{id}/items`.
