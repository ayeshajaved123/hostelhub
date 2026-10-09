// Shared domain logic: cross-check engine + late-return detector.
export const todayStr = (d) => (d || new Date()).toISOString().slice(0, 10);
export const nowTime = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};
export const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// Night attendance cross-check against the gate register.
// Returns flag objects: { type, studentId, text }
export function crossCheck(date, records, gateLog, students) {
  const flags = [];
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  gateLog.filter((g) => g.date === date).forEach((g) => {
    const mark = records[g.studentId];
    const s = byId[g.studentId] || {};
    const stillOut = g.exitTime && !g.entryTime;
    if (stillOut && mark === "present") {
      flags.push({
        type: "mismatch",
        studentId: g.studentId,
        text: `${s.name} (${s.rollNo}) marked PRESENT in night attendance but no return in gate register (exited ${g.exitTime}).`
      });
    }
    if (!stillOut && g.entryTime && mark === "absent") {
      flags.push({
        type: "mismatch",
        studentId: g.studentId,
        text: `${s.name} (${s.rollNo}) marked ABSENT in night attendance but gate register shows return at ${g.entryTime}.`
      });
    }
    if (s.category === "guardian" && g.exitTime && (!g.accompaniedBy || /self/i.test(g.accompaniedBy))) {
      flags.push({
        type: "guardian",
        studentId: g.studentId,
        text: `${s.name} (${s.rollNo}) is Guardian-category but exited without a recorded guardian companion.`
      });
    }
  });
  return flags;
}

// Late-return detector: approved/expected return passed, still outside.
export function detectLate(date, now, gateLog, students, permissions) {
  const alerts = [];
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  gateLog.filter((g) => g.date === date && g.exitTime && !g.entryTime).forEach((g) => {
    const s = byId[g.studentId] || {};
    const perm = permissions.find((p) => p.id === g.permissionId);
    const expected = perm?.expectedReturn || "22:00";
    if (now > expected) {
      alerts.push({
        type: "late",
        studentId: g.studentId,
        date, time: now,
        text: `${s.name} (${s.rollNo}) is late. Expected back by ${expected}, exited ${g.exitTime} with ${g.accompaniedBy || "—"}.`,
        acknowledged: false
      });
    }
  });
  return alerts;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const heads = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((ln) => {
    // simple CSV split (no quoted commas)
    const vals = ln.split(",").map((v) => v.trim());
    const o = {};
    heads.forEach((h, i) => { o[h] = vals[i] || ""; });
    return {
      name: o.name || "",
      rollNo: o.rollno || o["roll no"] || "",
      phone: o.phone || "",
      category: (o.category || "self").toLowerCase().startsWith("g") ? "guardian" : "self",
      department: o.department || "",
      room: o.room || "",
      guardianName: o.guardianname || o["guardian name"] || "",
      guardianPhone: o.guardianphone || o["guardian phone"] || "",
      homePhone: o.homephone || o["home phone"] || o.homeemergency || "",
      medical: o.medical || ""
    };
  }).filter((r) => r.name);
}
