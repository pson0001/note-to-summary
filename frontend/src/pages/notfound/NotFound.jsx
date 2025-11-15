import c from "./NotFound.module.scss";
import { useNavigate } from "react-router-dom";
import Icon from "../../assets/Icon";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={c.notFound}>
      <div className={c.content}>
        <div className={c.iconContainer}>
          <Icon.Logo />
        </div>
        <h1 className={c.title}>404</h1>
        <h2 className={c.subtitle}>Page Not Found</h2>
        <p className={c.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={c.actions}>
          <button className={c.primaryButton} onClick={() => navigate("/home")}>
            Go to Home
          </button>
          <button className={c.secondaryButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

