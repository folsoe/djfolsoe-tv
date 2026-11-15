(() => {
  'use strict';

  const panel = document.getElementById('djf-christmas');
  if (!panel) return;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const dayMs = 86400000;
  const start = Date.UTC(2026, 10, 29);
  const eve = Date.UTC(2026, 11, 24);

  const labels = {
    da: {
      title: 'Nissekaos hos DJ FOLSOE', chapter: n => n === 5 ? 'Juleaften' : `${n}. advent`,
      days: n => n === 1 ? 'dag til juleaften' : 'dage til juleaften',
      greeting: 'Glædelig jul!', next: 'Næste nissehistorie',
      position: n => `Historie ${n} af 4`,
    },
    en: {
      title: 'Elf chaos at DJ FOLSOE', chapter: n => n === 5 ? 'Christmas Eve' : `Advent · week ${n}`,
      days: n => n === 1 ? 'day until Christmas Eve' : 'days until Christmas Eve',
      greeting: 'Merry Christmas!', next: 'Next elf story',
      position: n => `Story ${n} of 4`,
    },
    de: {
      title: 'Wichtelchaos bei DJ FOLSOE', chapter: n => n === 5 ? 'Heiligabend' : `${n}. Advent`,
      days: n => n === 1 ? 'Tag bis Heiligabend' : 'Tage bis Heiligabend',
      greeting: 'Frohe Weihnachten!', next: 'Nächste Wichtelgeschichte',
      position: n => `Geschichte ${n} von 4`,
    },
  };

  // The opening and closing lines use the same story order as the V4 studio TV and ticker.
  const stories = {
    da: [
      [
        ['Strømmen gik', 'PRØV MED ET SPARK', 'Neonen tænder. Nissen kalder det en teknisk genstart.', 'Nissens førstehjælp til neon består af én støvle.'],
        ['Nissen tog fejl af stikket', 'DET VAR MIXEREN', 'Neonen lyser. Mixeren er til gengæld gået i juleferie.', 'Nissen leder efter mixerens stik. Prøv bag pebernødderne.'],
        ['Alt lys på én kontakt', 'NU KAN NABOEN SE DET', 'Skiltet tænder. Også kælderen og tre haver i Sindal.', 'Nissen har lovet at slukke igen. Naboen har fundet solbrillerne.'],
        ['Et tal med løse forbindelser', 'RØR IKKE LEDNINGEN', 'Tallet holder op med at blinke, da nissen slipper ledningen.', 'Nissen er udnævnt til elektriker. Prøvetiden varer til jul.']
      ],
      [
        ['Kælken er på vej', 'HVOR ER BREMSEN?', 'Nissen fandt bremsen. Den lå tilbage ved start.', 'Kælken er parkeret. Lodret. I en gavebunke.'],
        ['Nissen kører efter GPS', 'DREJ TIL HØJRE NU', 'GPS’en sagde højre. Kælken stemte imod.', 'GPS’en genberegner ruten fra gavepapiret.'],
        ['Kælk med fartpilot', 'DEN STÅR PÅ MAKS', 'Nissen satte farten ned ved at lande først.', 'Fartpiloten er solgt. Kælken følger med, hvis vi finder den.'],
        ['En sidste prøvetur', 'PAS PÅ PAKKERNE', 'Pakkerne tog imod. Nissen siger tak fra bunden af bunken.', 'Afhentning af gavepakker foregår nu med skovl.']
      ],
      [
        ['Nissen pakker mixeren ind', 'DEN VAR TÆNDT', 'Diskokuglen tænder, mens nissen leder efter enden på tapen.', 'Mixeren er stadig i gavepapir. Det næste mix holdes sammen med tape.'],
        ['Den forkerte gave åbner', 'DET ER EN DISKOKUGLE', 'Nissen ville have sokker. Hele dansegulvet jubler.', 'Sokkerne blev byttet til en spejlkugle. Nissen danser barfodet.'],
        ['Pakkedans ved pulten', 'HVEM GAV DEN BAS?', 'Én pakke ryster i takt. Nissen skruer op.', 'Pakken må først åbnes, når bassen er færdig med sit nummer.'],
        ['Nissen har byttet mærkerne', 'TIL DANSEGULVET', 'Gaven til julemanden er nu diskokugle til hele festen.', 'Julemanden får lov at låne diskokuglen efter sidste nummer.']
      ],
      [
        ['Nisserne tager kontrolrummet', 'JULEALARM', 'Nissen har fundet alarmknappen. Nu leder han efter sluk.', 'Regien svarer først igen, når alarmknappen er pakket ind.'],
        ['Nissen sætter en plade på', 'DET ER B-SIDEN', 'Pladen drejer. Nissen kalder det en eksklusiv version.', 'B-siden bliver på. A-siden er til afhøring hos julemanden.'],
        ['Nissen holder vagt', 'INGEN ADGANG UDEN RISALAMANDE', 'Nissen passer pulten. Den anden passer desserten.', 'Kontrolrummet kan åbnes med en skål risalamande. Ske medbringes.'],
        ['Nissen finder den røde knap', 'DET VAR IKKE KØLYSET', 'Hele regien lyser rødt. Pladen spiller videre.', 'Nissen har fået en ny knap. Den er af chokolade.']
      ],
      [
        ['Nissernes sidste nummer', 'GLÆDELIG JUL', 'Fyrværkeriet går i gang. Nissen afleverer pulten.', 'Pulten er retur. Nissen tog kun den sidste pebernød.'],
        ['Juleaften på dansegulvet', 'GLÆDELIG JUL', 'Nisserne tænder finalen og bliver til sidste beat.', 'Tak for dansen. Nisserne tager hjem i samme tempo.'],
        ['Den sidste julepakke', 'GLÆDELIG JUL', 'Pakken er åbnet. Hele skærmen springer i farver.', 'Pakken var til jer. Nisserne beholder gavepapiret til næste år.'],
        ['Farvel fra kontrolrummet', 'GLÆDELIG JUL', 'Nissen giver håndtaget et sidste ryk. Så kommer finalen.', 'Nisserne er gået hjem. Håndtaget er stadig lidt løst.']
      ]
    ],
    en: [
      [
        ['The power is out', 'GIVE IT A KICK', 'The neon lights up. The elf calls it a technical reset.', 'The elf’s neon repair kit consists of one boot.'],
        ['The elf pulled the wrong plug', 'THAT WAS THE MIXER', 'The neon is on. The mixer has taken Christmas off.', 'The elf is looking for the mixer plug. Try behind the cookies.'],
        ['One switch for every light', 'THE NEIGHBOURS CAN SEE IT', 'The sign lights up. So do the cellar and three gardens.', 'The elf promises to turn it off. The neighbours found their sunglasses.'],
        ['The number has a loose wire', 'DON’T TOUCH THE WIRE', 'The number stops blinking when the elf lets go.', 'The elf is now an electrician. Probation ends at Christmas.']
      ],
      [
        ['The sleigh is coming', 'WHERE ARE THE BRAKES?', 'The elf found the brakes. Back at the starting line.', 'The sleigh is parked. Upright. In a pile of presents.'],
        ['The elf follows the satnav', 'TURN RIGHT NOW', 'The satnav said right. The sleigh disagreed.', 'The satnav is recalculating from inside the wrapping paper.'],
        ['Sleigh with cruise control', 'IT’S SET TO MAX', 'The elf slowed down by landing first.', 'The cruise control is sold. The sleigh comes with it if we find it.'],
        ['One last test run', 'MIND THE PRESENTS', 'The presents caught the elf, who says thanks from the bottom.', 'Presents can now be collected with a shovel.']
      ],
      [
        ['The elf wraps the mixer', 'IT WAS STILL ON', 'The disco ball lights up while the elf looks for the end of the tape.', 'The mixer is still wrapped. The next mix is held together by tape.'],
        ['The wrong present opens', 'IT’S A DISCO BALL', 'The elf wanted socks. The dance floor cheers anyway.', 'The socks became a disco ball. The elf is dancing barefoot.'],
        ['Dancing gifts at the decks', 'WHO ADDED THE BASS?', 'One parcel shakes in time. The elf turns it up.', 'Open the parcel after the bass has finished its track.'],
        ['The elf swapped the labels', 'FOR THE DANCE FLOOR', 'Santa’s present is now a disco ball for the whole party.', 'Santa can borrow the disco ball after the last track.']
      ],
      [
        ['Elves take the control room', 'CHRISTMAS ALERT', 'The elf found the alarm switch. Now for the off switch.', 'The control room will respond once someone wraps the alarm switch.'],
        ['The elf puts on a record', 'THAT’S THE B-SIDE', 'The record spins. The elf calls it an exclusive version.', 'The B-side stays. Santa is questioning the A-side.'],
        ['The elf stands guard', 'RICE PUDDING REQUIRED', 'One elf guards the decks. The other guards dessert.', 'A bowl of rice pudding opens the control room. Bring a spoon.'],
        ['The elf finds the red button', 'THAT WASN’T CUE', 'The whole control room turns red. The record keeps playing.', 'The elf has a new button. It’s made of chocolate.']
      ],
      [
        ['The elves’ final track', 'MERRY CHRISTMAS', 'The fireworks start. The elf hands back the decks.', 'The decks are back. The elf only took the last cookie.'],
        ['Christmas Eve on the dance floor', 'MERRY CHRISTMAS', 'The elves light up the finale and stay for the last beat.', 'Thanks for dancing. The elves are heading home at the same tempo.'],
        ['The last Christmas present', 'MERRY CHRISTMAS', 'The present opens. The whole screen bursts into colour.', 'The present was for you. The elves are saving the paper for next year.'],
        ['Goodbye from the control room', 'MERRY CHRISTMAS', 'The elf pulls the lever one last time. Cue the finale.', 'The elves have gone home. The lever is still a little loose.']
      ]
    ],
    de: [
      [
        ['Der Strom ist weg', 'EIN TRITT SOLL HELFEN', 'Das Neon leuchtet. Der Wichtel nennt es einen Neustart.', 'Das Werkzeug des Wichtels besteht aus einem Stiefel.'],
        ['Der falsche Stecker', 'DAS WAR DAS MISCHPULT', 'Das Neon leuchtet. Das Mischpult macht Weihnachtsurlaub.', 'Der Wichtel sucht den Stecker. Vielleicht hinter den Keksen.'],
        ['Ein Schalter für alles', 'DIE NACHBARN SEHEN ES', 'Das Schild leuchtet. Der Keller und drei Gärten auch.', 'Der Wichtel will bald ausschalten. Die Nachbarn haben Sonnenbrillen.'],
        ['Die Zahl hat einen Wackler', 'KABEL NICHT ANFASSEN', 'Die Zahl blinkt nicht mehr, sobald der Wichtel loslässt.', 'Der Wichtel ist jetzt Elektriker. Probezeit bis Weihnachten.']
      ],
      [
        ['Der Schlitten kommt', 'WO IST DIE BREMSE?', 'Die Bremse liegt noch am Start.', 'Der Schlitten parkt senkrecht in einem Geschenkeberg.'],
        ['Der Wichtel fährt nach Navi', 'JETZT RECHTS ABBIEGEN', 'Das Navi sagte rechts. Der Schlitten war anderer Meinung.', 'Das Navi berechnet die Route aus dem Geschenkpapier neu.'],
        ['Schlitten mit Tempomat', 'AUF VOLLE FAHRT', 'Der Wichtel bremst, indem er zuerst landet.', 'Der Tempomat ist verkauft. Der Schlitten kommt dazu, falls wir ihn finden.'],
        ['Eine letzte Probefahrt', 'VORSICHT, GESCHENKE', 'Die Pakete fangen den Wichtel auf. Er bedankt sich von ganz unten.', 'Geschenke können ab sofort mit der Schaufel abgeholt werden.']
      ],
      [
        ['Das Mischpult wird verpackt', 'ES WAR NOCH AN', 'Die Discokugel leuchtet, während der Wichtel das Klebeband sucht.', 'Das Mischpult bleibt verpackt. Der nächste Mix hält mit Klebeband.'],
        ['Das falsche Geschenk geht auf', 'ES IST EINE DISCOKUGEL', 'Der Wichtel wollte Socken. Die Tanzfläche jubelt trotzdem.', 'Socken gegen Discokugel getauscht. Der Wichtel tanzt barfuß.'],
        ['Pakettanz am Mischpult', 'WER HAT BASS EINGEPACKT?', 'Ein Paket wackelt im Takt. Der Wichtel dreht auf.', 'Das Paket erst öffnen, wenn der Bass mit seinem Track fertig ist.'],
        ['Die Schilder sind vertauscht', 'FÜR DIE TANZFLÄCHE', 'Das Geschenk für den Weihnachtsmann wird zur Discokugel für alle.', 'Der Weihnachtsmann darf die Kugel nach dem letzten Track ausleihen.']
      ],
      [
        ['Wichtel übernehmen die Regie', 'WEIHNACHTSALARM', 'Der Wichtel hat den Alarm gefunden. Jetzt sucht er den Ausschalter.', 'Die Regie meldet sich wieder, wenn der Alarmknopf eingepackt ist.'],
        ['Der Wichtel legt eine Platte auf', 'DAS IST DIE B-SEITE', 'Die Platte dreht sich. Der Wichtel nennt es eine exklusive Version.', 'Die B-Seite bleibt. Der Weihnachtsmann befragt die A-Seite.'],
        ['Der Wichtel hält Wache', 'ZUTRITT NUR MIT MILCHREIS', 'Ein Wichtel bewacht das Pult. Der andere den Nachtisch.', 'Eine Schale Milchreis öffnet die Regie. Löffel mitbringen.'],
        ['Der rote Knopf', 'DAS WAR NICHT CUE', 'Die ganze Regie wird rot. Die Platte läuft weiter.', 'Der Wichtel hat einen neuen Knopf. Er ist aus Schokolade.']
      ],
      [
        ['Der letzte Track der Wichtel', 'FROHE WEIHNACHTEN', 'Das Feuerwerk beginnt. Der Wichtel gibt das Pult zurück.', 'Das Pult ist zurück. Der letzte Keks ist weg.'],
        ['Heiligabend auf der Tanzfläche', 'FROHE WEIHNACHTEN', 'Die Wichtel starten das Finale und bleiben bis zum letzten Beat.', 'Danke fürs Tanzen. Die Wichtel gehen im selben Tempo nach Hause.'],
        ['Das letzte Weihnachtsgeschenk', 'FROHE WEIHNACHTEN', 'Das Paket geht auf. Der ganze Bildschirm wird bunt.', 'Das Geschenk war für euch. Die Wichtel heben das Papier auf.'],
        ['Abschied aus der Regie', 'FROHE WEIHNACHTEN', 'Der Wichtel zieht ein letztes Mal am Hebel. Das Finale beginnt.', 'Die Wichtel sind zu Hause. Der Hebel ist immer noch etwas locker.']
      ]
    ]
  };

  const fields = Object.fromEntries(
    Array.from(panel.querySelectorAll('[data-jul-field]'), field => [field.dataset.julField, field])
  );
  const button = panel.querySelector('button');
  let activeDay;
  let selected = 0;

  function calendar(now) {
    const parts = Object.fromEntries(formatter.formatToParts(now).map(({type, value}) => [type, Number(value)]));
    const date = Date.UTC(parts.year, parts.month - 1, parts.day);
    if (date < start || date > eve) return null;
    const days = (eve - date) / dayMs;
    const chapter = days === 0 ? 4 : Math.floor((date - start) / dayMs / 7);
    return { date, days, chapter, offset: Math.floor((date - start) / dayMs) };
  }

  function render() {
    const today = calendar(new Date());
    if (!today) {
      panel.hidden = true;
      return;
    }
    if (activeDay !== today.date) {
      activeDay = today.date;
      selected = today.offset % 4;
    }
    const requested = document.documentElement.lang.toLowerCase().split('-')[0];
    const lang = Object.hasOwn(labels, requested) ? requested : 'da';
    const copy = labels[lang];
    const [story, , opening, punchline] = stories[lang][today.chapter][selected];
    panel.dataset.chapter = String(today.chapter);
    fields.title.textContent = copy.title;
    fields.chapter.textContent = copy.chapter(today.chapter + 1);
    fields.number.textContent = today.days ? String(today.days) : '';
    fields.countdown.textContent = today.days ? copy.days(today.days) : copy.greeting;
    fields.story.textContent = story;
    fields.opening.textContent = opening;
    fields.punchline.textContent = punchline;
    fields.position.textContent = copy.position(selected + 1);
    button.textContent = copy.next;
    panel.hidden = false;
  }

  button.addEventListener('click', () => {
    selected = (selected + 1) % 4;
    render();
  });
  window.addEventListener('djf:languagechange', render);
  window.addEventListener('pageshow', render);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) render();
  });
  setInterval(render, 1000 * 30);
  render();
})();
