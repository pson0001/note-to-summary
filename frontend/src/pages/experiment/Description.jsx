import c from "./Experiment.module.scss";
import { experimentData } from "./data";

function Description() {
  const { description } = experimentData;

  return (
    <div className={c.descriptionGrid}>
      <div className={c.descriptionCard}>
        <h3 className={c.descriptionCardTitle}>
          {description.hypothesis.title}
        </h3>
        <p className={c.descriptionCardText}>{description.hypothesis.text}</p>
        <div className={c.tags}>
          {description.hypothesis.tags.map((tag, index) => (
            <span key={index} className={c.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={c.descriptionCard}>
        <h3 className={c.descriptionCardTitle}>{description.goal.title}</h3>
        <p className={c.descriptionCardText}>{description.goal.text}</p>
        <div className={c.tags}>
          {description.goal.tags.map((tag, index) => (
            <span key={index} className={c.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={c.descriptionCardFull}>
        <h3 className={c.descriptionCardTitle}>{description.design.title}</h3>
        <p className={c.descriptionCardText}>{description.design.text}</p>
        <ul className={c.descriptionList}>
          {description.design.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className={c.tags}>
          {description.design.tags.map((tag, index) => (
            <span key={index} className={c.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Description;
