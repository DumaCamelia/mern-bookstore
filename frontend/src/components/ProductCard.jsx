import { PLACEHOLDER_IMAGE } from '../config';
import { formatPrice, discountPercent } from '../utils/products';
import './ProductCard.css';

/**
 * Înlocuim imaginea cu placeholder-ul.
 */
const showPlaceholder = (img) => {
  if (!img.src.endsWith(PLACEHOLDER_IMAGE)) {
    img.src = PLACEHOLDER_IMAGE;
  }
};

/**
 * Cardul unui produs din catalog.
 *
 * Props:
 * - product: obiectul produs primit de la API
 * - onAddToCart: funcție apelată cu id-ul produsului (opțională)
 */
const ProductCard = ({ product, onAddToCart }) => {
  // Destructurare cu valori implicite: câmpurile opționale nu „sparg” componenta
  const {
    id,
    title,
    author,
    price,
    discountPrice,
    imageUrl,
    stock = 0,
    rating,
    reviewCount = 0,
    isbn,
    description,
    specifications = {},
  } = product;

  const discount = discountPercent(product);
  const outOfStock = stock === 0;

  return (
    <article className="product-card">
      {/* Imaginea + overlay-ul cu detalii */}
      <div className="product-image-container">
        <img
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={`Coperta cărții ${title}`}
          className="product-image"
          loading="lazy"
          // Open Library poate returna o imagine de 1×1 px când nu are coperta
          onLoad={(e) =>
            e.currentTarget.naturalWidth < 10 &&
            showPlaceholder(e.currentTarget)
          }
          // URL inexistent sau eroare de rețea → placeholder
          onError={(e) => showPlaceholder(e.currentTarget)}
        />

        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}

        <div className="hover-overlay">
          <dl className="hover-content">
            <dt>ISBN</dt>
            <dd>{isbn || 'N/A'}</dd>

            <dt>Editura</dt>
            <dd>{specifications.publisher || 'N/A'}</dd>

            <dt>Pagini</dt>
            <dd>{specifications.pages || 'N/A'}</dd>

            <dt>An publicare</dt>
            <dd>{specifications.year || 'N/A'}</dd>

            <dt>Stoc</dt>
            <dd>{stock} bucăți</dd>

            {/* Dacă rating-ul este 0, nu afișăm secțiunea de evaluare */}
            {rating > 0 && (
              <>
                <dt>Evaluare</dt>
                <dd aria-label={`${rating} din 5 stele`}>
                  {'★'.repeat(Math.round(rating))}
                  {'☆'.repeat(5 - Math.round(rating))} ({reviewCount} recenzii)
                </dd>
              </>
            )}
          </dl>

          {description && <p className="description">{description}</p>}
        </div>
      </div>

      {/* Informațiile principale */}
      <div className="product-info">
        <h3>{title}</h3>
        <p className="author">de {author}</p>

        <div className="price-section">
          {discount > 0 ? (
            <>
              <span className="original-price">{formatPrice(price)}</span>
              <span className="current-price">
                {formatPrice(discountPrice)}
              </span>
            </>
          ) : (
            <span className="current-price">{formatPrice(price)}</span>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          // Funcția este apelată doar dacă a fost transmisă
          onClick={() => onAddToCart?.(id)}
          disabled={outOfStock}
        >
          {outOfStock ? 'Stoc epuizat' : 'Adaugă în coș'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;