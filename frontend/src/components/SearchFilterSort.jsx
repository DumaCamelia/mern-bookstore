import { useState, useMemo, useEffect } from 'react';
import {
    createDefaultFilters,
    filterAndSortProducts,
    getCategories,
    getMaxPrice,
} from '../utils/products';
import './SearchFilterSort.css';

const SearchFilterSort = ({ products, onFilteredProducts }) => {
    const categories = useMemo(() => getCategories(products), [products]);
    const priceLimit = useMemo(() => getMaxPrice(products), [products]);

    const [filters, setFilters] = useState(() => 
        createDefaultFilters(categories, priceLimit));

    const filtered = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);

    useEffect(() => {
        onFilteredProducts(filtered);
    }, [filtered, onFilteredProducts]);

    const handleChange = (e) => {
        const {name, type, value, checked} = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleMinPrice = (e) => {
        const value = Number(e.target.value);
        setFilters((prev) => ({ ...prev, minPrice: Math.min(value, prev.maxPrice) }));
    };

    const handleMaxPrice = (e) => {
        const value = Number(e.target.value);
        setFilters((prev) => ({ ...prev, maxPrice: Math.max(value, prev.minPrice) }));
    };


    const resetFilters = () => setFilters(createDefaultFilters(priceLimit));

    return (
        <section className="search-filter-container" aria-label="Cautare si filtrare">
            <div className="filters-row">
                {/*CAUTARE - HTMLFor leaga eticheta de camp (click pe eticheta = focus in camp) */}
                <div className="filter-group search-group">
                    <label htmlFor="search" clasename="filter-label"></label>
                    Cautare
                    <input
                        id="search"
                        name="search"
                        type="search"
                        placeholder="Titlu, autor, descriere..."
                        value={filters.search}
                        onChange={handleChange}
                        className="filter-input"
                    />
                </div>
                {/*CATEGORIE - optiunile se genereaza din datele reale */}
                <div className="filter-group">
                    <label htmlFor="category" className="filter-label">
                        Categorie
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={filters.category}
                        onChange={handleChange}
                        className="filter-select"
                    >
                        <option value="all">Toate categoriile</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
            </div>

            {/*PRET - doua slidere: minim si maxim */}
            <div className="filter-group price-group">
                <span className="filter-label">
                    Pret: {filters.minPrice} - {filters.maxPrice} RON
                </span>
                <input
                    type="range"
                    min="0"
                    max={priceLimit}
                    value={filters.minPrice}
                    onChange={handleMinPrice}
                    aria-label="Pret minim"
                    className="range-input"
                />
                <input
                    type="range"
                    min="0"
                    max={priceLimit}
                    value={filters.maxPrice}
                    onChange={handleMaxPrice}
                    aria-label="Pret maxim"
                    className="range-input"
                />
            </div>

            {/*SORTARE */}
            <div className="filter-group">
                <label htmlFor="sortBy" className="filter-label">
                    Sortare
                </label>
                <select
                    id="sortBy"
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="filter-input"
                >
                    <option value="name">Titlu (A-Z)</option>
                    <option value="author">Author (A-Z)</option>
                    <option value="price-low">Pret (mic - mare)</option>
                    <option value="price-high">Pret (mare - mic)</option>
                    <option value="rating">Evaluare</option>
                    <option value="newest">Cele mai noi</option>
                </select>
            </div>
        </div>

        <div className="filters-row quick-filters">
            <label className="checkbox-label">
                <input type="checkbox" name="inStockOnly" checked={filters.inStockOnly} onChange={handleChange} />
                Doar in stoc
            </label>


            <label className="checkbox-label">
                <input type="checkbox" name="featuredOnly" checked={filters.featuredOnly} onChange={handleChange} />
                Doar recomandate
            </label>

            <button type="button" className="clear-filters-btn" onClick={resetFilters}>
                Reseteaza filtrele
            </button>
        </div>

        </section>
    )};

export default SearchFilterSort;