import Head from "next/head";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeSwitch from "../components/theme-switch";

import { FaInbox, FaGithub } from "react-icons/fa";

const name = "Odee Jhey";
const subName = "@odjhey";
const subTitle = "Lazy coder. Procrastinator at best.";
export const siteTitle = "Odee | Blog";

export default function Layout({
  children,
  home,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  return (
    <div>
      <section>
        <div className={styles._container}>
          <div className={styles.headerToolbar}>
            <ThemeSwitch />
          </div>
          <div className={styles.container}>
            <Head>
              <link rel="icon" href="/favicon.ico" />
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;500;700&amp;family=Muli:wght@300;400;500;700&amp;display=swap"
              />
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
                  <h1
                    className={utilStyles.headingXl}
                    style={{
                      lineHeight: 0.2,
                      paddingTop: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {name}
                  </h1>
                  <h1
                    className={utilStyles.headingMd}
                    style={{
                      color: "#DDD",
                      lineHeight: 0,
                      fontWeight: "normal",
                    }}
                  >
                    {subTitle}
                  </h1>
                </>
              ) : (
                <div></div>
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
      <section>
        <div className={styles.container}>
          <h4>Comments</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: `<script src="https://utteranc.es/client.js" repo="odjhey/blog-comments" issue-term="url" theme="github-dark" crossOrigin="anonymous" async ></script>`,
            }}
          />
        </div>
      </section>
      <section>
        <div
          style={{
            padding: 10,
            backgroundColor: "#222",
            color: "#AAA",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            fontSize: 12,
            verticalAlign: "middle",
          }}
        >
          <a
            className={utilStyles.footerLink}
            href={"https://github.com/odjhey"}
            target={"_blank"}
          >
            <div
              style={{
                paddingRight: 20,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaGithub title={"hello"} size={12} />
            </div>
          </a>
          <a className={utilStyles.footerLink} href={"mailto:odjhey@gmail.com"}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              odjhey@gmail.com
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
