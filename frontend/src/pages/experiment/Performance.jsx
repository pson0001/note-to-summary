import c from "./Experiment.module.scss";
import { experimentData } from "./data";

function Performance() {
  const { performance } = experimentData;
  const chartData = performance.chartData;

  // Calculate chart dimensions and scaling
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 40, bottom: 50, left: 60 };
  const chartInnerWidth = chartWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;
  const maxValue = 5000;
  const yStep = 1000;

  // Scale function
  const scaleY = (value) => {
    return chartInnerHeight - (value / maxValue) * chartInnerHeight;
  };

  const scaleX = (index) => {
    return (index / (chartData.length - 1)) * chartInnerWidth;
  };

  // Generate path for line
  const generatePath = (dataKey) => {
    return chartData
      .map((point, index) => {
        const x = padding.left + scaleX(index);
        const y = padding.top + scaleY(point[dataKey]);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <>
      {/* Experiment Details Cards */}
      <div className={c.detailsGrid}>
        <div className={c.detailCard}>
          <h3 className={c.detailTitle}>Experiment Duration</h3>
          <p className={c.detailValue}>{performance.experimentDuration}</p>
        </div>
        <div className={c.detailCard}>
          <h3 className={c.detailTitle}>Users Impacted</h3>
          <p className={c.detailValue}>{performance.usersImpacted}</p>
        </div>
      </div>

      {/* Conversion Data Cards */}
      <div className={c.conversionGrid}>
        {/* Total Conversions Card */}
        <div className={c.conversionCard}>
          <h3 className={c.conversionTitle}>
            {performance.totalConversionsTitle}
          </h3>
          <div className={c.conversionValues}>
            <div className={c.conversionItem}>
              <div className={c.conversionNumber}>
                {performance.conversions.control.value}
              </div>
              <div className={c.conversionLabel}>
                <span className={`${c.dot} ${c.controlDot}`}></span>
                {performance.conversions.control.label}
              </div>
            </div>
            <div className={c.conversionItem}>
              <div className={c.conversionNumber}>
                {performance.conversions.variant.value}
              </div>
              <div className={c.conversionLabel}>
                <span className={`${c.dot} ${c.variantDot}`}></span>
                {performance.conversions.variant.label}
              </div>
            </div>
          </div>
        </div>

        {/* Conversions per Day Card */}
        <div className={c.chartCard}>
          <h3 className={c.chartTitle}>{performance.chartTitle}</h3>
          <div className={c.chartContainer}>
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className={c.chart}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4, 5].map((step) => {
                const value = step * yStep;
                const y = padding.top + scaleY(value);
                return (
                  <g key={step}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + chartInnerWidth}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 15}
                      y={y + 4}
                      textAnchor="end"
                      fill="#6b7280"
                      fontSize="12"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {chartData.map((point, index) => {
                const x = padding.left + scaleX(index);
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - padding.bottom + 25}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="12"
                  >
                    {point.date}
                  </text>
                );
              })}

              {/* Control line */}
              <path
                d={generatePath("control")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Variant line */}
              <path
                d={generatePath("variant")}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              />

              {/* Control dots */}
              {chartData.map((point, index) => {
                const x = padding.left + scaleX(index);
                const y = padding.top + scaleY(point.control);
                return (
                  <circle
                    key={`control-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                  />
                );
              })}

              {/* Variant dots */}
              {chartData.map((point, index) => {
                const x = padding.left + scaleX(index);
                const y = padding.top + scaleY(point.variant);
                return (
                  <circle
                    key={`variant-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#fbbf24"
                  />
                );
              })}
            </svg>

            {/* Chart Legend */}
            <div className={c.chartLegend}>
              <div className={c.legendItem}>
                <span className={`${c.legendDot} ${c.controlDot}`}></span>
                <span>Control</span>
              </div>
              <div className={c.legendItem}>
                <span className={`${c.legendDot} ${c.variantDot}`}></span>
                <span>Variant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Performance;
