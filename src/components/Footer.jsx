import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>
        ©{' '}
        <a href="https://conrob.dev/" target="_blank" rel="noopener noreferrer">
          ConRob
        </a>
        {' '}{currentYear} | {' '}
        <a href="https://github.com/crobs808/stock-time-travel" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
    </footer>
  );
}
