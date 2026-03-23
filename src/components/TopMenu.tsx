'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import styles from './topmenu.module.css';

export default function TopMenu() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Hause89 Spa</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Link href="/shops" className={styles.navLink}>
            Massage Shops
          </Link>

          {session?.user ? (
            <>
              {session.user.role !== 'admin' && (
                <Link href="/appointments" className={styles.navLink}>
                  My Appointments
                </Link>
              )}

              {session.user.role === 'admin' && (
                <>
                  <Link href="/admin/shops" className={styles.navLink}>
                    Manage Shops
                  </Link>
                  <Link href="/admin/appointments" className={styles.navLink}>
                    All Appointments
                  </Link>
                </>
              )}

              <div className={styles.userSection}>
                <span className={styles.userName}>
                  Hi, {session.user.name}
                  {session.user.role === 'admin' && (
                    <span className={styles.adminBadge}>Admin</span>
                  )}
                </span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginBtn}>
                Login
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileNav}>
          <Link href="/shops" className={styles.mobileNavLink}>
            Massage Shops
          </Link>

          {session?.user ? (
            <>
              {session.user.role !== 'admin' && (
                <Link href="/appointments" className={styles.mobileNavLink}>
                  My Appointments
                </Link>
              )}

              {session.user.role === 'admin' && (
                <>
                  <Link href="/admin/shops" className={styles.mobileNavLink}>
                    Manage Shops
                  </Link>
                  <Link href="/admin/appointments" className={styles.mobileNavLink}>
                    All Appointments
                  </Link>
                </>
              )}

              <div className={styles.mobileUserSection}>
                <span>Logged in as {session.user.name}</span>
                <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.mobileNavLink}>
                Login
              </Link>
              <Link href="/register" className={styles.mobileNavLink}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
