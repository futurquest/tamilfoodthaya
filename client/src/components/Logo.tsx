export const Logo = ({ alt = 'Tamil Food Thaya', className = '' }: { alt?: string; className?: string }) => (
  <span className={`brand-mark__seal ${className}`}>
    <img src="/logo.png" alt={alt} />
  </span>
);

export const PageLoader = ({ full = true, hint = '' }: { full?: boolean; hint?: string }) => (
  <div className={full ? 'page-loader page-loader--full' : 'page-loader'}>
    <div className="page-loader__spinner">
      <img src="/logo-reduce.png" alt="Tamil Food Thaya" />
    </div>
    <p className="page-loader__brand">Tamil Food Thaya</p>
    {hint && <p className="page-loader__hint">{hint}</p>}
  </div>
);