import React from 'react';
import styles from './Navbar.module.css';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logo?: string;
  links?: NavLink[];
  children?: React.ReactNode;
}

export function Navbar({ logo, links = [], children }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      {logo && <div className={styles.logo}>{logo}</div>}
      <div className={styles.links}>
        {links.map((link, idx) => (
          <a key={idx} href={link.href} className={styles.link}>
            {link.label}
          </a>
        ))}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </nav>
  );
}
