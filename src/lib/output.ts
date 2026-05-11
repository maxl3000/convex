import type { PathResult } from "./pathGenerator";

export function toSvgMarkup(
  result: PathResult,
  options: { fill?: string; preserveAspectRatio?: string } = {},
): string {
  const fill = options.fill ?? "currentColor";
  const par = options.preserveAspectRatio ?? "none";
  const { d, width, height } = result;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="${par}" width="100%" height="100%"><path d="${d}" fill="${fill}"/></svg>`;
}

export function toCssClipPath(result: PathResult): string {
  return `clip-path: path('${result.d}');`;
}

export function toPathD(result: PathResult): string {
  return result.d;
}

export function downloadSvg(result: PathResult, filename = "shape.svg") {
  const blob = new Blob([toSvgMarkup(result)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
