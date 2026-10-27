/**
 * Funcții utilitare pentru produse:
 * primesc date, returnează date noi, nu modifică nimic și nu depind de React.
 * Avantaj: se pot testa izolat (Laboratorul 8) și se pot refolosi în orice componentă.
 */

// Formatorul de preț se creează o singură dată
const priceFormatter = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'RON',
});

/**
 * Prețul efectiv: prețul redus, dacă există, altfel prețul standard.
 * Folosim ?? (nu ||) pentru ca un eventual preț redus 0 să nu fie ignorat.
 */
export const effectivePrice = (product) =>
  product.discountPrice ?? product.price;

/**
 * Formatează un preț după regulile din România: 82 → „82,00 RON”.
 */
export const formatPrice = (value) => priceFormatter.format(value);

/**
 * Procentul de reducere, rotunjit: 95.99 → 79.99 înseamnă 17%.
 */
export const discountPercent = (product) => {
  const { price, discountPrice } = product;

  if (discountPrice == null || discountPrice >= price) return 0;

  return Math.round((1 - discountPrice / price) * 100);
};

/**
 * Lista categoriilor distincte, sortată alfabetic.
 * new Set(...) elimină duplicatele; [...set] îl transformă înapoi în tablou.
 */
export const getCategories = (products) =>
  [...new Set(products.map((p) => p.category))].toSorted((a, b) =>
    a.localeCompare(b, 'ro')
  );

/**
 * Cel mai mare preț efectiv din catalog, rotunjit în sus
 * (limita sliderului de preț).
 */
export const getMaxPrice = (products) =>
  Math.ceil(Math.max(0, ...products.map(effectivePrice)));

/**
 * Filtrele implicite – un singur obiect pentru toată starea formularului.
 */
export const createDefaultFilters = (maxPrice) => ({
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice,
  inStockOnly: false,
  featuredOnly: false,
  sortBy: 'name',
});

// Funcțiile de comparare pentru fiecare opțiune de sortare
const COMPARATORS = {
  name: (a, b) => a.title.localeCompare(b.title, 'ro'),
  author: (a, b) => a.author.localeCompare(b.author, 'ro'),
  'price-low': (a, b) => effectivePrice(a) - effectivePrice(b),
  'price-high': (a, b) => effectivePrice(b) - effectivePrice(a),
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

/**
 * Aplicăm toate filtrele și sortarea asupra listei de produse.
 * Returnează un tablou NOU; tabloul primit rămâne neschimbat.
 */
export const filterAndSortProducts = (products, filters) => {
  const keyword = filters.search.trim().toLowerCase();

  return products
    .filter((p) => {
      // 1. Căutare în titlu, autor și descriere
      const matchesSearch =
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.author.toLowerCase().includes(keyword) ||
        (p.description ?? '').toLowerCase().includes(keyword);

      // 2. Categorie
      const matchesCategory =
        filters.category === 'all' || p.category === filters.category;

      // 3. Interval de preț (după prețul efectiv)
      const price = effectivePrice(p);
      const matchesPrice =
        price >= filters.minPrice && price <= filters.maxPrice;

      // 4. Filtre rapide
      const matchesStock = !filters.inStockOnly || p.stock > 0;
      const matchesFeatured = !filters.featuredOnly || p.featured === true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesStock &&
        matchesFeatured
      );
    })
    .toSorted(COMPARATORS[filters.sortBy] ?? COMPARATORS.name);
};