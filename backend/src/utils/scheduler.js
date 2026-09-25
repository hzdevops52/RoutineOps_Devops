import { DAYS } from "./constants.js";
import { shuffleArray } from "./shuffle.js";

// Generate timetable using backtracking with heuristics (MRV + spreading + teacher occupancy)
export function generateTimetable({ department, year, periodsPerDay, sections }) {
  const days = DAYS;
  const dayCount = days.length;

  // Precompute available slots per section (exclude holidays)
  const sectionSlots = sections.map((sec) => {
    const holidaySet = new Set(sec.holidays || []);
    const allowedDays = days.filter((d) => !holidaySet.has(d));
    const timetable = {};
    days.forEach((d) => (timetable[d] = Array.from({ length: periodsPerDay }, () => null)));
    const subjects = sec.subjects.map((s) => ({
      subjectId: String(s.subjectId),
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      teacherId: String(s.teacherId),
      remaining: Number(s.classesPerWeek || 0),
      lastDayPlaced: null,
    }));
    return { name: sec.name, allowedDays, timetable, subjects };
  });

  // Teacher occupancy: day->period->Set(teacherId)
  const teacherBusy = new Map();
  const busyAt = (day, period) => {
    if (!teacherBusy.has(day)) teacherBusy.set(day, new Map());
    const mp = teacherBusy.get(day);
    if (!mp.has(period)) mp.set(period, new Set());
    return mp.get(period);
  };

  // Build variable list: each required class occurrence is a variable
  const variables = [];
  sectionSlots.forEach((sec, sIdx) => {
    sec.subjects.forEach((subj, subjIdx) => {
      for (let k = 0; k < subj.remaining; k++) {
        variables.push({ sIdx, subjIdx });
      }
    });
  });

  // MRV ordering re-evaluated during search
  function domainFor(varObj) {
    const { sIdx, subjIdx } = varObj;
    const sec = sectionSlots[sIdx];
    const subj = sec.subjects[subjIdx];
    const domain = [];
    for (const day of sec.allowedDays) {
      for (let p = 0; p < periodsPerDay; p++) {
        // slot free for section and teacher not busy
        if (!sec.timetable[day][p]) {
          const busy = busyAt(day, p);
          if (!busy.has(subj.teacherId)) {
            // spreading heuristic: avoid same subject on consecutive days
            const penalty = subj.lastDayPlaced && subj.lastDayPlaced === day ? 2 : 0;
            domain.push({ day, period: p, penalty });
          }
        }
      }
    }
    // sort by penalty then middle periods first to avoid clustering at edges
    return domain.sort((a, b) => a.penalty - b.penalty || Math.abs(a.period - (periodsPerDay / 2)) - Math.abs(b.period - (periodsPerDay / 2)));
  }

  function selectUnassigned(vars) {
    let best = null;
    let bestDomain = null;
    for (const v of vars) {
      const d = domainFor(v);
      if (best == null || d.length < bestDomain.length) {
        best = v;
        bestDomain = d;
        if (d.length === 0) break;
      }
    }
    return { v: best, domain: bestDomain || [] };
  }

  const assignment = [];
  function backtrack(unassigned) {
    if (unassigned.length === 0) return true;
    const { v, domain } = selectUnassigned(unassigned);
    if (!v || domain.length === 0) return false;
    const idx = unassigned.indexOf(v);
    unassigned.splice(idx, 1);
    const sec = sectionSlots[v.sIdx];
    const subj = sec.subjects[v.subjIdx];

    for (const choice of domain) {
      const busy = busyAt(choice.day, choice.period);
      // assign
      sec.timetable[choice.day][choice.period] = {
        subjectId: subj.subjectId,
        subjectName: subj.subjectName,
        subjectCode: subj.subjectCode,
        teacherId: subj.teacherId,
        day: choice.day,
        period: choice.period,
      };
      busy.add(subj.teacherId);
      const prevLast = subj.lastDayPlaced;
      subj.lastDayPlaced = choice.day;

      if (backtrack(unassigned)) return true;

      // revert
      sec.timetable[choice.day][choice.period] = null;
      busy.delete(subj.teacherId);
      subj.lastDayPlaced = prevLast;
    }

    unassigned.splice(idx, 0, v);
    return false;
  }

  // start with shuffled variables to add determinism via seed
  const seed = hashSeed(`${department}-${year}-${periodsPerDay}-${sections.map((s)=>s.name).join('-')}`);
  const shuffledVars = shuffleArray(variables, seed);
  backtrack(shuffledVars);

  // compute unsatisfied
  const unsatisfied = [];
  sectionSlots.forEach((sec) => {
    const placedCount = new Map();
    for (const day of days) {
      sec.timetable[day].forEach((slot) => {
        if (slot) {
          const key = `${slot.subjectId}`;
          placedCount.set(key, (placedCount.get(key) || 0) + 1);
        }
      });
    }
    sec.subjects.forEach((subj) => {
      const count = placedCount.get(`${subj.subjectId}`) || 0;
      const rem = Math.max(0, subj.remaining - count);
      if (rem > 0) unsatisfied.push({ sectionName: sec.name, subjectName: subj.subjectName, remaining: rem });
    });
  });

  return {
    sections: sectionSlots.map((sec) => ({ name: sec.name, timetable: sec.timetable })),
    unsatisfied,
  };
}

function hashSeed(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
