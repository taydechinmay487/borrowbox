export default function Nav() {
  const links = [
    ['Overview', '#overview'],
    ['Simulator', '#simulator'],
    ['Transmission', '#transmission'],
    ['Comparison', '#comparison'],
    ['Theory', '#theory'],
  ];

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__brand" href="#overview">
          <span className="nav__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <path
                d="M2 16c3.5 0 3.5-9 7-9s3.5 18 7 18 3.5-18 7-18 3.5 9 7 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="nav__name">
            Modu<span>Lab</span>
          </span>
          <span className="nav__badge">DC&nbsp;Project</span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <span className="nav__live">
          <i /> Live DSP
        </span>
      </div>
    </header>
  );
}
