import type { PathResult } from "./pathGenerator";

const CMD_REGEX = /[MLAZmlaz]/g;

export function extractCommandSequence(d: string): string {
  return (d.match(CMD_REGEX) ?? []).join("").toUpperCase();
}

export function areMorphCompatible(paths: string[]): boolean {
  if (paths.length < 2) return true;
  const first = extractCommandSequence(paths[0]);
  if (!first) return false;
  return paths.every((p) => extractCommandSequence(p) === first);
}

export type AnimationOptions = {
  duration: number;
  fill?: string;
};

function commonViewBox(results: PathResult[]): { width: number; height: number } {
  let w = 0;
  let h = 0;
  for (const r of results) {
    if (r.width > w) w = r.width;
    if (r.height > h) h = r.height;
  }
  return { width: w, height: h };
}

export function buildCssKeyframesSvg(
  results: PathResult[],
  options: AnimationOptions,
): string {
  const { duration, fill = "#3E87FF" } = options;
  const { width, height } = commonViewBox(results);
  const paths = results.map((r) => r.d).filter(Boolean);
  if (paths.length === 0) return "";

  const loop = [...paths, paths[0]];
  const steps = loop.length - 1;
  const keyframes = loop
    .map((d, i) => {
      const pct = Math.round((i / steps) * 100);
      return `    ${pct}% { d: path("${d}"); }`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
  <style>
    @keyframes convex-morph {
${keyframes}
    }
    .convex-morph {
      animation: convex-morph ${duration}s ease-in-out infinite;
    }
  </style>
  <path class="convex-morph" d="${paths[0]}" fill="${fill}"/>
</svg>`;
}

export function buildGsapMorphSnippet(
  results: PathResult[],
  options: AnimationOptions,
): string {
  const { duration, fill = "#3E87FF" } = options;
  const { width, height } = commonViewBox(results);
  const paths = results.map((r) => r.d).filter(Boolean);
  if (paths.length === 0) return "";

  const pathsJson = JSON.stringify(paths, null, 2);
  const perStep = (duration / paths.length).toFixed(2);

  return `<!-- HTML -->
<svg id="convex-morph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
  <path fill="${fill}" d="${paths[0]}"/>
</svg>

<!--
  GSAP + MorphSVGPlugin (seit der Webflow-Übernahme 2024 kostenlos).
  Auf Webflow: Site Settings → Custom Code → vor </body> einfügen.
-->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/MorphSVGPlugin.min.js"></script>
<script>
  gsap.registerPlugin(MorphSVGPlugin);

  const paths = ${pathsJson};
  const target = "#convex-morph path";
  const stepDuration = ${perStep};

  const tl = gsap.timeline({ repeat: -1 });
  for (let i = 1; i < paths.length; i++) {
    tl.to(target, { morphSVG: paths[i], duration: stepDuration, ease: "power2.inOut" });
  }
  tl.to(target, { morphSVG: paths[0], duration: stepDuration, ease: "power2.inOut" });
</script>`;
}
