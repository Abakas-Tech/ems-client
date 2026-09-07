import { FaShieldAlt, FaMapMarkerAlt } from "react-icons/fa";
import styles from "./Hero.module.css";


const TAGLINE_EN =
  "Connecting People. Creating Opportunities. Building Better Futures.";
const TAGLINE_AM = "ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።";

const SIDE_STATS = [
  { value: "12,000+", label: "Ethiopians placed abroad" },
  { value: "100%", label: "licensed and contract-checked" },
];

const DESTINATIONS = [
  { id: "addis", label: "Addis Ababa", x: 345, y: 255, isOrigin: true },
  { id: "amman", label: "Amman", x: 410, y: 208 },
  { id: "riyadh", label: "Riyadh", x: 415, y: 255 },
  { id: "dubai", label: "Dubai", x: 435, y: 265 },
];

function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            Ethiopia to the Gulf, done right
          </span>

          <h1 className={styles.heading}>
            Work abroad, without the guesswork.
          </h1>

          <p className={styles.sub}>
            Vision Recruitment Agency places skilled Ethiopians in verified jobs
            across Saudi Arabia, Jordan, and the Gulf — every contract checked,
            every step explained before you sign.
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

          <div className={styles.statsRow}>
            {SIDE_STATS.map((stat, i) => (
              <span className={styles.statItem} key={stat.label}>
                {i > 0 && (
                  <span className={styles.statDivider} aria-hidden="true" />
                )}
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.globeSide}>
          <div className={styles.globeWrap}>
            <WorldGlobe />

            {/* Trust badge — now a pill, not a circular stamp, per the
                "no decorative circles" requirement. */}
            <div className={styles.licenseBadge}>
              <FaShieldAlt />
              <span>Licensed Agency</span>
            </div>

            <div className={styles.destinationChip}>
              <FaMapMarkerAlt />
              <span>3 destination countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// A clean, realistic world-globe illustration centered on the Horn of
// Africa / Arabian Peninsula — the exact recruitment corridor this agency
// operates in. Real continent silhouettes (simplified but geographically
// shaped), lit like a sphere (light-blue atmosphere, gold-lit land, black
// limb-darkening at the edges), with animated gold destination pins. No
// orbit rings, no decorative circles, no abstract network — the globe
// itself is the only "circle" on screen, and it exists because a globe is
// a sphere.
function WorldGlobe() {
  const cx = 280;
  const cy = 280;
  const r = 200;

  return (
    <svg
      viewBox="0 0 560 560"
      className={styles.globeSvg}
      role="img"
      aria-label="World globe centered on East Africa and the Arabian Peninsula, with animated pins marking Addis Ababa, Amman, Riyadh, and Dubai"
    >
      <defs>
        {/* Sphere shading: lit upper-left, deep near-black at the limb */}
        <radialGradient id="oceanShade" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#d9f0fa" />
          <stop offset="35%" stopColor="#7ec2e3" />
          <stop offset="70%" stopColor="#2c6f92" />
          <stop offset="100%" stopColor="#05080d" />
        </radialGradient>

        {/* Land: gold-lit, matching the brand accent instead of generic green */}
        <linearGradient id="landShade" x1="15%" y1="10%" x2="90%" y2="95%">
          <stop offset="0%" stopColor="#f2d488" />
          <stop offset="45%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#5c4419" />
        </linearGradient>

        {/* Uniform limb-darkening applied over everything, sphere-clipped */}
        <radialGradient id="limbShade" cx="50%" cy="50%" r="52%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="72%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>

        {/* Soft glossy sunlight glint, upper-left */}
        <radialGradient id="specular" cx="30%" cy="20%" r="26%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Atmosphere halo, well outside the sphere edge — a real glow,
            not a stroked ring */}
        <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#8fd3f0" stopOpacity="0" />
          <stop offset="92%" stopColor="#8fd3f0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8fd3f0" stopOpacity="0" />
        </radialGradient>

        <clipPath id="sphereClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Atmosphere glow behind the sphere */}
      <circle cx={cx} cy={cy} r={r * 1.16} fill="url(#atmosphere)" />

      {/* The sphere itself */}
      <g clipPath="url(#sphereClip)">
        <circle cx={cx} cy={cy} r={r} fill="url(#oceanShade)" />

        {/* Continents — simplified but recognizable silhouettes */}
        <g fill="url(#landShade)" stroke="#3d2e10" strokeWidth="0.6">
          {/* Africa */}
          <path
            d="M200,160
               C230,145 270,140 300,150
               C320,165 315,185 310,200
               C330,215 355,230 365,255
               C358,275 340,290 325,310
               C315,335 305,360 290,385
               C280,405 265,425 245,435
               C225,420 215,395 210,370
               C195,345 175,325 165,300
               C160,275 170,250 180,225
               C185,205 190,180 200,160 Z"
          />
          {/* Madagascar */}
          <path
            d="M345,345 C352,350 355,365 350,380
               C346,392 336,388 333,372
               C331,358 338,342 345,345 Z"
          />
          {/* Arabian Peninsula */}
          <path
            d="M385,225
               C400,215 420,215 435,225
               C448,235 452,255 445,275
               C438,292 420,300 405,295
               C392,290 385,275 383,258
               C381,242 378,232 385,225 Z"
          />
          {/* Levant / western Asia sliver */}
          <path
            d="M378,205
               C395,195 420,192 440,198
               C455,205 460,215 452,222
               C438,228 415,222 398,220
               C386,218 375,215 378,205 Z"
          />
          {/* Southern Europe hint */}
          <path
            d="M245,110
               C265,102 290,102 305,112
               C312,122 305,132 288,133
               C268,134 250,128 245,118 Z"
          />
          {/* South Asia hint */}
          <path
            d="M460,175
               C472,168 480,178 478,195
               C476,212 465,222 452,215
               C443,208 445,190 452,180
               C455,177 458,176 460,175 Z"
          />
        </g>

        {/* Sphere curvature shading + gloss, on top of the land/ocean */}
        <circle cx={cx} cy={cy} r={r} fill="url(#limbShade)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#specular)" />
      </g>

      {/* Sphere edge — a single thin line so it reads as a globe silhouette,
          not a drawn "border ring" */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(5,8,13,0.4)"
        strokeWidth="1"
      />

      {/* Destination pins, each with a gentle fade-in, a soft location
          pulse, and a small legible label */}
      {DESTINATIONS.map((dest, index) => (
        <g
          key={dest.id}
          className={styles.pinGroup}
          style={{ animationDelay: `${index * 0.25}s` }}
        >
          {/* Pulse ring at the pin's ground point */}
          <circle
            cx={dest.x}
            cy={dest.y}
            r="4"
            className={styles.pinPulse}
            style={{ animationDelay: `${index * 0.5}s` }}
          />

          {/* Pin marker */}
          <g transform={`translate(${dest.x}, ${dest.y}) scale(0.55)`}>
            <path
              d="M0,0 C-8,-14 -14,-22 -14,-30 C-14,-41 -6,-48 0,-48
                 C6,-48 14,-41 14,-30 C14,-22 8,-14 0,0 Z"
              fill={dest.isOrigin ? "#e7c96b" : "#c9a227"}
              stroke="#3d2e10"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="-30" r="5.5" fill="#1a1206" />
          </g>

          {/* Label chip, offset above the pin */}
          <g transform={`translate(${dest.x}, ${dest.y - 44})`}>
            <rect
              x={-(dest.label.length * 3.6 + 8)}
              y="-11"
              width={dest.label.length * 7.2 + 16}
              height="20"
              rx="10"
              className={styles.pinLabelBg}
            />
            <text textAnchor="middle" y="3" className={styles.pinLabel}>
              {dest.label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

export default Hero;
