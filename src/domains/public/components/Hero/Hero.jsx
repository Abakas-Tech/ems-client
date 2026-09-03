import styles from "./Hero.module.css";

// The company's verified primary tagline, in both languages. Deliberately
// static rather than translated per-headline — the client's company profile
// only provides an approved Amharic version of this one core tagline, so
// making up a translation for anything else risks shipping wording the
// client never signed off on.
const TAGLINE_EN =
  "Connecting People. Creating Opportunities. Building Better Futures.";
const TAGLINE_AM = "ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።";

const STATS = [
  { value: "12,000+", label: "Ethiopians placed abroad" },
  { value: "3", label: "destination countries" },
  { value: "100%", label: "licensed and contract-checked" },
];

// Destination nodes for the route illustration, positioned by hand in the
// artwork's 560x700 coordinate space. Origin is Addis Ababa.
const ORIGIN = { x: 96, y: 566, label: "Addis Ababa" };
const ROUTES = [
  {
    id: "amman",
    label: "Amman",
    node: { x: 268, y: 196 },
    control: { x: 176, y: 322 },
  },
  {
    id: "riyadh",
    label: "Riyadh",
    node: { x: 334, y: 372 },
    control: { x: 220, y: 418 },
  },
  {
    id: "kuwait",
    label: "Kuwait City",
    node: { x: 384, y: 292 },
    control: { x: 252, y: 372 },
  },
  {
    id: "dubai",
    label: "Dubai",
    node: { x: 432, y: 456 },
    control: { x: 300, y: 520 },
  },
];

// The plane loops along one continuous journey — Addis Ababa -> Amman ->
// Riyadh -> Kuwait City -> Dubai -> back to Addis Ababa — so it visits
// every destination instead of only the Amman leg. The first leg reuses
// its hand-tuned control point from ROUTES; the legs between destinations
// get a gentle perpendicular bow so the whole trip reads as one smooth
// flight, and the return leg arcs south of all routes so the loop closes
// seamlessly (the plane flies home instead of teleporting back to start).
const buildFlightPath = () => {
  const segments = [`M${ORIGIN.x},${ORIGIN.y}`];

  ROUTES.forEach((route, index) => {
    const from = index === 0 ? ORIGIN : ROUTES[index - 1].node;
    const to = route.node;
    let control;

    if (index === 0) {
      control = route.control;
    } else {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      const bow = length * 0.22;
      control = {
        x: +((from.x + to.x) / 2 + (-dy / length) * bow).toFixed(1),
        y: +((from.y + to.y) / 2 + (dx / length) * bow).toFixed(1),
      };
    }

    segments.push(`Q${control.x},${control.y} ${to.x},${to.y}`);
  });

  // Return leg home (Dubai -> Addis Ababa), arcing below all routes.
  segments.push(`Q300,640 ${ORIGIN.x},${ORIGIN.y}`);

  return segments.join(" ");
};

const FLIGHT_PATH = buildFlightPath();

function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Ethiopia to the Gulf, done right</p>

          <h1 className={styles.heading}>
            <span className={styles.line}>Work abroad,</span>
            <span className={styles.line}>without the guesswork.</span>
          </h1>

          <p className={styles.sub}>
            ALETISALAT places skilled Ethiopians in verified jobs across Saudi
            Arabia, Jordan, and the Gulf — every contract checked, every step
            explained before you sign.
          </p>

          {/* Static bilingual tagline — same on every view; see note above the constants. */}
          <p className={styles.tagline} title={TAGLINE_EN}>
            {TAGLINE_AM}
          </p>

          <div className={styles.actions}>
            <a href="#contact" className={styles.btnPrimary}>
              <span>Apply now</span>
              <svg
                className={styles.btnPlane}
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d="M15 8l-13-6 4 6-4 6 13-6z" fill="currentColor" />
              </svg>
            </a>
            <a href="#about" className={styles.btnSecondary}>
              About us
            </a>
          </div>
        </div>

        <div className={styles.artwork} aria-hidden="true">
          <FlightRoutes />

          {/* Playful trust badge — a tilted "stamp", like a visa approval mark */}
          <div className={styles.stamp}>
            <span className={styles.stampRing} />
            <span className={styles.stampText}>
              Licensed
              <br />
              Agency
            </span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        {STATS.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FlightRoutes() {
  return (
    <svg
      viewBox="0 0 560 700"
      className={styles.routeSvg}
      role="img"
      aria-label="Animated map of flight routes from Addis Ababa looping through Amman, Riyadh, Kuwait City, and Dubai, flown by a plane"
    >
      <defs>
        <linearGradient id="routeGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E7C96B" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E7C96B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E7C96B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Faint radar-style arcs centered on the origin */}
      {[150, 250, 350, 450].map((r) => (
        <circle
          key={r}
          cx={ORIGIN.x}
          cy={ORIGIN.y}
          r={r}
          className={styles.ring}
        />
      ))}

      <circle
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r="60"
        fill="url(#originGlow)"
        className={styles.originPulse}
      />

      {ROUTES.map((route) => {
        const d = `M${ORIGIN.x},${ORIGIN.y} Q${route.control.x},${route.control.y} ${route.node.x},${route.node.y}`;
        return <path key={route.id} d={d} className={styles.route} />;
      })}

      {/* The full journey the plane flies, drawn over the solid legs as a
          dotted golden bead-line - so the looping route itself becomes part
          of the artwork. Reuses the .route class for the gradient stroke. */}
      <path
        d={FLIGHT_PATH}
        className={styles.route}
        style={{ strokeDasharray: "1 9", strokeWidth: 2.5, opacity: 0.9 }}
        strokeLinecap="round"
        fill="none"
      />

      {/* A handful of twinkling waypoint dots scattered along the sky for texture */}
      {[
        { x: 210, y: 260 },
        { x: 150, y: 460 },
        { x: 320, y: 250 },
        { x: 400, y: 380 },
        { x: 460, y: 340 },
        { x: 230, y: 420 },
      ].map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.6"
          className={styles.twinkle}
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}

      {/* Destination nodes, each with an expanding radar pulse ring
          (staggered per city). Uses SMIL <animate> so no CSS changes are
          needed for the effect. */}
      {ROUTES.map((route, index) => (
        <g key={`${route.id}-node`}>
          <circle
            cx={route.node.x}
            cy={route.node.y}
            r="5"
            fill="none"
            stroke="#E7C96B"
            strokeWidth="1.5"
            opacity="0"
          >
            <animate
              attributeName="r"
              values="5;16"
              dur="2.8s"
              begin={`${index * 0.7}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;0"
              dur="2.8s"
              begin={`${index * 0.7}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={route.node.x}
            cy={route.node.y}
            r="5"
            className={styles.node}
          />
          <text
            x={route.node.x + 12}
            y={route.node.y + 4}
            className={styles.nodeLabel}
          >
            {route.label}
          </text>
        </g>
      ))}

      {/* Origin node */}
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r="7" className={styles.originNode} />
      <text x={ORIGIN.x} y={ORIGIN.y + 30} className={styles.originLabel}>
        {ORIGIN.label}
      </text>

      {/* Looping plane, flown along the full journey Addis Ababa -> Amman ->
          Riyadh -> Kuwait City -> Dubai -> home to Addis Ababa. Drawn as a
          real airplane silhouette (nose pointing along +x, the direction
          offset-rotate: auto faces) with a soft golden glow that travels
          with it and a fading contrail trailing behind its tail. */}
      <g
        className={styles.plane}
        style={{
          offsetPath: `path("${FLIGHT_PATH}")`,
        }}
      >
        {/* One dial for the whole plane's size - scales the silhouette,
            its glow and its contrail together. 1 = original size. */}
        <g transform="scale(1.35)">
          {/* soft golden glow travelling with the plane */}
          <circle r="11" fill="url(#originGlow)" opacity="0.7" />

          {/* contrail: one main trail plus two short vapor streaks */}
          <path
            d="M-10 0h-4M-10 -2.4h-2.5M-10 2.4h-2.5"
            stroke="#F5F1E6"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
            fill="none"
          />

          {/* airplane silhouette: the 24-unit "flight" icon, recentered on
              (0,0) and rotated 90deg so its nose points along the path */}
          <g transform="rotate(90) scale(0.85) translate(-12 -12)">
            <path
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
              fill="#F5F1E6"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default Hero;
