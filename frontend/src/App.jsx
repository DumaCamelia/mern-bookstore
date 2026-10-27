import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BookCatalog from './components/BookCatalog';

/**
 * Pagina care va fi afișată pentru orice adresă necunoscută (ruta "*").
 */
const NotFound = () => (
  <main style={{ padding: '60px 20px', textAlign: 'center' }}>
    <h1>404 – Pagina nu există</h1>
    <p>
      <Link to="/">Înapoi la magazin</Link>
    </p>
  </main>
);

/**
 * Componenta rădăcină: definește rutele aplicației.
 * În laboratoarele următoare vom adăuga /admin/login, /admin/products,
 * /payment-success.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookCatalog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;