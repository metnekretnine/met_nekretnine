# Ugovori u MET Nekretnine

Modul je integriran uz postojeći web; stranice nekretnina, upiti, feedovi, navigacija i postojeća preusmjeravanja ostaju zasebni.

## Rute i pristup

Produkcijska adresa je `https://ugovori.metnekretnine.hr` u istom Vercel projektu kao glavni web:

- `/`: pregled ugovora i prijava.
- `/novi`: novi ugovor i PDF pregled.
- `/postavke`: zajednički potpis posrednika.
- `/profil`: osobni Clerk profil, lozinka i sesije.
- `/potpis/<token>`: javni pregled/potpis samo pripadajućeg ugovora, bez Clerk prijave.
- `/api/ugovori/*`: privatni API osim potpisnih endpointa koji provjeravaju token.

Middleware prema hostu interno usmjerava kratke adrese na postojeće datoteke pod `src/app/ugovori`. U lokalnom razvoju i Vercel previewu ostaje prefiks `/ugovori`; za lokalnu provjeru kratkih adresa koristi `http://ugovori.localhost:3000`. Poveznice i Clerk povratak nakon prijave/odjave prate adresu na kojoj je aplikacija otvorena. Produkcijske adrese s prefiksom `/ugovori` vraćaju 404; nema migracije starih poveznica. Stranice nekretnina na poddomeni preusmjeravaju se na glavni web, a njegovi API-ji i Studio nisu dostupni preko poddomene.

Route group `(admin)` ograničava Clerk provider na administraciju. Glavni web i potpisnici ne trebaju Clerk. Middleware ne štiti cijeli web: zadržava postojeće jezike, održavanje, kolačiće i rute, a Clerk uključuje samo za administraciju i njezin API. Svaki privatni API zahtjev provjerava Clerk sesiju na serveru. Svi prijavljeni korisnici konfigurirane Clerk instance imaju jednak pristup ugovorima, bez dodatnog popisa korisničkih ID-jeva.

U Clerk Dashboardu zadrži **Access mode: Invite-only** i račune izrađuj kroz Users. Novi račun ima pristup nakon prijave, bez promjene env postavki ili ponovnog deploya. Aplikacija nema javni obrazac registracije; ograničenje registracije provodi Clerk. [Clerk dokumentacija](https://clerk.com/docs/guides/secure/restricting-access)

Cijela poddomena ima noindex/nofollow/noarchive HTTP zaglavlja, a stranice ugovora i istoimenu metadata zaštitu. API/PDF odgovori ostaju privatni. Poddomena ima vlastiti `robots.txt` s `Disallow: /` i nema sitemap. Potpisne stranice nemaju javno zaglavlje, footer, analitiku niti privatne podatke u metapodacima. Nema ugovora u sitemap-u ili javnoj navigaciji. Robots pravila glavnog weba ostaju uključena, a ugovori su isključeni. Noindex nije zamjena za autentifikaciju.

## Konfiguracija

`.env.local` sadrži kopirane Clerk i email postavke za potpise. Sanity i zajednički Resend ključ MET weba nisu prepisani.

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: odgovarajuća Clerk instanca.
- `EPOTPIS_BASE_URL=https://ugovori.metnekretnine.hr`: origin, bez putanje. Novi linkovi za potpis dodaju `/potpis/<token>`. Za lokalni origin bez poddomene dodaje se `/ugovori/potpis/<token>`.
- `EPOTPIS_EMAIL_FROM`, `EPOTPIS_RECIPIENT_EMAIL`: pošiljatelj i agencijski primatelj završnog PDF-a.
- `EPOTPIS_RESEND_API_KEY`: zaseban ključ za potpise, da kontaktne forme nastave koristiti svoj postojeći `RESEND_API_KEY`. Ako nije postavljen, koristi se zajednički ključ.

Emailovi se uvijek šalju putem Resenda, i lokalno i u produkciji: poziv pri slanju ugovora te završni PDF nakon potpisa. Potrebni su Resend ključ, pošiljatelj i agencijski primatelj. Stare arhivirane preview poruke ostaju neposlane.

Za testiranje s mobitela pokreni `pnpm dev` i na uređaju u istoj lokalnoj mreži otvori `http://<IP-računala>:3000/ugovori` (Network adresa u Next.js terminalu). U developmentu su automatski dopušteni localhost, privatne i link-local IPv4/IPv6 adrese te `.local` nazivi, uz podudaranje Origin i Host adrese/porta. Prijava za administraciju ostaje obavezna; produkcija prihvaća samo konfigurirani `EPOTPIS_BASE_URL`. Email linkovi i dalje koriste `EPOTPIS_BASE_URL`; za lokalno otvaranje već izrađenog ugovora koristi isti `/ugovori/potpis/<token>` na lokalnoj adresi.

Nove ugovore pohranjuje postojeći MET Sanity projekt/dataset preko njegovog serverskog write tokena, pod prefiksom `epotpis`. Testni ugovori i potpis posrednika iz drugog Sanity projekta nisu migrirani. U novoj instalaciji potrebno je jednom spremiti potpis posrednika kroz Postavke. NDJSON import nije potreban.

Lokalne env promjene ne mijenjaju Vercel. Za objavu:

1. U istom Vercel projektu dodaj `ugovori.metnekretnine.hr` kao Production domenu, bez redirecta na glavni web, i provjeri **Valid Configuration**.
2. U Vercel Production varijablama postavi `EPOTPIS_BASE_URL=https://ugovori.metnekretnine.hr`. `NEXT_PUBLIC_BASE_URL_PROD` ostaje `https://metnekretnine.hr`; postojeće Resend i Sanity postavke ostaju za svoje namjene.
3. Objavi novi build. DNS i env sami ne uključuju usmjeravanje poddomene bez ovih promjena koda.
4. Provjeri Clerk prijavu/odjavu i slanje jednog ugovora; email link treba početi s `https://ugovori.metnekretnine.hr/potpis/`.

Postojeća Clerk Development instanca i njezini ključevi ostaju prema korisnikovoj odluci. Pri kasnijem prelasku na Clerk Production s primarnom domenom `metnekretnine.hr`, poddomena ne zahtijeva drugu aplikaciju ni Satellite. Ako uključiš ograničenje Allowed subdomains, dopusti `ugovori.metnekretnine.hr`. Ako ručno postavljaš Clerk Dashboard Paths, application home i sign-in su `https://ugovori.metnekretnine.hr/`; aplikacija svoje putanje već zadaje u ClerkProvideru. [Clerk: subdomains](https://clerk.com/docs/guides/dashboard/dns-domains/subdomain-allowlist)

Resend domena mora biti verificirana za adresu navedenu u `EPOTPIS_EMAIL_FROM`.

## Dizajn i održavanje

Koristi se postojeći `LogoCompany`, Geist i globalni MET tokeni boja. Funkcionalni raspored potpisa ostaje u CSS-u s prefiksom `ep-` u `src/app/ugovori/ugovori.css`; ne dodaje globalne stilove koji mijenjaju stranice stanova. Gumbi prate zaobljeni oblik postojećeg dizajna.

UI i email tekstovi su u `src/lib/epotpis/texts.ts`. PDF-ovi i raspored polja u `resources/epotpis/templates/`, fontovi u `resources/epotpis/fonts/`. `scripts/epotpis-extract-templates.py` priprema promijenjene predloške, `epotpis-verify-pdfs.py` provjerava generirane rezultate. PDF.js preglednik i worker koriste `legacy` build iste instalirane verzije radi podrške starijem Safariju. Worker se kopira tijekom postinstall koraka; URL uključuje verziju radi osvježavanja predmemorije. Nakon promjene workera lokalno pokrenuti `pnpm run postinstall`.

Studio dodaje samo `ePotpisRecord` i rubriku Spremljeni ugovori. Oglasima, Media, Maps, Table i Presentation pluginima ništa nije uklonjeno. Ugovori i PDF-ovi su privatni zapisi, ne javni file assets. Preuzimanje u Studiju koristi spremljeni PDF, bez ovisnosti o ugovori frontendu.

Sanity live konfiguracija koristi postojeći `SANITY_API_READ_TOKEN` za `serverToken` i `browserToken`. Ako se koristi komponenta SanityLive, browser token može se proslijediti u Draft Modeu za live preview; isti token može čitati i privatne ugovore u ovom datasetu.

Next config zadržava postojeća preusmjeravanja, slike i serverActions postavke. Dodani su samo PDF server dependencies/tracing, privatna zaglavlja i izolirani izlaz za provjere. `tsconfig.build.json` provjerava aplikacijski kod bez zastarjelih testnih fixturea koji su već imali greške prije prijenosa. React je ažuriran unutar 19.1 serije na 19.1.9 radi podrške instaliranoj Clerk verziji. PDF.js zahtijeva moderni Node; projekt postavlja Node 24+.

## Provjere

```sh
pnpm install
pnpm exec playwright install chromium webkit
pnpm exec tsc --noEmit -p tsconfig.build.json
pnpm exec jest src/lib/epotpis src/components/EPotpisSessionSync src/sanity/components --runInBand
pnpm ugovori:test
EPOTPIS_BUILD_DIR=.next-validation pnpm build
pnpm exec playwright test --config playwright.epotpis-production.config.ts
```

`ugovori:test` koristi lokalni mock na portu 3002 i zaseban build. Testni Node preload presreće Resend zahtjeve i šalje ih lokalnom mocku, uz lažni API ključ; provjeravaju se primatelji, privitci i ponavljanje neuspjelog slanja. Produkcijski test pokreće build na portu 3003, s isključenim Clerk ključevima i zapisivanjem ugovora, te provjerava javni web, SEO, preusmjeravanja, zabranu stare lozinke/kolačića i javno potpisivanje s presretnutim API odgovorima. Ne šalje emailove niti zapisuje u pravi Sanity. `EPOTPIS_AUTH_TEST_MODE`, `EPOTPIS_SANITY_TEST_URL` i `EPOTPIS_BUILD_DIR` nisu Vercel postavke.

Nakon objave ručno proći stvarnu Clerk prijavu i dostavu emaila na poddomeni. Kod je pripremljen lokalno; nema deploymenta ni promjena udaljenih Sanity podataka.
