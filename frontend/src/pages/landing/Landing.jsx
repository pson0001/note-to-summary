import { useState, useRef, useEffect } from "react";
import c from "./Landing.module.scss";
import { useNavigate } from "react-router-dom";
import evernoteIcon from "../../assets/evernote.png";
import notionIcon from "../../assets/notion.png";
import slackIcon from "../../assets/slack.png";
import jiraIcon from "../../assets/jira.png";
import confluenceIcon from "../../assets/confluence.png";
import Icon from "../../assets/Icon";

function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        menuRef.current &&
        burgerRef.current &&
        !menuRef.current.contains(event.target) &&
        !burgerRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const integrationIcons = [
    { src: evernoteIcon, alt: "Evernote" },
    { src: notionIcon, alt: "Notion" },
    { src: slackIcon, alt: "Slack" },
    { src: jiraIcon, alt: "Jira" },
    { src: confluenceIcon, alt: "Confluence" },
  ];

  // Repeat the icons 4 times for seamless animation
  const repeatedIcons = Array.from(
    { length: 8 },
    () => integrationIcons
  ).flat();

  const backgroundCards = [
    {
      title: "Experiment",
      progress: 30,
      note: "Backend testing ongoing; infra delayed.",
    },
    {
      title: "Experiments",
      progress: 85,
      note: "Frontend updates completed.",
    },
    {
      title: "Research",
      progress: 45,
      note: "Data analysis in progress.",
    },
  ];

  // Repeat the cards 4 times for seamless animation
  const repeatedCards = Array.from({ length: 4 }, () => backgroundCards).flat();

  return (
    <div className={c.landing}>
      {/* Header */}
      <header className={c.header}>
        <div className={c.headerLeft}>
          <button
            className={c.burgerButton}
            ref={burgerRef}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Icon.Burger />
          </button>
          <div className={c.logo}>
            <div className={c.logoIcon}>
              <Icon.Logo />
            </div>
            <span className={c.logoText}>Experimentum</span>
          </div>
        </div>
        <div className={c.headerRight}>
          <nav
            ref={menuRef}
            className={`${c.nav} ${isMobileMenuOpen ? c.mobileMenuOpen : ""}`}
          >
            <a
              href="#product"
              className={c.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Product
            </a>
            <a
              href="#resources"
              className={c.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resources
            </a>
            <a
              href="#support"
              className={c.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support
            </a>
            <a
              href="#pricing"
              className={c.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#login"
              className={c.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </a>
          </nav>
          <button className={c.ctaButton} onClick={() => navigate("/home")}>
            Try the Demo
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={c.main}>
        {/* Integration Icons - Animated Scroll */}
        <div className={c.integrationsWrapper}>
          <div className={c.integrations}>
            {repeatedIcons.map((icon, index) => (
              <div key={index} className={c.integrationIcon}>
                <img src={icon.src} alt={icon.alt} className={c.iconImage} />
              </div>
            ))}
          </div>
        </div>

        {/* Central Feature Card */}
        <div className={c.featureCard}>
          <h1 className={c.headline}>
            AI-powered visibility for every experiment
          </h1>
          <p className={c.description}>
            Capture notes, sync updates, and let AI summarise progress across
            Jira, Confluence, Slack, Notion and more.
          </p>
          <button className={c.ctaButton} onClick={() => navigate("/home")}>
            Try the Demo
          </button>
        </div>

        {/* Background Dashboard Elements - Animated Scroll */}
        <div className={c.backgroundElementsWrapper}>
          <div className={c.backgroundElements}>
            {repeatedCards.map((card, index) => (
              <div key={index} className={c.bgCard}>
                <div>
                  <div className={c.bgText}>{card.title}</div>
                  <div className={c.bgProgress}>
                    <div className={c.progressBar}>
                      <div
                        className={c.progressFill}
                        style={{ width: `${card.progress}%` }}
                      ></div>
                    </div>
                    <span className={c.progressText}>{card.progress}%</span>
                  </div>
                  <div className={c.bgNote}>{card.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;
