import { monogramPath, monogramViewBox } from '../src/data/monogram';

// Tidindis monogram (sort T på neongult) som ikon i Studio.
export function Monogram() {
  return (
    <svg viewBox="0 0 100 100" width="1em" height="1em" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="100" height="100" fill="#E6FF2B" />
      <svg x="15" y="14" width="70" height="72" viewBox={monogramViewBox}>
        <path d={monogramPath} fill="#1C1E20" />
      </svg>
    </svg>
  );
}
