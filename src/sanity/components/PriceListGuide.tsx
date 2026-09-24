import type { CSSProperties, ReactNode } from "react";

// Studio-only help view for the "Cjenik" section.
// Button names match the (English) Sanity Studio interface.

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 760,
    padding: "2rem 1.5rem 4rem",
    fontSize: 15,
    lineHeight: 1.6,
  },
  lead: { fontSize: 16, opacity: 0.85 },
  section: { marginTop: "2.25rem" },
  list: { paddingLeft: "1.25rem", margin: "0.5rem 0 0" },
  item: { marginBottom: "0.4rem" },
  example: {
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    borderLeft: "3px solid currentColor",
    opacity: 0.8,
    fontSize: 14,
  },
  note: {
    marginTop: "2.5rem",
    padding: "1rem 1.25rem",
    border: "1px solid currentColor",
    borderRadius: 6,
    opacity: 0.75,
    fontSize: 14,
  },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.section}>
      <h2 style={{ fontSize: 18, margin: "0 0 0.5rem" }}>{title}</h2>
      {children}
    </section>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol style={styles.list}>{children}</ol>;
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul style={styles.list}>{children}</ul>;
}

function Item({ children }: { children: ReactNode }) {
  return <li style={styles.item}>{children}</li>;
}

function Example({ children }: { children: ReactNode }) {
  return <div style={styles.example}>{children}</div>;
}

const b = (text: string) => <strong>{text}</strong>;

export function PriceListGuide() {
  return (
    <article style={styles.page}>
      <h1 style={{ fontSize: 24, margin: "0 0 0.75rem" }}>
        Upute za korištenje
      </h1>
      <p style={styles.lead}>
        Od 1. 10. 2026. uz svaku cijenu usluge mora stajati i njezina sidrena
        cijena, a cjenik mora biti javno dostupan kao CSV datoteka. Web to radi
        automatski iz podataka koje ovdje unesete i objavite. Tablica se
        prikazuje u {b("Stranica Opći uvjeti")}, na mjestu bloka{" "}
        {b("Cjenik usluga")} u sadržaju stranice (odjeljak 5).
      </p>

      <Section title="Prvo postavljanje (radi se jednom)">
        <Steps>
          <Item>
            Otvorite {b("Podaci o objektu i prikaz")}. U {b("Podaci o objektu")}{" "}
            upišite vrstu objekta (npr. „Agencija za nekretnine”), adresu i
            oznaku objekta. Ako imate jednu lokaciju, oznaka može biti „U-01”.
            Kliknite {b("Publish")}.
            <Example>
              Zašto: propis traži da naziv CSV datoteke sadrži vrstu, adresu i
              oznaku objekta, npr.{" "}
              <code>
                agencija-za-nekretnine_savska-cesta-32-10000-zagreb_U-01_0001_20261001_0900.csv
              </code>
              . Bez tih podataka CSV se ne može izraditi. Ostale grupe
              (tekstovi tablice i poveznica, prethodne verzije) određuju izgled
              cjenika na webu; već su popunjene i ne morate ih mijenjati.
            </Example>
          </Item>
          <Item>
            Otvorite {b("Novi cjenik")}. Za svaku uslugu koju naplaćujete
            potrošačima kliknite {b("Add item")} i ispunite:
            <Bullets>
              <Item>
                {b("Aktualna cijena")}: današnja cijena, npr. „100 % ugovorene
                mjesečne najamnine”, i po potrebi najviši iznos naknade, npr.
                „najviše 100 %”.
              </Item>
              <Item>
                {b("Usluga")}: naziv, obveznik plaćanja (npr. „Nalogodavac -
                najmodavac”) i, po potrebi, napomenu.
              </Item>
              <Item>
                {b("Sidrena cijena")}: redovna cijena na dan 10. 9. 2026., bez
                popusta. Ako se od tada nije mijenjala, upišite istu cijenu.
                Datum ostavite 10. 9. 2026.
              </Item>
            </Bullets>
          </Item>
          <Item>
            Kliknite {b("Objavi novi cjenik")}. Cjenik se pojavljuje na webu, a
            u {b("Povijest cjenika")} nastaje prva verzija.
          </Item>
        </Steps>
        <p style={{ margin: "0.75rem 0 0", fontSize: 14, opacity: 0.8 }}>
          Posrednici (agencije, platforme) navode samo vlastite usluge, npr.
          svoju proviziju, a ne cijene proizvoda ili usluga koje oglašavaju za
          druge.
        </p>
      </Section>

      <Section title="Svaka izmjena cjenika (uvijek ista tri koraka)">
        <Steps>
          <Item>
            Otvorite {b("Novi cjenik")} i kliknite {b("Kreiraj novi cjenik")}{" "}
            (dolje desno). Nastaje kopija aktualnog cjenika koju možete
            uređivati. Aktualni cjenik se ne mijenja dok ne objavite novi.
          </Item>
          <Item>Napravite izmjene opisane u nastavku.</Item>
          <Item>
            Kliknite {b("Objavi novi cjenik")}. Ako odustanete, kliknite{" "}
            {b("Odbaci novi cjenik")} u izborniku s tri točkice (⋯) desno od tog gumba i
            ništa se ne mijenja.
          </Item>
        </Steps>
        <p style={{ margin: "0.75rem 0 0", fontSize: 14, opacity: 0.8 }}>
          Ako se polja ne mogu uređivati ili je gumb {b("Objavi novi cjenik")}{" "}
          onemogućen, gore desno je vjerojatno odabran prikaz{" "}
          {b("Published")}. Kliknite ga i odaberite {b("Drafts")}.
        </p>
      </Section>

      <Section title="Promjena cijene">
        <Bullets>
          <Item>
            Kliknite na uslugu i promijenite samo {b("Aktualna cijena")}.
          </Item>
          <Item>
            Sidrenu cijenu ne dirajte: ona ostaje ista i kad aktualna cijena
            poraste ili padne.
          </Item>
        </Bullets>
        <Example>
          Primjer: otvoreno posredovanje 10. 9. 2026. iznosilo je 100 %
          ugovorene mjesečne najamnine, a od studenog 90 %. Aktualna cijena: 90
          %. Sidrena cijena: 100 %, 10. 9. 2026.
        </Example>
      </Section>

      <Section title="Akcija ili sniženje">
        <Bullets>
          <Item>
            U usluzi upišite sniženu cijenu u {b("Aktualna cijena")}, uključite{" "}
            {b("Poseban oblik prodaje")} i upišite naziv, npr. „Jesenska akcija”.
          </Item>
          <Item>
            Kad akcija završi, u novom cjeniku vratite redovnu cijenu i
            isključite {b("Poseban oblik prodaje")}.
          </Item>
        </Bullets>
        <p style={{ margin: "0.75rem 0 0", fontSize: 14, opacity: 0.8 }}>
          Kod akcija provjerite i zasebno pravilo o isticanju najniže cijene u
          prethodnih 30 dana.
        </p>
      </Section>

      <Section title="Nova usluga">
        <Bullets>
          <Item>
            Kliknite {b("Add item")} i upišite naziv, obveznika plaćanja i
            aktualnu cijenu.
          </Item>
          <Item>
            Kao {b("Sidrena cijena")} upišite istu cijenu, a kao datum dan kad
            ste uslugu prvi put ponudili.
          </Item>
        </Bullets>
        <Example>
          Primjer: nova usluga od 2. 11. 2026. za 150,00 EUR. Sidrena cijena:
          150,00 EUR, 2. 11. 2026. Ta sidrena cijena ostaje i ako kasnije
          podignete cijenu.
        </Example>
        <p style={{ margin: "0.75rem 0 0", fontSize: 14, opacity: 0.8 }}>
          Preimenovanje postojeće usluge ili izmjena napomene ne čini je novom.
          Ako je to i dalje ista usluga, sidrena cijena i datum ostaju isti.
        </p>
      </Section>

      <Section title="Uklanjanje usluge">
        <Bullets>
          <Item>
            Otvorite izbornik (tri točke) uz uslugu i odaberite {b("Remove")}.
          </Item>
        </Bullets>
        <p style={{ margin: "0.75rem 0 0", fontSize: 14, opacity: 0.8 }}>
          Usluga nestaje s weba, ali ostaje u prethodnoj verziji cjenika.
        </p>
      </Section>

      <Section title="Što se događa nakon objave">
        <Bullets>
          <Item>
            Opći uvjeti prikazuju nove cijene, uz sidrenu cijenu i njezin datum
            u istoj tablici.
          </Item>
          <Item>
            Poveznica za preuzimanje i adresa <code>/cjenik/aktualni.csv</code> daju
            novu CSV datoteku s propisanim nazivom.
          </Item>
          <Item>
            Dotadašnji cjenik prelazi u {b("Povijest cjenika")}, dobiva datum
            do kojeg je vrijedio i ostaje javno dostupan na webu.
          </Item>
        </Bullets>
      </Section>

      <Section title="Povijest cjenika">
        <Bullets>
          <Item>Verzije se stvaraju same i ne mogu se mijenjati.</Item>
          <Item>
            Verziju možete obrisati gumbom {b("Delete")} (dolje desno) tek 30
            dana nakon što je zamijenjena, odnosno od datuma „Vrijedi do”.
            Do tada je gumb onemogućen. Aktualna verzija ne može se obrisati.
          </Item>
          <Item>Nije ih potrebno brisati; mogu ostati trajno.</Item>
        </Bullets>
      </Section>

      <Section title="Provjera prije i nakon objave">
        <Bullets>
          <Item>
            Novi cjenik javan je tek nakon {b("Objavi novi cjenik")}. Dotad web
            prikazuje dosadašnji.
          </Item>
          <Item>
            Upišite barem hrvatski tekst; engleski je potreban samo ako web ima
            englesku verziju.
          </Item>
          <Item>
            Ako cijenu ističete i drugdje (letak, društvene mreže, oglas u
            prostoru), i tamo uz nju mora stajati sidrena cijena s datumom.
          </Item>
          <Item>
            Sačuvajte dokaz o cijenama na dan 10. 9. 2026. (stari cjenik,
            račun, ponuda ili snimka weba).
          </Item>
        </Bullets>
      </Section>

      <p style={styles.note}>
        Upute su okvirne i ne zamjenjuju pravni savjet. Temelje se na odlukama
        NN 101/2026-1212 i 101/2026-1213 te pojašnjenju Ministarstva
        gospodarstva. Za nejasne slučajeve obratite se svojoj komori ili
        savjetniku.
      </p>
    </article>
  );
}
