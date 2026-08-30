STUDENTBNB ITALIA — MULTICITTÀ, DB READY PER DATABASE EUROPEO COMUNE
===================================================================

Questo pacchetto ricostruisce il sito seguendo la Proposta 1:
- header giallo e identità StudentBnB;
- grande mappa illustrata dell’Italia con città e monumenti;
- 14 città presenti sulla mappa, tutte dotate di un’area cliccabile;
- 31 città e poli universitari disponibili nei menu, comprendendo i principali mercati fino alla fascia di circa 20.000 studenti;
- pagina città dinamica con nome, quartieri, filtri e stato degli annunci pertinenti;
- scheda annuncio completa e orientata alla trasparenza commerciale;
- modulo di pubblicazione con scelta della città, costi, spese, deposito, durata e preavviso;
- modulo “Cerco alloggio” con richiesta, budget, periodo e profilo studente;
- menu “Pubblica annuncio gratis” con tre percorsi: “Cerco casa”, “Offro un alloggio” e “Ospitalità solidale”;
- banner di pubblicazione con le tre azioni separate e senza sovrapposizioni grafiche;
- sezione e pagina “Ospitalità solidale” per la convivenza tra persone anziane e studenti;
- campi dedicati a canone agevolato, piccolo aiuto concordato e limite settimanale;
- pagina “Studenti in cerca” consultabile da proprietari e coinquilini;
- profilo della convivenza negli annunci: composizione, atmosfera, lingue, pulizie, ospiti e interessi;
- scelta guidata del quartiere/zona in base alla città selezionata;
- caricamento da 1 a 8 fotografie con anteprima e scelta automatica della copertina;
- preferiti, ricerca, filtri, galleria e annunci demo funzionanti;
- filtri per periodo, zona, università, lingue e ospitalità solidale;
- salvataggio degli avvisi di ricerca sul dispositivo;
- contatti protetti dietro accesso e badge di verifica;
- moduli guidati a passaggi;
- layout responsive per computer, tablet e smartphone.

CITTÀ DISPONIBILI NEI MENU
Padova, Ancona, Bari, Bergamo, Bologna, Cagliari, Caserta, Catania,
Chieti, Cosenza–Rende, Ferrara, Firenze, Genova, Messina, Milano,
Modena, Napoli, Palermo, Parma, Pavia, Perugia, Pescara, Pisa,
Reggio Emilia, Roma, Salerno–Fisciano, Torino, Trento, Trieste,
Venezia e Verona.

COLLEGAMENTI EUROPEI NEL FOOTER
StudentBnB Spagna è collegato al dominio nazionale. Portogallo, Francia,
Polonia e Grecia sono indicati come “prossimamente” fino alla pubblicazione
dei rispettivi siti. Ogni Paese è accompagnato dalla propria bandiera.

COME PUBBLICARLO SU GITHUB PAGES
1. Aprire la repository StudentBnB.
2. Eliminare o sostituire i vecchi file del sito.
3. Caricare il CONTENUTO di questa cartella nella root della repository:
   index.html, padova.html, annuncio.html, pubblica.html, cerco.html,
   studenti.html, intergenerazionale.html, privacy.html,
   404.html e la cartella assets.
4. Fare Commit changes.
5. Attendere 1-3 minuti e aggiornare la pagina con Ctrl+F5.

IMPORTANTE
Il sito è pienamente navigabile e le funzioni della demo operano nel browser.
Gli annunci pubblicati dal modulo vengono salvati nel localStorage e sono
visibili sul medesimo dispositivo. Il frontend italiano è ora allineato alla
versione spagnola DB Ready v2: configurazione nazionale separata, countryCode
IT, cityId stabili, UUID per annunci/richieste e contratto dati comune in
database-contract.json. Le istruzioni di collegamento sono in
SHARED_DATABASE.md. Per la piattaforma reale occorrono ancora API condivisa,
verifica e-mail, moderazione, gestione immagini e informativa privacy definitiva.

PAGINE
- index.html: homepage Proposta 1
- padova.html?city=padova: pagina dinamica per elenco e filtri di ogni città
- annuncio.html?id=PD-AR-2456: scheda dettaglio
- pubblica.html: modulo di pubblicazione
- cerco.html: modulo per pubblicare una richiesta di alloggio e il profilo studente
- studenti.html: elenco filtrabile degli studenti che cercano un alloggio
- intergenerazionale.html: presentazione e accesso all’ospitalità solidale tra generazioni
- privacy.html: note demo, privacy e sicurezza
