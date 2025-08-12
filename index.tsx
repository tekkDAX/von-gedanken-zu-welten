import React from 'react';
import ReactDOM from 'react-dom/client';

const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.36981C18.883...Z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373...Z" />
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
      Inhalte lizenziert unter <a href="LICENSE-CC-BY-NC-ND.md" target="_blank">CC BY-NC-ND 4.0</a>.  
      Für kommerzielle Nutzung siehe <a href="license-commercial.md" target="_blank">Lizenzdetails</a>.
      <br />Der Quellcode der Webseite steht unter der MIT-Lizenz.
    </p>
    <p>&copy; {new Date().getFullYear()} René Andy Schlöffel. Alle Rechte vorbehalten.</p>
  </footer>
);

const App = () => (
  <>
    <Header />
    <main className="container">
      {/* Deine Sections bleiben unverändert */}
    </main>
    <Footer />
  </>
);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
