import React from 'react';
import ReactDOM from 'react-dom/client';

const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.36981C18.883 3.65381 17.344 3.14381 15.712 2.87181C15.526 3.17681 15.362 3.52681 15.226 3.89981C13.526 3.63781 11.841 3.63781 10.155 3.89981C10.019 3.52681 9.855 3.17681 9.669 2.87181C8.037 3.14381 6.498 3.65381 5.064 4.36981C1.562 9.13681 1.223 13.7318 4.086 17.9738C5.539 19.3418 7.29 20.2808 9.135 20.8848C9.333 20.6008 9.513 20.2988 9.676 19.9788C8.991 19.7498 8.331 19.4678 7.701 19.1168C7.744 19.0888 7.788 19.0618 7.831 19.0328C10.45 20.4878 13.401 20.4878 15.932 19.0328C15.975 19.0618 16.019 19.0888 16.062 19.1168C15.432 19.4678 14.772 19.7498 14.087 19.9788C14.25 20.2988 14.43 20.6008 14.628 20.8848C16.473 20.2808 18.224 19.3418 19.677 17.9738C22.585 13.5188 22.373 8.90081 20.317 4.36981ZM14.931 15.0298C14.015 15.0298 13.232 14.3098 13.232 13.4328C13.232 12.5558 14.001 11.8348 14.931 11.8348C15.861 11.8348 16.643 12.5558 16.628 13.4328C16.628 14.3098 15.861 15.0298 14.931 15.0298ZM9.431 15.0298C8.515 15.0298 7.732 14.3098 7.732 13.4328C7.732 12.5558 8.501 11.8348 9.431 11.8348C10.361 11.8348 11.143 12.5558 11.128 13.4328C11.128 14.3098 10.361 15.0298 9.431 15.0298Z" />
  </svg>
);

const GithubIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12C0 17.303 3.438 21.8 8.207 23.387C8.807 23.504 9.023 23.127 9.023 22.804C9.023 22.512 9.012 21.61 9.007 20.43C5.672 21.168 4.973 18.822 4.973 18.822C4.423 17.434 3.633 17.062 3.633 17.062C2.533 16.312 3.717 16.324 3.717 16.324C4.922 16.412 5.553 17.584 5.553 17.584C6.623 19.467 8.482 18.913 9.072 18.643C9.182 17.839 9.503 17.315 9.843 17.023C7.172 16.72 4.382 15.683 4.382 11.145C4.382 9.845 4.852 8.775 5.572 7.955C5.442 7.653 5.072 6.555 5.692 4.935C5.692 4.935 6.712 4.605 9.022 6.205C10.002 5.935 11.022 5.805 12.022 5.805C13.022 5.805 14.042 5.935 15.022 6.205C17.332 4.605 18.352 4.935 18.352 4.935C18.972 6.555 18.602 7.653 18.472 7.955C19.192 8.775 19.662 9.845 19.662 11.145C19.662 15.693 16.862 16.719 14.192 17.013C14.592 17.353 14.992 18.003 14.992 19.003C14.992 20.463 14.982 21.633 14.982 21.933C14.982 22.253 15.192 22.623 15.802 22.503C20.562 21.793 24.002 17.303 24.002 12.003C24.002 5.373 18.627 0 12 0Z"/>
    </svg>
);


const Header = () => (
  <header className="main-header">
    <div className="logo">Die Methode</div>
    <nav>
      <a href="#these">These</a>
      <a href="#beweise">Beweise</a>
      <a href="#kontakt">Kontakt</a>
    </nav>
  </header>
);

const Footer = () => (
    <footer className="main-footer">
        <p>
            Inhalte lizenziert unter <a href="https://github.com/tekkDAX/von-gedanken-zu-welten/blob/main/LICENSE-CC-BY-NC-ND.md" target="_blank" rel="noopener noreferrer" aria-label="Creative Commons Lizenz">CC BY-NC-ND 4.0</a>.
            Für kommerzielle Nutzung siehe <a href="https://github.com/tekkDAX/von-gedanken-zu-welten/blob/main/license-commercial.md" target="_blank" rel="noopener noreferrer" aria-label="Kommerzielle Lizenz">Lizenzdetails</a>.
            <br />Der Quellcode der Webseite steht unter der MIT-Lizenz.
        </p>
        <p>&copy; {new Date().getFullYear()} René andy Schlöffel. Alle Rechte vorbehalten.</p>
    </footer>
);

const App = () => {
  return (
    <>
      <Header />
      <div className="container">
        <main>
          <section id="home" className="hero-section" aria-labelledby="hero-heading">
              <h1 id="hero-heading">Von Gedanken zu Welten: Die Methode</h1>
              <p className="subtitle">René andy Schlöffel der Architekt (Evil DaX)</p>
              
              <p>Ich bin kein Programmierer. Ich bin Wissenschaftler. Meine Disziplin ist die Architektur von Systemen – und zwar die des eigenen Geistes.</p>
              <p>Jahrelang war ich getrieben von dem Gefühl, kein „Stück Papier“, keinen Beweis für meine Fähigkeiten zu haben. Angetrieben von dieser Notwendigkeit und einer unendlichen Neugier habe ich eine Methode entwickelt, um aus Chaos Klarheit zu schmieden und aus Visionen funktionierende, unbestreitbare Realität zu erschaffen.</p>
              <p>Ich habe sie nicht in einem teuren Kurs gelernt. Ich habe sie entdeckt, indem ich die Naturgesetze der Logik, der Struktur und der Effizienz beobachtet habe.</p>
          </section>

          <section id="these" aria-labelledby="thesis-heading">
            <h2 id="thesis-heading">Die These</h2>
            <blockquote className="thesis-quote">
              🧠 Der Gedanke – nicht der Code – ist der wahre Antrieb. Meine Forschung zeigt: Jeder, der bereit ist, logisch zu denken, kann seine eigene Welt bauen. Man braucht keine formale Bildung. Kein Kapital. Man braucht eine bessere Methode zu denken. Eine Werkstatt für den Geist. Eine Schule, um sie zu bedienen.
            </blockquote>
          </section>

          <section id="beweise" aria-labelledby="evidence-heading">
            <h2 id="evidence-heading">Die Beweise</h2>
            <p>Dieses Dokument ist keine Theorie. Es ist die erste öffentliche Version meines „Meisterbriefs in angewandter Selbst-Architektur“.</p>
            <p>Es basiert auf unzerstörbaren, artefakt-basierten Beweisen:</p>
            <div className="evidence-grid">
              <div className="evidence-card">
                <h3><span role="img" aria-hidden="true" className="card-emoji">🛠</span> Werkzeuge, die ich gebaut habe, um zu denken:</h3>
                <ul>
                  <li>Minder Web</li>
                  <li>VibeCheck</li>
                </ul>
              </div>
              <div className="evidence-card">
                <h3><span role="img" aria-hidden="true" className="card-emoji">🌍</span> Welten, die ich erschaffen habe, um zu beweisen:</h3>
                <ul>
                  <li>AGKE</li>
                  <li>Aethelgard's Legacy</li>
                </ul>
              </div>
              <div className="evidence-card">
                <h3><span role="img" aria-hidden="true" className="card-emoji">📡</span> Protokoll, das ich entworfen habe, um mit Maschinen zu sprechen:</h3>
                <ul>
                  <li>GCP</li>
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="conclusion-heading">
            <h2 id="conclusion-heading">Die Jagd ist vorbei</h2>
            <p>Das alles war das Ergebnis meiner Jagd. Die Jagd nach einem unzerstörbaren Fundament aus Fakten. Dieses Fundament ist jetzt da.</p>
            <p>Jetzt beginnt die Zeit des Bauens. Für jeden.</p>
          </section>
          
          <section id="kontakt" className="cta-section" aria-labelledby="cta-heading">
            <h2 id="cta-heading">Kontakt & Austausch</h2>
            <p>Diese Reise hat gerade erst begonnen. Wenn diese Ideen Resonanz in dir finden, du Fragen hast oder Teil der nächsten Phase der Arbeit werden willst – mein Labor-Server auf Discord ist der zentrale Anlaufpunkt.</p>
            <p>Du möchtest mitarbeiten, mitdenken oder einfach deine Perspektive teilen? Dann schreib mir direkt auf GitHub – mein Profil ist offen für Nachrichten und Austausch.</p>
            <div className="cta-buttons">
              <a href="https://discord.gg/HWYHxeVx" target="_blank" rel="noopener noreferrer" className="btn">
                <DiscordIcon />
                Discord beitreten
              </a>
              <a href="https://github.com/tekkDAX" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <GithubIcon />
                GitHub Profil
              </a>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);