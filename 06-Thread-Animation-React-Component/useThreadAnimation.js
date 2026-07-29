import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import {
  PATH_SETTINGS,
  buildThreadPath,
  reversePathD,
  easeInOutCubic
} from './ThreadHelpers';


const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;


export function useThreadAnimation({
  navRef, stageRef, svgRef, pathRef, needleRef, iconRefs, labelRefs, cfg, icons
}) {
  const [iconData, setIconData] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const rafRef = useRef(null);
  const builtRef = useRef(null);


  useIsomorphicLayoutEffect(() => {
    const svg = svgRef.current;
    const pathEl = pathRef.current;
    const stage = stageRef.current;
    if (!svg || !pathEl || !stage) return;

    if (!icons || icons.length === 0) {
      setIconData([]);
      setIsReady(true); 
      return;
    }

   
    let built;
    if (PATH_SETTINGS.customPath && PATH_SETTINGS.customViewBox) {
      const [, , w, h] = PATH_SETTINGS.customViewBox.split(' ').map(Number);
      built = {
        d: PATH_SETTINGS.customPath,
        width: w, height: h,
        anchors: icons.map(i => i.anchor || { x: w / 2, y: h / 2 })
      };
    } else {
      built = buildThreadPath(PATH_SETTINGS, icons, cfg.direction);
      
      built.d = reversePathD(built.d);
    }
    builtRef.current = built;

    svg.setAttribute('viewBox', `0 0 ${built.width} ${built.height}`);
    stage.style.setProperty('--stage-w', built.width);
    stage.style.setProperty('--stage-h', built.height);
    pathEl.setAttribute('d', built.d);

    const totalLen = pathEl.getTotalLength();
    built.totalLen = totalLen; 
    pathEl.style.strokeDasharray = totalLen;
    pathEl.style.strokeDashoffset = totalLen;


    const SAMPLES = 600;
    const sampled = [];
    for (let s = 0; s <= SAMPLES; s++) {
      sampled.push(pathEl.getPointAtLength((s / SAMPLES) * totalLen));
    }
    function nearestFraction(anchor) {
      let bestDist = Infinity, bestIdx = 0;
      sampled.forEach((p, idx) => {
        const dist = (p.x - anchor.x) ** 2 + (p.y - anchor.y) ** 2;
        if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
      });
      return bestIdx / SAMPLES;
    }

  
    const nextIconData = icons.map((icon, i) => {
      const anchor = built.anchors[i];
      const fraction = nearestFraction(anchor);
      return {
        id: icon.id,
        label: icon.label,
        href: icon.href,
        icon: icon.icon,
        leftPct: (anchor.x / built.width) * 100,
        topPct: (anchor.y / built.height) * 100,
        fraction
      };
    });

    setIconData(nextIconData);
   
  }, [cfg.direction, icons]);

  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current;
    const stage = stageRef.current;
    const pathEl = pathRef.current;
    const needleEl = needleRef.current;
    const built = builtRef.current;
    if (!nav || !stage || !pathEl || !needleEl || !built || iconData.length === 0) return;

   
    const totalLen = built.totalLen;

    const iconEls = iconData.map((d, i) => ({
      wrap: iconRefs.current[i],
      label: labelRefs.current[i],
      fraction: d.fraction,
      popped: false
    }));

    function resolveLabelCollisions() {
      const stageWidth = stage.clientWidth;
      if (!stageWidth) return;

      const MIN_GAP = 10; 
      const items = iconData
        .map((d, i) => ({
          wrap: iconRefs.current[i],
          label: labelRefs.current[i],
          centerX: (d.leftPct / 100) * stageWidth
        }))
        .filter(item => item.label && item.wrap);
      if (items.length === 0) return;

     
      items.forEach(item => { item.label.style.marginTop = ''; });

      
      const naturalWrapHeight = items[0].wrap.offsetHeight;
      if (naturalWrapHeight) {
        stage.style.setProperty('--anchor-offset', `${-naturalWrapHeight / 2}px`);
      }

      items.forEach(item => {
        const w = item.label.offsetWidth;
        item.left = item.centerX - w / 2;
        item.right = item.centerX + w / 2;
      });
      items.sort((a, b) => a.centerX - b.centerX);

      const rowHeight = (items[0].label.offsetHeight || 22) + 6;
      const tierRightEdge = []; 

      items.forEach(item => {
        let tier = 0;
        while (tierRightEdge[tier] !== undefined && item.left < tierRightEdge[tier] + MIN_GAP) {
          tier++;
        }
        tierRightEdge[tier] = item.right;
        if (tier > 0) {
          item.label.style.marginTop = `${tier * rowHeight}px`;
        }
      });
    }
    resolveLabelCollisions();

    
    function positionNeedleAtStart() {
      const p = pathEl.getPointAtLength(0);
      const ahead = pathEl.getPointAtLength(Math.min(totalLen, 1));
      const angle = Math.atan2(ahead.y - p.y, ahead.x - p.x) * (180 / Math.PI);
      needleEl.style.transform =
        `translate(${(p.x / built.width) * stage.clientWidth}px, ${(p.y / built.height) * stage.clientHeight}px) rotate(${angle}deg)`;
    }
    positionNeedleAtStart();
    needleEl.style.opacity = cfg.needleVisible ? '1' : '0';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      
      pathEl.style.strokeDashoffset = 0;
      needleEl.classList.add('hidden');
      iconEls.forEach(({ wrap, label }) => {
        if (wrap) wrap.classList.add('popped');
        if (label) label.classList.add('visible');
      });
      setIsReady(true);
      return;
    }

    let disposed = false;

    function play() {
      iconEls.forEach(e => {
        e.popped = false;
        if (e.wrap) e.wrap.classList.remove('popped');
        if (e.label) e.label.classList.remove('visible');
      });
      stage.classList.remove('finished');
      pathEl.style.strokeDashoffset = totalLen;
      needleEl.style.opacity = cfg.needleVisible ? '1' : '0';

      const start = performance.now();

      function frame(now) {
        if (disposed) return;
        const t = Math.min(1, (now - start) / cfg.speed);
        const progress = easeInOutCubic(t);

        pathEl.style.strokeDashoffset = totalLen * (1 - progress);

        const len = progress * totalLen;
        const p = pathEl.getPointAtLength(len);
        const ahead = pathEl.getPointAtLength(Math.min(totalLen, len + 1));
        const angle = Math.atan2(ahead.y - p.y, ahead.x - p.x) * (180 / Math.PI);
        
        needleEl.style.transform =
          `translate(${(p.x / built.width) * stage.clientWidth}px, ${(p.y / built.height) * stage.clientHeight}px) rotate(${angle}deg)`;

        iconEls.forEach(e => {
          if (!e.popped && progress >= e.fraction) {
            e.popped = true;
            if (e.wrap) e.wrap.classList.add('popped');
            setTimeout(() => { if (!disposed && e.label) e.label.classList.add('visible'); }, 260);
          }
        });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          stage.classList.add('finished');
          if (cfg.needleVisible) {
            setTimeout(() => { if (!disposed) needleEl.style.opacity = '0'; }, 900);
          }
          if (cfg.loop) {
            setTimeout(() => { if (!disposed) play(); }, 1800);
          }
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    }

  
    const handleResize = () => { resolveLabelCollisions(); };
    window.addEventListener('resize', handleResize);

    let io = null;
    let startRaf1 = null;
    let startRaf2 = null;


    setIsReady(true);

    if (cfg.autoplay) {
    
      startRaf1 = requestAnimationFrame(() => {
        startRaf2 = requestAnimationFrame(play);
      });
    } else {
      io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { play(); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(nav);
    }

    return () => {
      disposed = true;
      if (startRaf1) cancelAnimationFrame(startRaf1);
      if (startRaf2) cancelAnimationFrame(startRaf2);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      if (io) io.disconnect();
    };
    
  }, [iconData, cfg.autoplay, cfg.loop, cfg.needleVisible, cfg.speed, cfg.direction]);

  return { iconData, isReady };
}