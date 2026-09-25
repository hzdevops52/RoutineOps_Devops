export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export const cn = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(" ");
