# Ugentlige playlister og værtsmanuskripter

Tre faste Spotify-ID’er er registreret i `assets/data/show-playlists.json`. Afspilleren på forsiden og de tre showsider er Spotifys uændrede iframe. Den indlæses først efter et aktivt klik og fjernes igen ved lukning. Der er ingen Spotify-lyd eller Spotify-afspiller i OBS-koden.

## Søndagsprocessen

ChatGPT-opgaven “Lav ugens shows og speaks” er oprettet til søndag aften omkring kl. 19 Europe/Copenhagen. En oprettet opgave er ikke bevis på en vellykket automatisk kørsel. Browserlogin kan udløbe eller kræve handling; dette skal rapporteres, ikke skjules.

1. Læs dette repository og historikken i `editorial/playlist-history.json`. Match kunstner og sang på tværs af opsamlinger, remasters og alternative mixnavne. Historikken starter med uge 45; tidligere udsendelser er ikke fuldt importeret.
2. Hvis den kommende ISO-uge allerede er forberedt, behold numrene og færdiggør kun manglende manuskripter/historier. Undgå at lave en ny ugeudgave to gange.
3. Lav et nyt udvalg til hvert show, en varighed efter start- og sluttid: Retro søndag 08.00–12.00 (240 minutter), Trance tirsdag 18.30–21.30 (180 minutter), Classic Dance torsdag 19.00–21.00 (120 minutter). Tiderne er bekræftet af brugeren 1. november 2026. Kontrollér ændringer i det aktuelle Twitch-program og planlæg musik, speaks og overlap i samme tidsbudget. Retro bruger almindelige originalversioner; Trance er melodisk/progressive/uplifting; Classic Dance omfatter 1990–2009. Kontrollér udgaver og varigheder.
4. Bevar den foregående uges egne sangvalg i et ugearkiv. Opdatér de SAMME tre Spotify-playlister, og opdatér ugenavn/beskrivelse. Bevar alle andre playlister. De faste embeds følger herefter indholdet uden ændring af HTML.
5. Skriv tre komplette danske værtsmanuskripter efter den faktiske rækkefølge: åbning, korte speaks mellem numrene, timeovergange og afslutning. Kildefakta og originale værtspointer skal holdes adskilt. Kontrollér årstal og anekdoter i primære/autoritative kilder. Opfind ikke citater, sanghistorier eller BPM-tal.
6. Lever manuskripterne som downloadfiler. Udvælg 6–10 korte kildebelagte historier pr. show til datafilen nedenfor. Opdatér historik og egne ugevalg.
7. Upload eller commit ændringer af ugens data gennem en faktisk godkendt adgang. Før første godkendelse af websiteændringen: behold forslagene til gennemgang. Efter aktivering skal levering/deployment verificeres. En JSON-fil, der kun findes lokalt eller i en umerget PR, opdaterer ikke den aktive hjemmeside eller overlays.

## Sanghistorier: dataaftale

`assets/data/weekly-show-notes.json` er eneste offentlige kilde for både hjemmeside og overlays. Den første udgave er med vilje `awaiting-first-edition`, så der ikke vises uverificerede historier. Skift først status til `published`, når historier og kilder er kontrolleret.

```json
{
  "schema": 1,
  "week": "2026-W45",
  "status": "published",
  "publishedAt": "2026-11-01T18:00:00Z",
  "expiresAt": "2026-11-08T18:00:00Z",
  "shows": {"retro": [], "trance": [], "eurodance": []}
}
```

Hvert historieobjekt har `artist`, `title`, `text: [dansk, engelsk, tysk]` og `sources: [https-kilde]`. Alle tre publikumsudgaver skal være højst 240 tegn. `publishedAt` skal være nået, `expiresAt` skal ligge i fremtiden, og udgaven må højst leve 15 dage. Ikke-publicerede, ugyldige og udløbne historier vises ikke. Tekst indsættes som tekst, aldrig som HTML.

Websiden genhenter historiefilen hvert minut, mens den er synlig; overlays hvert femte minut. Der er ingen kobling til det aktuelt spillede nummer. Historierne er et showrelevant ugentligt udvalg i den eksisterende rotation, ikke en påstand om “nu spiller”.

## Overlayfiler

De to leverede JS-filer skal erstatte JavaScript i hver sin eksisterende StreamElements-widget. HTML, CSS, TV-geometri, main-showtitel og eventprioritet er bevaret. Main bruger sin eksisterende social-/hjemmesidecelle. TV bruger den eksisterende hjemmesidekampagnes plads og beskyttelse mod eventoverlap. Playlistereklame, sanghistorie og den tidligere hjemmesidekampagne veksler. QR-koder peger på det rigtige shows playlistsektion.

Upload websiteændringen og kontrollér showsiderne før overlayfilerne tages i brug, så QR-links ikke leder til en manglende playlistsektion. OBS/StreamElements og live events er ikke afprøvet i brugerens miljø.

## Kontrol udført

- JavaScript-syntaks for website og begge komplette overlay-JS-filer.
- Browserkontrol af forsidens DA/EN/DE, tre korrekte Spotify-links, nul Spotify-iframes før klik, én efter åbning og nul efter lukning.
- Retro-showsiden viser kun Retro-playlisten.
- Datavalidering: gyldig udgave, upubliceret udgave, udløb, fremtidig dato, usikker kilde-URL, manglende oversættelse og for lang tekst.
- Første faktiske søndagskørsel, hjemmeside-deployment og levende OBS-events er endnu ikke verificeret.

## Spotify

Officiel dokumentation: https://developer.spotify.com/documentation/embeds
Widgetvilkår: https://developer.spotify.com/documentation/embeds/terms
Ingen musik downloads, cache af lyd, viderestreaming eller ændring af afspillerens indhold. Afspilningsadgang og eventuelle forhåndslytninger afgøres af Spotify. Widgetbrug er omfattet af Spotifys vilkår; ejeren skal gennemgå dem før aktivering. Hjemmesiden oplyser om Spotify og cookies og linker til privatlivspolitikken før indlæsning. Betalingsmur eller særskilt kommercialisering af selve widgetten indgår ikke.

## Første udvalg, uge 45

Brugerbekræftede sendetider (Europe/Copenhagen): Retro søndag 08.00–12.00, Trance tirsdag 18.30–21.30 og Classic Dance torsdag 19.00–21.00. Verificeret rå musiktid i Spotify: Retro 54 numre / 4:01:48; Trance 34 numre / 2:57:42; Classic Dance 29 numre / 1:58:01. Det er musiklængder, ikke færdigmixede udsendelser; værtsspeak og overlap skal indgå i manuskriptets samlede tidsbudget. Fravalgte numre i reservefilen tæller ikke som brugt. Første manuskripter og faktakontrollerede anekdoter er ikke leveret med denne første tekniske integration; søndagsopgaven er oprettet til at færdiggøre dem.
