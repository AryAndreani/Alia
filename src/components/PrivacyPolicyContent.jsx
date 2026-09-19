import { C } from '../lib/theme'

export const PRIVACY_SECTIONS = [
  {
    title: 'Titolare del trattamento',
    body: (
      <>
        Arianna Andreani, sviluppatrice dell'app Alia<br />
        Email: <a href="mailto:ariannaandreani.hello@outlook.com">ariannaandreani.hello@outlook.com</a><br />
        Sito: <a href="https://aliastudy.vercel.app/" target="_blank" rel="noopener noreferrer">aliastudy.vercel.app</a>
      </>
    ),
  },
  {
    title: 'Quali dati raccogliamo',
    body: (
      <>
        <p>Alia raccoglie solo i dati necessari al funzionamento dell'app:</p>
        <ul>
          <li>
            <strong>Account</strong> — email e password, per creare e accedere al tuo account
            (gestite tramite Firebase Authentication). Se accedi con Google o Apple, riceviamo
            invece nome, email e — solo per Google — immagine del profilo, associati al tuo
            account con quel provider.
          </li>
          <li>
            <strong>Profilo</strong> — nome, università, corso di laurea e anno di
            immatricolazione, se li inserisci.
          </li>
          <li>
            <strong>Percorso di studi</strong> — esami inseriti, CFU, voti e date di
            superamento.
          </li>
          <li>
            <strong>Attività nell'app</strong> — sessioni di studio (durata, esame collegato,
            data), quest e obiettivi settimanali, streak giornaliera.
          </li>
        </ul>
        <p>
          Non raccogliamo dati per finalità pubblicitarie e non utilizziamo strumenti di
          tracciamento o analytics di terze parti.
        </p>
      </>
    ),
  },
  {
    title: 'Come usiamo i tuoi dati',
    body: (
      <>
        <p>
          I dati servono esclusivamente a far funzionare Alia per te: mostrarti il tuo
          "cielo" di esami superati, calcolare le tue statistiche di studio, farti accedere
          da più dispositivi con lo stesso account e farti riprendere da dove avevi lasciato.
        </p>
        <p>
          Non vendiamo né condividiamo i tuoi dati con terze parti per finalità commerciali o
          pubblicitarie.
        </p>
      </>
    ),
  },
  {
    title: 'Dove sono conservati i dati',
    body: (
      <p>
        I dati sono conservati su Firebase (Google Cloud Platform), il servizio che usiamo per
        l'autenticazione e per salvare i tuoi dati (Cloud Firestore). Google, in qualità di
        fornitore del servizio, tratta questi dati secondo i propri termini e le proprie
        misure di sicurezza. Puoi consultare l'informativa privacy di Google su{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          policies.google.com/privacy
        </a>.
      </p>
    ),
  },
  {
    title: 'Accesso con Google e Apple',
    body: (
      <>
        <p>
          Oltre alla registrazione con email e password, puoi accedere ad Alia usando il tuo
          account Google o il tuo Apple ID. In questo caso non vediamo né conserviamo la tua
          password: l'autenticazione avviene direttamente tramite Google o Apple, che
          confermano la tua identità ad Alia in modo sicuro.
        </p>
        <ul>
          <li>
            <strong>Google</strong> — riceviamo solo nome, email e immagine del profilo, se
            disponibile. Non accediamo ad altri dati del tuo account Google (contatti, Drive,
            calendario, ecc.).
          </li>
          <li>
            <strong>Apple</strong> — riceviamo solo nome ed email associati al tuo Apple ID.
            Se scegli "Nascondi la mia email", riceviamo un indirizzo di inoltro privato
            generato da Apple anziché il tuo indirizzo reale, e lo usiamo allo stesso modo per
            il tuo account.
          </li>
        </ul>
        <p>
          Non abbiamo mai accesso alla tua password Google o Apple, e i dati ricevuti vengono
          usati solo per creare e gestire il tuo account Alia.
        </p>
      </>
    ),
  },
  {
    title: 'Per quanto conserviamo i dati',
    body: (
      <p>
        Conserviamo i tuoi dati finché il tuo account resta attivo. Se desideri eliminare il
        tuo account e tutti i dati associati, scrivi a{' '}
        <a href="mailto:ariannaandreani.hello@outlook.com">ariannaandreani.hello@outlook.com</a>:
        provvederemo alla cancellazione entro 30 giorni dalla richiesta.
      </p>
    ),
  },
  {
    title: 'I tuoi diritti',
    body: (
      <p>
        In quanto interessato ai sensi del GDPR, hai diritto di accedere ai tuoi dati,
        chiederne la rettifica o la cancellazione, limitarne il trattamento, richiederne la
        portabilità e opporti al trattamento. Puoi esercitare questi diritti scrivendo a{' '}
        <a href="mailto:ariannaandreani.hello@outlook.com">ariannaandreani.hello@outlook.com</a>.
        Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati
        personali.
      </p>
    ),
  },
  {
    title: 'Cookie',
    body: (
      <p>
        Alia non utilizza cookie di profilazione né strumenti di tracciamento di terze parti.
        Vengono utilizzati esclusivamente meccanismi tecnici necessari al funzionamento
        dell'autenticazione (gestiti da Firebase).
      </p>
    ),
  },
  {
    title: 'Modifiche a questa informativa',
    body: (
      <p>
        Possiamo aggiornare questa informativa nel tempo. In caso di modifiche rilevanti, te
        lo comunicheremo tramite l'app.
      </p>
    ),
  },
]

export const privacyLinkStyle = `
  .pp-body a { color: ${C.accentLight}; text-decoration: underline; text-underline-offset: 2px; }
  .pp-body ul { margin: 0 0 12px; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
  .pp-body p { margin: 0 0 12px; }
  .pp-body p:last-child, .pp-body ul:last-child { margin-bottom: 0; }
`

// Contenuto puro (titolo, intro, sezioni) senza overlay/posizionamento,
// così può essere incorporato sia nella pagina "Informativa" (con tasto
// chiudi) sia nel popup di consenso al primo accesso (con tasto accetta).
export default function PrivacyPolicyContent() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <style>{privacyLinkStyle}</style>

      <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        ✦ Alia
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
        Informativa sulla privacy
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
        Ultimo aggiornamento: 19 settembre 2026
      </div>

      <div style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.7, marginBottom: 36 }}>
        Questa pagina spiega quali dati raccoglie Alia, perché li raccoglie e come vengono
        trattati. I dati che chiediamo servono solo a far funzionare le funzionalità che
        vedi: tenere traccia degli esami, delle sessioni di studio e delle quest.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {PRIVACY_SECTIONS.map(section => (
          <div key={section.title} style={{ paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: C.textMuted, marginBottom: 12,
            }}>
              {section.title}
            </div>
            <div className="pp-body" style={{ fontSize: 14.5, color: C.textSecondary, lineHeight: 1.7 }}>
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
