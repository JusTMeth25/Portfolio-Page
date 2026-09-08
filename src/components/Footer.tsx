import { profile } from '../data/profile'
import './footer.css'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__name">
          © {year} {profile.name}
        </p>
        <p className="footer__note">{profile.footer.note}</p>
        <ul className="footer__links">
          {profile.contact.links.map((link) => (
            <li key={link.id}>
              <a
                className="footer__link"
                href={link.href}
                {...(link.kind === 'email'
                  ? {}
                  : { target: '_blank', rel: 'noreferrer noopener' })}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
