import c from "./Home.module.scss";
import { useExperimentTabs } from "../../contexts/ExperimentTabsContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const { addTab } = useExperimentTabs();
  const navigate = useNavigate();
  const metrics = [
    { label: "Active Experiments", value: "8" },
    { label: "Experiments (YTD)", value: "14" },
    { label: "Goal Complete Rate (%)", value: "64%" },
    { label: "Experiments to roll back", value: "1" },
  ];

  const experiments = [
    {
      team: "Team red",
      items: [
        {
          name: "Exp-231",
          status: "Running",
          statusColor: "green",
          timeline: { start: 0, end: 2, color: "blue" },
        },
        {
          name: "Exp-232",
          status: "Not started",
          statusColor: "orange",
          timeline: { start: 2, end: 3, color: "orange" },
        },
        {
          name: "Exp-234",
          status: "Running",
          statusColor: "green",
          timeline: { start: 0, end: 1, color: "blue" },
        },
      ],
    },
    {
      team: "Team blue",
      items: [
        {
          name: "Exp-235",
          status: "Running",
          statusColor: "green",
          timeline: { start: 0, end: 2, color: "blue" },
        },
        {
          name: "Exp-236",
          status: "Not started",
          statusColor: "orange",
          timeline: { start: 1, end: 2, color: "orange" },
        },
        {
          name: "Exp-237",
          status: "Not started",
          statusColor: "orange",
          timeline: { start: 3, end: 4, color: "orange" },
        },
      ],
    },
  ];

  const dateRanges = [
    "3-9 Nov",
    "10-16 Nov",
    "17-23 Nov",
    "24-30 Nov",
    "1-7 Dec",
  ];
  const currentDateIndex = 1; // Current date is in "10-16 Nov" column

  return (
    <div className={c.home}>
      {/* Main Content */}
      <div className={c.content}>
        {/* Top Section */}
        <div className={c.topSection}>
          {/* Experiments Summary */}
          <div className={c.summaryCard}>
            <div className={c.summaryContent}>
              <div className={c.summaryActions}>
                <h2 className={c.summaryTitle}>Experiments summary</h2>
                <button className={c.getSummaryBtn}>Get new summary</button>
              </div>

              <p className={c.summaryText}>
                Nine experiments currently running across three teams. Two are
                showing statistically significant improvements in user
                retention, while one (Variant B) continues to underperform due
                to backend latency.
              </p>
            </div>
            <div className={c.timestamp}>Update 10 hours ago</div>
          </div>

          {/* Key Metrics */}
          <div className={c.metricsGrid}>
            {metrics.map((metric, index) => (
              <div key={index} className={c.metricCard}>
                <div className={c.metricLabel}>{metric.label}</div>
                <div className={c.metricValue}>{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Experiments Timeline */}
        <div className={c.timelineCard}>
          <h2 className={c.timelineTitle}>Experiments</h2>
          <div className={c.timelineContainer}>
            {/* Table Header */}
            <div className={c.timelineHeader}>
              <div className={c.headerCell}>Experiment name</div>
              <div className={c.headerCell}>Status</div>
              <div className={c.dateHeaders}>
                {dateRanges.map((date, index) => (
                  <div
                    key={index}
                    className={`${c.dateHeader} ${
                      index === currentDateIndex ? c.currentDate : ""
                    }`}
                  >
                    {date}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Date Indicator */}
            <div
              className={c.currentDateLine}
              style={{
                left: `calc(200px + ${currentDateIndex * 120}px + 60px)`,
              }}
            >
              <div className={c.currentDateDot}></div>
            </div>

            {/* Experiment Rows */}
            <div className={c.timelineRows}>
              {experiments.map((team, teamIndex) => (
                <div key={teamIndex} className={c.teamGroup}>
                  <div className={c.teamName}>{team.team}</div>
                  {team.items.map((exp, expIndex) => (
                    <div
                      key={expIndex}
                      className={c.experimentRow}
                      onClick={() => {
                        addTab(exp.name);
                        navigate(`/experiment/${exp.name}`);
                      }}
                    >
                      <div className={c.experimentName}>{exp.name}</div>
                      <div className={c.experimentStatus}>
                        <span
                          className={`${c.statusDot} ${c[exp.statusColor]}`}
                        ></span>
                        <span className={c.statusText}>{exp.status}</span>
                      </div>
                      <div className={c.timelineBars}>
                        {dateRanges.map((_, dateIndex) => {
                          const hasTimeline =
                            exp.timeline &&
                            dateIndex >= exp.timeline.start &&
                            dateIndex <= exp.timeline.end;

                          if (!hasTimeline) {
                            return (
                              <div
                                key={dateIndex}
                                className={c.timelineCell}
                              ></div>
                            );
                          }

                          const isStart = dateIndex === exp.timeline.start;
                          const isEnd = dateIndex === exp.timeline.end;
                          const isMiddle = !isStart && !isEnd;
                          const isSingleCell = isStart && isEnd; // Same cell is both start and end

                          let borderRadiusClass = "";
                          if (isSingleCell) {
                            // Single cell: keep full border-radius
                            borderRadiusClass = "";
                          } else if (isStart) {
                            borderRadiusClass = c.timelineBarStart;
                          } else if (isMiddle) {
                            borderRadiusClass = c.timelineBarMiddle;
                          } else if (isEnd) {
                            borderRadiusClass = c.timelineBarEnd;
                          }

                          return (
                            <div key={dateIndex} className={c.timelineCell}>
                              <div
                                className={`${c.timelineBar} ${
                                  c[exp.timeline.color]
                                } ${borderRadiusClass}`}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
