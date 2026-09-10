# Ugovori u MET Nekretnine

Modul je integriran uz postojeći web; stranice nekretnina, upiti, feedovi, navigacija i postojeća preusmjeravanja ostaju zasebni.

## Rute i pristup

- `/ugovori`: pregled ugovora i prijava.
- `/ugovori/novi`: novi ugovor i PDF pregled.
- `/ugovori/postavke`: zajednički potpis posrednika.
- `/ugovori/profil`: osobni Clerk profil, lozinka i sesije.
- `/ugovori/potpis/<token>`: javni pregled/potpis samo pripadajućeg ugovora, bez Clerk prijave.
- `/api/ugovori/*`: privatni API osim potpisnih endpointa koji provjeravaju token.

Route group `(admin)` ograničava Clerk provider na administraciju. Glavni web i potpisnici ne trebaju Clerk. Middleware ne štiti cijeli web: zadržava postojeće jezike, održavanje, kolačiće i rute, a Clerk uključuje samo za administraciju i njezin API. Svaki privatni API zahtjev provjerava Clerk sesiju na serveru. Svi prijavljeni korisnici konfigurirane Clerk instance imaju jednak pristup ugovorima, bez dodatnog popisa korisničkih ID-jeva.

U Clerk Dashboardu zadrži **Access mode: Invite-only** i račune izrađuj kroz Users. Novi račun ima pristup nakon prijave, bez promjene env postavki ili ponovnog deploya. Aplikacija nema javni obrazac registracije; ograničenje registracije provodi Clerk. [Clerk dokumentacija](https://clerk.com/docs/guides/secure/restricting-access)

Cijeli `/ugovori` ima noindex/nofollow/noarchive metadata i HTTP zaglavlja, kao i API/PDF odgovori. Potpisne stranice nemaju javno zaglavlje, footer, analitiku niti privatne podatke u metapodacima. Nema ugovora u sitemap-u ili javnoj navigaciji. Robots pravila glavnog weba ostaju uključena, a ugovori su isključeni. Noindex nije zamjena za autentifikaciju.

## Konfiguracija

`.env.local` sadrži kopirane Clerk i email postavke za potpise. Sanity i zajednički Resend ključ MET weba nisu prepisani.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: odgovarajuća Clerk instanca.
- `EPOTPIS_BASE_URL=https://metnekretnine.hr`: origin, bez putanje. Linkovi sami dodaju `/ugovori/potpis/<token>`.
- `EPOTPIS_EMAIL_FROM`, `EPOTPIS_RECIPIENT_EMAIL`: pošiljatelj i agencijski primatelj završnog PDF-a.
- `EPOTPIS_RESEND_API_KEY`: zaseban ključ za potpise, da kontaktne forme nastave koristiti svoj postojeći `RESEND_API_KEY`. Ako nije postavljen, koristi se zajednički ključ.

Emailovi se uvijek šalju putem Resenda, i lokalno i u produkciji: poziv pri slanju ugovora te završni PDF nakon potpisa. Potrebni su Resend ključ, pošiljatelj i agencijski primatelj. Stare arhivirane preview poruke ostaju neposlane.

Za testiranje s mobitela pokreni `pnpm dev` i na uređaju u istoj lokalnoj mreži otvori `http://<IP-računala>:3000/ugovori` (Network adresa u Next.js terminalu). U developmentu su automatski dopušteni localhost, privatne i link-local IPv4/IPv6 adrese te `.local` nazivi, uz podudaranje Origin i Host adrese/porta. Prijava za administraciju ostaje obavezna; produkcija prihvaća samo konfigurirani `EPOTPIS_BASE_URL`. Email linkovi i dalje koriste `EPOTPIS_BASE_URL`; za lokalno otvaranje već izrađenog ugovora koristi isti `/ugovori/potpis/<token>` na lokalnoj adresi.

Nove ugovore pohranjuje postojeći MET Sanity projekt/dataset preko njegovog serverskog write tokena, pod prefiksom `epotpis`. Testni ugovori i potpis posrednika iz drugog Sanity projekta nisu migrirani. U novoj instalaciji potrebno je jednom spremiti potpis posrednika kroz Postavke. NDJSON import nije potreban.

Lokalne env promjene ne mijenjaju Vercel. Pri objavi treba prenijeti ove postavke u Vercel. Produkcijsko puštanje traži produkcijsku Clerk instancu za `metnekretnine.hr`, njezine ključeve i korisničke račune kreirane u toj instanci. Ne stavljati /ugovori u Clerk polje za domenu.

Konačni pošiljatelj na metnekretnine.hr ovisi o dovršenoj Resend DNS verifikaciji. Nije potrebno čekati subdomenu za ovaj raspored ruta. Kasniji prelazak na ugovori.metnekretnine.hr zasebna je promjena domene i linkova.

## Dizajn i održavanje

Koristi se postojeći `LogoCompany`, Geist i globalni MET tokeni boja. Funkcionalni raspored potpisa ostaje u CSS-u s prefiksom `ep-` u `src/app/ugovori/ugovori.css`; ne dodaje globalne stilove koji mijenjaju stranice stanova. Gumbi prate zaobljeni oblik postojećeg dizajna.

UI i email tekstovi su u `src/lib/epotpis/texts.ts`. PDF-ovi i raspored polja u `resources/epotpis/templates/`, fontovi u `resources/epotpis/fonts/`. `scripts/epotpis-extract-templates.py` priprema promijenjene predloške, `epotpis-verify-pdfs.py` provjerava generirane rezultate. PDF.js worker kopira se tijekom postinstall koraka i verzija odgovara instaliranoj biblioteci.

Studio dodaje samo `ePotpisRecord` i rubriku Spremljeni ugovori. Oglasima, Media, Maps, Table i Presentation pluginima ništa nije uklonjeno. Ugovori i PDF-ovi su privatni zapisi, ne javni file assets. Preuzimanje u Studiju koristi spremljeni PDF, bez ovisnosti o ugovori frontendu.

Sanity live konfiguracija koristi postojeći `SANITY_API_READ_TOKEN` za `serverToken` i `browserToken`. Browser token prosljeđuje se u Draft Modeu za live preview; isti token može čitati i privatne ugovore u ovom datasetu.

Next config zadržava postojeća preusmjeravanja, slike i serverActions postavke. Dodani su samo PDF server dependencies/tracing, privatna zaglavlja i izolirani izlaz za provjere. `tsconfig.build.json` provjerava aplikacijski kod bez zastarjelih testnih fixturea koji su već imali greške prije prijenosa. React je ažuriran unutar 19.1 serije na 19.1.9 radi podrške instaliranoj Clerk verziji. PDF.js zahtijeva moderni Node; projekt postavlja Node 24+.

## Provjere

```sh
pnpm install
pnpm exec playwright install chromium
pnpm exec tsc --noEmit -p tsconfig.build.json
pnpm exec jest src/lib/epotpis src/components/EPotpisSessionSync src/sanity/components --runInBand
pnpm ugovori:test
EPOTPIS_BUILD_DIR=.next-validation pnpm build
pnpm exec playwright test --config playwright.epotpis-production.config.ts
```

`ugovori:test` koristi lokalni mock na portu 3002 i zaseban build. Testni Node preload presreće Resend zahtjeve i šalje ih lokalnom mocku, uz lažni API ključ; provjeravaju se primatelji, privitci i ponavljanje neuspjelog slanja. Produkcijski test pokreće build na portu 3003, s isključenim Clerk ključevima i zapisivanjem ugovora, te provjerava javni web, SEO, preusmjeravanja, zabranu stare lozinke/kolačića i javno potpisivanje s presretnutim API odgovorima. Ne šalje emailove niti zapisuje u pravi Sanity. `EPOTPIS_AUTH_TEST_MODE`, `EPOTPIS_SANITY_TEST_URL` i `EPOTPIS_BUILD_DIR` nisu Vercel postavke.

Prije objave ručno proći stvarnu Clerk prijavu i dostavu emaila nakon DNS verifikacije. Kod je pripremljen lokalno; nema deploymenta ni promjena udaljenih Sanity podataka.
