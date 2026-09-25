import { DAYS } from "./constants.js";

export function ensureString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    const err = new Error(`Invalid ${field}`);
    err.status = 400;
    throw err;
  }
  return value.trim();
}

export function normalizeDepartment(value) {
  return ensureString(value, "department").toUpperCase();
}

export function sanitizeHolidays(value) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(DAYS);
  const normalized = [];
  value.forEach((dayRaw) => {
    if (typeof dayRaw !== "string") return;
    const trimmed = dayRaw.trim();
    if (!trimmed) return;
    const match = Array.from(allowed).find((d) => d.toLowerCase() === trimmed.toLowerCase());
    if (match && !normalized.includes(match)) normalized.push(match);
  });
  return normalized;
}

export function ensureNumber(value, field, { min, max } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    const err = new Error(`Invalid ${field}`);
    err.status = 400;
    throw err;
  }
  if (min != null && n < min) {
    const err = new Error(`${field} must be >= ${min}`);
    err.status = 400;
    throw err;
  }
  if (max != null && n > max) {
    const err = new Error(`${field} must be <= ${max}`);
    err.status = 400;
    throw err;
  }
  return n;
}

export function ensureArray(value, field) {
  if (!Array.isArray(value)) {
    const err = new Error(`Invalid ${field}, expected array`);
    err.status = 400;
    throw err;
  }
  return value;
}

export function ensureObject(value, field) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    const err = new Error(`Invalid ${field}, expected object`);
    err.status = 400;
    throw err;
  }
  return value;
}
