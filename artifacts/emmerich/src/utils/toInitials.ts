export function toInitials(raw: string): string {
  let s = raw.trim();
  if (s.includes("@")) {
    s = s.split("@")[0];
  }
  s = s.replace(/\d+$/, "");
  const segments = s.split(/[.\-_\s]+/).filter(Boolean);
  const initials = segments.slice(0, 3).map((seg) => seg[0].toUpperCase());
  return initials.join(".") + ".";
}
