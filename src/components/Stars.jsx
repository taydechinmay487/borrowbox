import Icon from './Icons';

export default function Stars({ value = 0, size = 13 }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size={size}
          className={star <= rounded ? 'star is-filled' : 'star'}
          fill={star <= rounded ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}
