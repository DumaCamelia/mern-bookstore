/**
 * MERN BOOKSTORE – API v1 (Laboratorul 2)
 * Server Express.js pentru catalogul de cărți.
 *
 * Funcționalități adăugate în această etapă:
 *  - GET /               – informații despre API
 *  - GET /api            – același răspuns (folosit la verificarea deploy-ului)
 *  - GET /api/products   – produsele active, cu filtrare opțională după categorie
 *  - GET /api/products/:id – un singur produs activ
 *  - răspuns JSON pentru rute inexistente (404) și pentru erori (500)
 */

// 1. Variabilele de mediu din .env se încarcă ÎNAINTE
require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// 2. Configurare
const app = express();
const PORT = process.env.PORT || 3000;

// Una sau mai multe origini permise, separate prin virgulă
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

// Căile către fișierele de date
const PRODUCTS_FILE = path.join(__dirname, 'data', 'books.json');

// 3. Middleware – ordinea este importanta!
app.use(helmet()); // antete HTTP de securitate
app.use(cors({ origin: CORS_ORIGIN })); // permite cereri de la frontend (alt port = altă origine)
app.use(compression()); // comprimă răspunsurile (gzip)
app.use(express.json()); // transformă corpul JSON al cererii în req.body

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // jurnal pentru fiecare cerere: metodă, URL, status, durată
}

/**
 * FUNCȚII HELPER PENTRU DATE
 */

/**
 * Citește întregul catalog (produse + metadate).
 * @returns {{products: Array, metadata: Object}}
 */
const readCatalog = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(data);

    return {
      products: parsed.products || [],
      metadata: parsed.metadata || {}
    };
  } catch (error) {
    console.error('Eroare la citirea catalogului:', error.message);
    return {
      products: [],
      metadata: {}
    };
  }
};

/**
 * Returnează doar lista de produse.
 * @returns {Array}
 */
const readProducts = () => readCatalog().products;

/**
 * Salvează produsele PĂSTRÂND metadatele (totalProducts și lastUpdated se actualizează).
 * O vom folosi din Laboratorul 6, la administrarea produselor.
 * @param {Array} products
 */
const saveProducts = (products) => {
  const { metadata } = readCatalog();
  const now = new Date().toISOString();

  const data = {
    products,
    metadata: {
      ...metadata,
      totalProducts: products.length,
      lastUpdated: now
    },
  };

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
};

/**
 * RUTE PENTRU PRODUSE
 */

/**
 * GET /api/products – toate produsele active
 * Parametri de interogare (query string):
 *  - category: filtrare după categorie (fără a ține cont de majuscule)
 * Exemplu: /api/products?category=React
 */
const effectivePrice = (product) => product.discountPrice ?? product.price;

const SORT_OPTIONS = {
  price_asc: (a, b) => effectivePrice(a) - effectivePrice(b), //PRET CRESCATOR
  price_desc: (a, b) => effectivePrice(b) - effectivePrice(a), //PRET DESCRESCATOR
  title_asc: (a, b) => a.title.localeCompare(b.title), //TITLU CRESCATOR A - Z
  title_desc: (a, b) => b.title.localeCompare(a.title), //TITLU DESCRESCATOR Z - A
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), //CELE MAI NOI inati
}  

const queryText = (value) => (typeof value === 'string' ? value.trim() : '');

app.get('/api/products', (req, res) => {
  try {
    const category  = queryText(req.query.category);
    const search    = queryText(req.query.search);
    const sort      = queryText(req.query.sort);

    if (sort && !SORT_OPTIONS[sort]) {
      return res.status(400).json({
        success: false,
        message: `Sortare invalida: "{sort}`,
        allowedSorts: Object.keys(SORT_OPTIONS),
      });
    }

    let products = readProducts().filter((p) => p.isActive === true);

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

      if(search) {
        const keyword = search.toLowerCase();
        products = products.filter(
          (p) => p.title.toLowerCase().includes(keyword) ||
           p.author.toLowerCase().includes(keyword)
        );
      }

      if (sort) {
        products = products.toSorted(SORT_OPTIONS[sort]);
      }
    

    res.json({
      success: true,
      products,
      total: products.length,
      filters: {
        category: category || null
      },
    });
  } catch (error) {
    console.error('Eroare la obținerea produselor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare server'});
    }
    });


/**
 * GET /api/products/:id – un singur produs activ
 * Exemplu: /api/products/3
 */
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID invalid'
    });
  }

  const product = readProducts().find(
    (p) => p.id === id && p.isActive === true
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Produsul nu a fost găsit'
    });
  }

  res.json({
    success: true,
    product
  });
});

/**
 * GET / și GET /api – informații despre API
 */
const apiInfo = (req, res) => {
  res.json({
    message: 'MERN BookStore API v1',
    description: 'API pentru catalogul de cărți',
    version: '1.0.0',
    endpoints: {
      'GET /api/products': 'Toate produsele active',
      'GET /api/products?category=React': 'Filtrare după categorie',
      'GET /api/products?search=react':'Cautare in titlu sau autor',
      'GET /api/products?sort=price-asc': 'Sortare: price_asc, price_desc, title_asc, title_desc, newest',
      'GET /api/products/:id': 'Un singur produs',
    },
    author: 'SDBIS',
  });
};

app.get('/', apiInfo);
app.get('/api', apiInfo);

/**
 * ===============================
 * TRATAREA ERORILOR (la finalul rutelor definite)
 * ===============================
 */

// 404 – nicio rută de mai sus nu a răspuns
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} nu există`,
  });
});

// 500 – middleware de eroare (are 4 parametri)
app.use((err, req, res, next) => {
  // JSON invalid în corpul cererii (ex. POST cu virgulă lipsă)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON invalid în corpul cererii'
    });
  }

  console.error('Eroare neprevăzută:', err);

  res.status(500).json({
    success: false,
    message: 'Eroare internă a serverului'
  });
});

// Pornirea serverului (nu și în timpul testelor automate)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('\nMERN BookStore API v1');
    console.log(`Serverul rulează pe: http://localhost:${PORT}`);
    console.log(`Produse: http://localhost:${PORT}/api/products\n`);
  });
}

// Exportăm aplicația pentru testare (Laboratorul 8)
module.exports = app;