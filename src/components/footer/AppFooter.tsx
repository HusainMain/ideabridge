import React from 'react'

export function AppFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="act-footer">
      {children ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {children}
        </div>
      ) : null}
      <div className="act-footer__links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#section-hero">Back to Top ↑</a>
      </div>
      <div className="act-footer__credit">
        Designed &amp; Developed by{' '}
        <a
          href="https://www.linkedin.com/in/husain-bardanwala-93a56b376"
          target="_blank"
          rel="noopener noreferrer"
          className="act-footer__credit-name"
        >
          Husain Bardanwala
        </a>
      </div>
    </footer>
  )
}
