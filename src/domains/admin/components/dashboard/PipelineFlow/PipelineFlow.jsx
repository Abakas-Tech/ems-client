import styles from "./PipelineFlow.module.css";

// Conversion is a cohort rate computed server-side (see
// buildPipelineWithConversion in analytic.service.js): of everyone who
// ever reached the previous stage, what % also went on to reach this one.
// Not a ratio of the two stages' current headcounts, so it can't exceed
// 100% and isn't skewed by how fast workers move through a stage.
const PipelineFlow = ({ stages = [] }) => {
  return (
    <div className={styles.flow}>
      {stages.map((stage, index) => {
        const conversion = stage.conversion ?? null;

        return (
          <div className={styles.stageWrap} key={stage.key}>
            {index > 0 && (
              <div className={styles.connector}>
                <div className={styles.connectorLine} />
                {conversion !== null && (
                  <span className={styles.conversionBadge}>{conversion}%</span>
                )}
              </div>
            )}

            <div
              className={styles.node}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className={styles.nodeIcon}>
                <i className={`bi ${stage.icon}`} />
              </div>
              <div className={styles.nodeCount}>
                {stage.count.toLocaleString()}
              </div>
              <div className={styles.nodeLabel}>{stage.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineFlow;
