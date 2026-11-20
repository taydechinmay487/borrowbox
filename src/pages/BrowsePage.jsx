import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icons';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, LOCATIONS, PRODUCTS, categoryById } from '../data/products';
import { useApp } from '../context/AppContext';
import { useRoute } from '../lib/router';

const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
];

export default function BrowsePage() {
  const { query } = useRoute();
  const { location, setLocation } = useApp();
  const category = query.category && categoryById[query.category] ? query.category : 'all';
  const [term, setTerm] = useState(query.q || '');
  const [sort, setSort] = useState('recommended');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    setTerm(query.q || '');
  }, [query.q]);

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();
    let list = PRODUCTS.filter((product) => {
      const matchesCategory =
        category === 'all' || product.categories.includes(category);
      const matchesTerm =
        !needle ||
        `${product.name} ${product.tagline} ${product.description}`
          .toLowerCase()
          .includes(needle);
      const matchesAvailability = !availableOnly || product.available;
      return matchesCategory && matchesTerm && matchesAvailability;
    });

    list = [...list];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else
      list.sort(
        (a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating
      );

    return list;
  }, [category, term, sort, availableOnly]);

  const activeCategory = category === 'all' ? null : categoryById[category];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div>
            <span className="section-kicker">
              <a href="#/">Home</a> / Browse
            </span>
            <h1>{activeCategory ? activeCategory.name : 'Browse all items'}</h1>
            <p className="page-sub">
              {results.length} {results.length === 1 ? 'item' : 'items'} available
              to rent near <strong>{location.split(',')[0]}</strong>
            </p>
          </div>
          <div className="loc-select">
            <Icon name="pin" size={17} />
            <select
              aria-label="Change location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              {LOCATIONS.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-search">
            <Icon name="search" size={18} />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search items, e.g. projector"
              aria-label="Search items"
            />
            {term && (
              <button
                className="icon-btn icon-btn--sm"
                onClick={() => setTerm('')}
                aria-label="Clear search"
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>

          <div className="filter-controls">
            <label className="toggle">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
              />
              <span className="toggle-track" aria-hidden="true" />
              <span>Available now</span>
            </label>

            <div className="select-wrap">
              <Icon name="filter" size={16} />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort items"
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="chip-row">
          <a
            className={`chip ${category === 'all' ? 'is-active' : ''}`}
            href="#/browse"
          >
            All items
          </a>
          {CATEGORIES.map((item) => (
            <a
              key={item.id}
              className={`chip ${category === item.id ? 'is-active' : ''}`}
              href={`#/browse?category=${item.id}`}
            >
              {item.name}
            </a>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="product-grid product-grid--browse">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="search" size={26} />
            </span>
            <h2>No items matched that search</h2>
            <p>
              Try a different keyword, clear the category filter, or browse
              everything available near you.
            </p>
            <a className="btn btn--primary" href="#/browse">
              Reset filters
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
