# Collegamento al database comune Italia–Spagna

Il frontend italiano usa lo stesso contratto dati della versione spagnola DB Ready v2.

## Identità del frontend

- dominio: `casastudent.it`
- `countryCode`: `IT`
- locale: `it-IT`
- valuta: `EUR`
- pagina città: `padova.html?city={slug}`
- API comune prevista: `/api/v1`

## Stato del pacchetto

La modalità predefinita resta `demo`, quindi il sito può essere aperto e verificato senza backend. I record creati nel browser includono già:

- UUID per annunci e richieste;
- `countryCode: "IT"`;
- `cityId` stabile, per esempio `city_it_padova`;
- `citySlug` indipendente dal dominio;
- campi compatibili con `database-contract.json`.

## Attivazione del backend comune

1. Pubblicare l’API condivisa sugli endpoint descritti in `database-contract.json`.
2. Impostare `apiMode` su `api` in `assets/js/config.js`.
3. Impostare `apiBase` sull’origine HTTPS dell’API, oppure mantenere `/api/v1` se il dominio usa un reverse proxy.
4. Collegare verifica e-mail/registrazione, moderazione e archivio immagini nel backend.
5. Disattivare il fallback `localStorage` dopo il collaudo delle operazioni CRUD.

Il database deve restare unico, mentre ogni query e record deve essere filtrato per `countryCode` e `cityId`.

## Perimetro attivo

Il backend comune è predisposto per Italia, Spagna, Francia, Germania e Polonia. Il Portogallo resta registrato solo come mercato inattivo e non deve essere esposto nelle API pubbliche, nei selettori o nei collegamenti tra siti. Non viene usato un dominio `.eu`.
