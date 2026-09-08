import styles from "./PipelineFlow.module.css";

const PipelineFlow = ({ stages = [] }) => {
  return (
    <div className={styles.flow}>
      {stages.map((stage, index) => {
        const prev = stages[index - 1];
        const conversion = prev
          ? Math.round((stage.count / prev.count) * 100)
          : null;

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
