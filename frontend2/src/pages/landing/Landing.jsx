import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../assets/Icon";
import c from "./landing.module.scss";

// Import images
import parisImage from "../../assets/Paris Explore Places.jpg";
import bangkokImage from "../../assets/Bangkok Explore Places.jpg";
import dubaiImage from "../../assets/Dubai Explore Places.jpg";
import tokyoImage from "../../assets/Tokyo Explore Places.jpg";
import romeImage from "../../assets/Explore Places in Rome.jpg";
import londonImage from "../../assets/London Explore Places.jpg";

const travelCards = [
  {
    city: "Paris",
    description:
      "Paris is the capital of France and is known for its浪漫的氛围和美丽的建筑。",
    image: parisImage,
    rotation: 5,
    top: "-5%",
    left: "50%",
    transform: "translateX(-50%)",
    exitDirection: "up",
  },
  {
    city: "Bangkok",
    description:
      "Bangkok is the capital of Thailand and is known for its delicious food and beautiful temples.",
    image: bangkokImage,
    rotation: 15,
    top: "15%",
    right: "-5%",
    transform: "translateX(0%)",
    exitDirection: "right",
  },
  {
    city: "Dubai",
    description:
      "Dubai is the capital of the United Arab Emirates and is known for its beautiful beaches and skyscrapers.",
    image: dubaiImage,
    rotation: -8,
    bottom: "15%",
    right: "-5%",
    transform: "translateX(0%)",
    exitDirection: "right",
  },
  {
    city: "Tokyo",
    description:
      "Tokyo is the capital of Japan and is known for its beautiful temples and delicious food.",
    image: tokyoImage,
    rotation: 6,
    bottom: "-5%",
    left: "50%",
    transform: "translateX(-50%)",
    exitDirection: "down",
  },
  {
    city: "Rome",
    description:
      "Rome is the capital of Italy and is known for its beautiful architecture and delicious food.",
    image: romeImage,
    rotation: 12,
    bottom: "10%",
    left: "-5%",
    transform: "translateX(0%)",
    exitDirection: "left",
  },
  {
    city: "London",
    description:
      "London is the capital of the United Kingdom and is known for its beautiful architecture and delicious food.",
    image: londonImage,
    rotation: -6,
    top: "20%",
    left: "-5%",
    transform: "translateX(0%)",
    exitDirection: "left",
  },
];

function Landing() {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setIsAnimating(true);
    // Wait for animation to complete (1s) before navigating
    setTimeout(() => {
      navigate("/trips");
    }, 1000);
  };

  return (
    <div className={c.landing}>
      <div className={`${c.content} ${isAnimating ? c.contentExit : ""}`}>
        <div className={c.icon}>
          <Icon.NoteBook />
        </div>
        <p className={c.subtitle}>This is a travel plan app</p>
        <h1 className={c.title}>
          <div>Capture the moment</div>
          <div>Keep the story</div>
        </h1>
        <button className={c.ctaButton} onClick={handleGetStarted}>
          Get Started
        </button>
      </div>

      <div className={c.cardsContainer}>
        {travelCards.map((card, index) => {
          // Calculate exit transform based on direction
          const getExitTransform = () => {
            if (!isAnimating)
              return `rotate(${card.rotation}deg) ${card.transform}`;

            const exitTransforms = {
              up: `translateY(-150%)`,
              down: `translateY(150%)`,
              left: `translateX(-150%)`,
              right: `translateX(150%)`,
            };

            const exitTransform = exitTransforms[card.exitDirection];
            // Preserve original translateX(-50%) if present
            const originalTransform =
              card.transform !== "translateX(0%)" ? card.transform : "";
            return `${exitTransform} ${originalTransform} rotate(${card.rotation}deg)`;
          };

          return (
            <div
              key={index}
              className={`${c.card} ${isAnimating ? c.cardExit : ""}`}
              style={{
                transform: getExitTransform(),
                top: card.top,
                bottom: card.bottom,
                left: card.left,
                right: card.right,
              }}
            >
              <div
                className={c.cardBackground}
                style={{
                  transform: `rotate(${-card.rotation * 2}deg)`,
                }}
              >
                <span className={c.cardCity}>{card.city}</span>
                <p className={c.cardDescription}>{card.description}</p>
              </div>
              <div className={c.cardImage}>
                <img src={card.image} alt={card.city} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Landing;
