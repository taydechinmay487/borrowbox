import Icon from './Icons';
import Stars from './Stars';
import { categoryById } from '../data/products';
import { money } from '../lib/utils';

export default function ProductCard({ product }) {
  const category = categoryById[product.categories[0]];
  return (
    <article className="product-card">
      <a className="product-media" href={`#/product/${product.id}`} aria-label={product.name}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className={product.available ? 'pill pill--ok' : 'pill pill--off'}>
          <span className="pill-dot" />
          {product.available ? 'Available' : 'Booked out'}
        </span>
      </a>
      <div className="product-body">
        <span className="product-cat">{category?.name}</span>
        <h3>
          <a href={`#/product/${product.id}`}>{product.name}</a>
        </h3>
        <div className="product-meta">
          <Stars value={product.rating} />
          <span className="rating-value">{product.rating.toFixed(1)}</span>
          <span className="dot-sep" />
          <span>{product.distance}</span>
        </div>
        <div className="product-foot">
          <div className="price">
            <strong>{money(product.price)}</strong>
            <span>/ day</span>
          </div>
          <a className="btn btn--soft btn--sm" href={`#/product/${product.id}`}>
            View <Icon name="arrowRight" size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
