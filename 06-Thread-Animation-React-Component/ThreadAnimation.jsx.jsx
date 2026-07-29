import React, { useLayoutEffect, useEffect, useRef } from "react";
import { useThreadAnimation } from "./useThreadAnimation";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const COMPONENT_STYLES = `
  :root{
--thread-color:     #b3122e;   
    --thread-shadow:    rgba(0,0,0,.16);
    --needle-color:     #d6d6d6;  
    --needle-shade:     #8f8f8f;   
    --needle-glint:     #ffffff;
    --patch-bg:         #fffaf9;   
    --patch-border:     #b3122e;
    --label-color:      #2a1a1a;  
    --gold-fleck:       #c79a4b;

    --thread-thickness: 3px;       
    --icon-size:        40px;      
    --label-font-family: 'Caveat', cursive;  
    --label-font-size:  1.2rem;    
  }


  .embroidery-nav{
    position:relative;
    z-index:1;
    width:100%;
    max-width:980px;
    box-sizing:border-box;
  }
  .embroidery-nav *{ box-sizing:border-box; }

  .embroidery-nav .stage{
    position:relative;
    width:100%;
  
    aspect-ratio: var(--stage-w) / var(--stage-h);
  }


  .embroidery-nav svg{
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    overflow:visible;
  }

  .embroidery-nav .thread-path{
    fill:none;
    stroke:var(--thread-color);
    stroke-width:var(--thread-thickness);
    stroke-linecap:round;
    stroke-linejoin:round;
    filter:drop-shadow(0 2px 1px var(--thread-shadow));
  }

  .embroidery-nav .stage.finished .thread-path{
    animation: tensionBounce .6s ease-out 1;
    transform-origin:center;
  }
  @keyframes tensionBounce{
    0%  { transform:scaleY(1); }
    35% { transform:scaleY(1.018); }
    65% { transform:scaleY(.99); }
    100%{ transform:scaleY(1); }
  }

  .embroidery-nav .needle{
    position:absolute;
    top:0; left:0;
    width:70px; height:14px;
    margin:-7px 0 0 -8px; /* centers the eye roughly on the path point */
    pointer-events:none;
    will-change:transform;
    transition:opacity .3s ease;
    filter:drop-shadow(0 1px 2px rgba(0,0,0,.28));
  }
  .embroidery-nav .needle.hidden{ opacity:0; }
  .embroidery-nav .needle .needle-inner{ width:100%; height:100%; }


  .embroidery-nav .icons-layer{
    position:absolute; inset:0;
  }

  .embroidery-nav .stitch-icon{
    position:absolute;
    transform:translate(-50%, var(--anchor-offset, -50%)) scale(0);
    opacity:0;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:15px;
  }

  .embroidery-nav .stitch-icon.popped{
    animation:popIn .55s cubic-bezier(.34,1.56,.64,1) forwards;
  }
  @keyframes popIn{
    0%  { transform:translate(-50%, var(--anchor-offset, -50%)) scale(0) rotate(-12deg); opacity:0; }
    55% { transform:translate(-50%, var(--anchor-offset, -50%)) scale(1.18) rotate(4deg); opacity:1; }
    100%{ transform:translate(-50%, var(--anchor-offset, -50%)) scale(1) rotate(0deg); opacity:1; }
  }

  .embroidery-nav .icon-inner{
    width:var(--icon-size);
    height:var(--icon-size);
    border-radius:50%;
    background:var(--patch-bg);
    border:1.5px dashed var(--patch-border);
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow:0 3px 8px rgba(0,0,0,.12), inset 0 0 0 1px rgba(179,18,46,.05);
  }
  .embroidery-nav .icon-inner svg{
    width:56%; height:56%;
    position:static;
    stroke:var(--label-color);
    fill:none;
    stroke-width:1.6;
    stroke-linecap:round;
    stroke-linejoin:round;
  }

  .embroidery-nav .stitch-label{
    font-family:var(--label-font-family);
    font-size:var(--label-font-size);
    font-weight:500;
    color:var(--label-color);
    opacity:0;
    white-space:nowrap;
  }
  .embroidery-nav .stitch-label.visible{
    animation:labelFade .6s ease forwards;
  }
  @keyframes labelFade{
    from{ opacity:0; transform:translateY(4px); }
    to  { opacity:1; transform:translateY(0); }
  }

  .embroidery-nav a.stitch-hit{
    position:absolute;
    inset:0;
    display:block;
    border-radius:50%;
  }
  .embroidery-nav a.stitch-hit:focus-visible{
    outline:2px solid var(--gold-fleck);
    outline-offset:4px;
  }

  @media (prefers-reduced-motion: reduce){
    .embroidery-nav .stitch-icon,
    .embroidery-nav .stitch-label,
    .embroidery-nav .stage.finished .thread-path{
      animation:none !important;
    }
  }

  @media (max-width:640px){
    .embroidery-nav{ --icon-size:38px; }
    .embroidery-nav .stitch-label{ font-size:calc(var(--label-font-size) * 0.815); }
  }
`;

function ThreadAnimation({
  icons = [],
  threadColor = "#b3122e",
  threadThickness = 3,
  needleColor = "#dcdcdc",
  needleVisible = true,

  iconSize = "46px",
  iconBgColor = "#fffaf9",
  iconBorderColor = "#b3122e",
  labelColor = "#2a1a1a",
  labelFontFamily = "'Caveat', cursive",
  labelFontSize = "1rem",

  speed = 4800,
  direction = "rtl",
  autoplay = true,
  loop = false,
}) {
  const navRef = useRef(null);
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const needleRef = useRef(null);
  const iconRefs = useRef([]);
  const labelRefs = useRef([]);

  const iconRefCallbacks = useRef([]);
  const labelRefCallbacks = useRef([]);
  function getIconRefCallback(i) {
    if (!iconRefCallbacks.current[i]) {
      iconRefCallbacks.current[i] = (el) => {
        iconRefs.current[i] = el;
      };
    }
    return iconRefCallbacks.current[i];
  }
  function getLabelRefCallback(i) {
    if (!labelRefCallbacks.current[i]) {
      labelRefCallbacks.current[i] = (el) => {
        labelRefs.current[i] = el;
      };
    }
    return labelRefCallbacks.current[i];
  }

  const cfg = {
    threadColor: threadColor || "#b3122e",
    threadThickness: parseFloat(threadThickness) || 3,
    needleColor: needleColor || "#dcdcdc",
    needleVisible: needleVisible !== false,
    speed: parseInt(speed, 10) || 4800,
    direction: direction || "rtl",
    autoplay: autoplay !== false,
    loop: loop === true,
    iconSize: /px|%/.test(String(iconSize)) ? iconSize : iconSize + "px",
    iconBgColor: iconBgColor || "#fffaf9",
    iconBorderColor: iconBorderColor || "#b3122e",
    labelColor: labelColor || "#2a1a1a",
    labelFontFamily: labelFontFamily || "'Caveat', cursive",
    labelFontSize: labelFontSize || "1.2rem",
  };

  useIsomorphicLayoutEffect(() => {
    const STYLE_ID = "embroidery-nav-styles";
    if (document.getElementById(STYLE_ID)) return;
    const styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = COMPONENT_STYLES;
    document.head.appendChild(styleEl);
  }, []);

  const { iconData, isReady } = useThreadAnimation({
    navRef,
    stageRef,
    svgRef,
    pathRef,
    needleRef,
    iconRefs,
    labelRefs,
    cfg,
    icons,
  });

  return (
    <nav
      ref={navRef}
      className="embroidery-nav"
      aria-label="Site navigation"
      style={{
        "--thread-color": cfg.threadColor,
        "--thread-thickness": cfg.threadThickness + "px",
        "--needle-color": cfg.needleColor,
        "--icon-size": cfg.iconSize,
        "--patch-bg": cfg.iconBgColor,
        "--patch-border": cfg.iconBorderColor,
        "--label-color": cfg.labelColor,
        "--label-font-family": cfg.labelFontFamily,
        "--label-font-size": cfg.labelFontSize,
        visibility: isReady ? "visible" : "hidden",
      }}
    >
      <div className="stage" ref={stageRef}>
        <svg
          ref={svgRef}
          viewBox="0 0 0 0"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="thread-path" ref={pathRef} d=""></path>
        </svg>

        <div
          className={`needle${cfg.needleVisible ? "" : " hidden"}`}
          ref={needleRef}
          aria-hidden="true"
        >
          <svg
            className="needle-inner"
            viewBox="0 0 70 14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="6"
              y1="7"
              x2="70"
              y2="7"
              stroke="var(--needle-shade)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="6.2"
              x2="70"
              y2="6.2"
              stroke="var(--needle-color)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <ellipse
              cx="9"
              cy="7"
              rx="5.5"
              ry="3.2"
              fill="none"
              stroke="var(--needle-color)"
              strokeWidth="1.6"
            />
            <circle cx="9" cy="7" r="1" fill="var(--needle-glint)" />
            <polygon points="70,7 62,4.6 62,9.4" fill="var(--needle-color)" />
          </svg>
        </div>

        <div className="icons-layer">
          {iconData.map((icon, i) => (
            <div
              key={icon.id}
              className="stitch-icon"
              ref={getIconRefCallback(i)}
              style={{ left: `${icon.leftPct}%`, top: `${icon.topPct}%` }}
            >
              <div className="icon-inner">
                {icon.icon}
                <a
                  className="stitch-hit"
                  href={icon.href || "#"}
                  aria-label={icon.label}
                ></a>
              </div>
              <span className="stitch-label" ref={getLabelRefCallback(i)}>
                {icon.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default ThreadAnimation;
