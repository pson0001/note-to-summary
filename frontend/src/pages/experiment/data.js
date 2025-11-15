// Experiment data for Exp-231
export const experimentData = {
  // Performance tab data
  performance: {
    experimentDuration: "1 - 15 Nov",
    usersImpacted: "12,830 (6,372 control / 6,458 variant)",
    totalConversionsTitle: "Total conversions (5 Nov - present):",
    conversions: {
      control: {
        value: "3,784",
        label: "Control",
      },
      variant: {
        value: "4,638",
        label: "Variant",
      },
    },
    chartTitle: "Conversions per day",
    chartData: [
      { date: "3 Nov", control: 1000, variant: 1450 },
      { date: "4 Nov", control: 300, variant: 500 },
      { date: "5 Nov", control: 2000, variant: 2800 },
      { date: "6 Nov", control: 1500, variant: 3000 },
      { date: "7 Nov", control: 1000, variant: 2500 },
      { date: "8 Nov", control: 1200, variant: 2600 },
      { date: "9 Nov", control: 3000, variant: 4800 },
    ],
    // Text for summary generation
    summaryText: `Experiment Duration: 1 - 15 Nov
Users Impacted: 12,830 (6,372 control / 6,458 variant)
Total conversions (5 Nov - present): Control: 3,784, Variant: 4,638
Conversions per day data shows variant consistently outperforming control, with significant spike on Nov 5 (Control: 2,000, Variant: 2,800) and Nov 9 (Control: 3,000, Variant: 4,800).`,
  },

  // Description tab data
  description: {
    hypothesis: {
      title: "Hypothesis",
      text: "Simplifying the form by reducing required fields and shortening copy will increase completion rates and decrease sign-up time, without hurting post-sign-up engagement.",
      tags: ["Confluence"],
    },
    goal: {
      title: "Goal",
      text: "Achieve at least a 10 % increase in sign-ups and a 15 % faster completion time while maintaining data quality.",
      tags: ["Confluence", "Jira"],
    },
    design: {
      title: "Design",
      text: "Two versions were tested over three weeks for ~10,000 new visitors:",
      items: [
        "Control: seven input fields with detailed instructional text",
        "Variant C: four essential fields and concise copy",
      ],
      tags: ["Confluence", "Jira"],
    },
    // Text for summary generation
    summaryText: `Hypothesis: Simplifying the form by reducing required fields and shortening copy will increase completion rates and decrease sign-up time, without hurting post-sign-up engagement.
Goal: Achieve at least a 10% increase in sign-ups and a 15% faster completion time while maintaining data quality.
Design: Two versions were tested over three weeks for ~10,000 new visitors. Control: seven input fields with detailed instructional text. Variant C: four essential fields and concise copy.`,
  },

  // Data Sources tab data
  dataSources: [
    {
      name: "Jira",
      description:
        "Three Jira tasks were linked to this experiment: one for form redesign, one for API validation, and one for analytics tracking. All were completed before final data analysis, confirming full scope delivery.",
      links: ["PROJ-482", "PROJ-483", "PROJ-484"],
      lastUpdated: "7 Nov",
    },
    {
      name: "Confluence",
      description:
        "Hypothesis document defines success as an uplift in sign-ups from 12% to 14%. Meeting log from Oct 10 confirms experiment scope approval and target confidence levels.",
      links: ["/reports/exp204-hypothesis"],
      lastUpdated: "8 Nov",
    },
    {
      name: "Slack",
      description:
        "42 Slack messages related to Variant C testing mentioned form length and microcopy clarity. Positive tone increased after the Oct 20 copy update, aligning with higher conversion data.",
      links: ["#ux-testing", "Thread 14255"],
      lastUpdated: "8 Nov",
    },
    {
      name: "Snowflake",
      description:
        "9,127 valid daily signup rows fetched from prod_signups dataset with 99.3% completeness; missing entries on Oct 20 due to CI downtime corrected via backfill.",
      links: ["Snowflake"],
      lastUpdated: "7 Nov",
    },
    {
      name: "GitHub",
      description:
        "Pull requests #256 and #258 deployed on Oct 19 introduced new form design. Conversion uplift observed within 24 hours of merge.",
      links: ["#256", "#258"],
      lastUpdated: "8 Nov",
    },
  ],
  // Notes tab data
  notes: [
    {
      date: "2 Nov 2025",
      content: "Public holiday: Melbourne cup on 4 Nov may effect the number",
      tag: "Ping",
    },
  ],

  // Text for summary generation from data sources
  getDataSourcesSummaryText() {
    return this.dataSources
      .map(
        (source) =>
          `${source.name}: ${source.description} ${
            source.links.length > 0 ? `Links: ${source.links.join(", ")}.` : ""
          } Last updated: ${source.lastUpdated}.`
      )
      .join("\n");
  },

  // Text for summary generation from notes
  getNotesSummaryText() {
    return this.notes.map((note) => `${note.date}: ${note.content}`).join("\n");
  },

  // Helper function to get all text for summary generation
  getSummaryText() {
    return {
      performance: this.performance.summaryText,
      description: this.description.summaryText,
      dataSources: this.getDataSourcesSummaryText(),
      notes: this.getNotesSummaryText(),
    };
  },
};
