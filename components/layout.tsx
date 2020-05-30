import Head from "next/head";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeSwitch from "../components/theme-switch";

const name = "Odee Jhey";
const subName = "@odjhey";
export const siteTitle = "Odee | Blog";

export default function Layout({
  children,
  home,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  return (
    <section>
      <div className={styles._container}>
        <div className={styles.headerToolbar}>
          <ThemeSwitch />
        </div>
        <div className={styles.container}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content="Odjhey's Random Thoughts" />
            <meta
              property="og:image"
              content={`https://og-image.now.sh/${encodeURI(
                siteTitle
              )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
            />
            <meta name="og:title" content={siteTitle} />
            <meta name="twitter:card" content="summary_large_image" />
          </Head>
          <header className={styles.header}>
            {home ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    src="/images/profile.jpg"
                    className={`${styles.headerHomeImage} ${utilStyles.borderCircle}`}
                    alt={name}
                  />
                </motion.div>
                <h1 className={utilStyles.heading2Xl}>{name}</h1>
                <h1 className={utilStyles.subHeading}>{subName}</h1>
              </>
            ) : (
              <>
                <Link href="/">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <img
                      src="/images/profile.jpg"
                      className={`${styles.headerImage} ${utilStyles.borderCircle}`}
                      alt={name}
                    />
                  </motion.a>
                </Link>
                <h2 className={utilStyles.headingLg}>
                  <Link href="/">
                    <a className={utilStyles.colorInherit}>{name}</a>
                  </Link>
                </h2>
              </>
            )}
          </header>
          <main>{children}</main>
          {!home && (
            <div className={styles.backToHome}>
              <Link href="/">
                <a>← Back to home</a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
