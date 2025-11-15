import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import c from "./Layout.module.scss";
import Icon from "../../assets/Icon";
import { useExperimentTabs } from "../../contexts/ExperimentTabsContext";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openTabs, removeTab } = useExperimentTabs();

  const handleCloseTab = (e, experimentName) => {
    e.stopPropagation();
    removeTab(experimentName);
    // If closing the current tab, navigate to home
    if (location.pathname === `/experiment/${experimentName}`) {
      navigate("/home");
    }
  };

  const handleTabClick = (experimentName) => {
    navigate(`/experiment/${experimentName}`);
  };

  return (
    <div className={c.layout}>
      <nav className={c.navBar}>
        <div className={c.navContent}>
          <Link to="/" className={c.logoIcon}>
            <Icon.Logo />
          </Link>
          <div className={c.navLinks}>
            <Link
              to="/home"
              className={`${c.navLink} ${
                location.pathname === "/home" ? c.active : ""
              }`}
            >
              Home
            </Link>

            {/* Dynamic Experiment Tabs */}
            {openTabs.map((experimentName) => (
              <div
                key={experimentName}
                className={`${c.experimentTab} ${
                  location.pathname === `/experiment/${experimentName}`
                    ? c.active
                    : ""
                }`}
                onClick={() => handleTabClick(experimentName)}
              >
                <span className={c.tabName}>{experimentName}</span>
                <button
                  className={c.tabClose}
                  onClick={(e) => handleCloseTab(e, experimentName)}
                  aria-label={`Close ${experimentName}`}
                >
                  <Icon.Close />
                </button>
              </div>
            ))}
          </div>
          <div className={c.demoText}>DEMO</div>
        </div>
      </nav>
      <main className={c.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
