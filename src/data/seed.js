// Demo seed data — used in demo mode and by the "Load demo data" seeder for Firestore.
export function todayStr(d) {
  const x = d || new Date();
  return x.toISOString().slice(0, 10);
}

export function seedData() {
  const t = todayStr();
  return {
    students: [
      { id: "st_a1", name: "Mahnoor Fatima", rollNo: "RWU-21-032", phone: "0332-7788990", category: "guardian", department: "Computer Science", room: "A-101", guardianName: "Tariq Mehmood", guardianPhone: "0332-7788911", homePhone: "051-4441234", medical: "Asthma — inhaler in drawer", role: "student" },
      { id: "st_a2", name: "Areeba Khan", rollNo: "RWU-22-014", phone: "0301-4455667", category: "guardian", department: "IT", room: "A-102", guardianName: "Imran Fatima", guardianPhone: "0301-4455660", homePhone: "051-4445678", medical: "", role: "student" },
      { id: "st_a3", name: "Sana Ali", rollNo: "RWU-21-045", phone: "0345-1122334", category: "self", department: "Software Engineering", room: "A-103", guardianName: "Naveed Ahmed", guardianPhone: "0345-1122300", homePhone: "051-4457890", medical: "Peanut allergy", role: "cr" },
      { id: "st_a4", name: "Laiba Noor", rollNo: "RWU-22-010", phone: "0300-9988776", category: "guardian", department: "Data Science", room: "A-104", guardianName: "Tariq Aziz", guardianPhone: "0300-9988700", homePhone: "051-4461234", medical: "", role: "student" },
      { id: "st_a5", name: "Komal Zahra", rollNo: "RWU-21-078", phone: "0321-5566778", category: "self", department: "Computer Science", room: "A-105", guardianName: "Shahid Iqbal", guardianPhone: "0321-5566700", homePhone: "051-4473456", medical: "", role: "student" },
      { id: "st_a6", name: "Hira Khan", rollNo: "RWU-22-036", phone: "0333-4455667", category: "guardian", department: "IT", room: "B-201", guardianName: "Raza Hussain", guardianPhone: "0333-4455600", homePhone: "051-4487890", medical: "Migraine — medication with warden", role: "student" },
      { id: "st_a7", name: "Zainab Tariq", rollNo: "RWU-21-061", phone: "0346-7788990", category: "self", department: "Cyber Security", room: "B-202", guardianName: "Ali Raza", guardianPhone: "0346-7788900", homePhone: "051-4491234", medical: "", role: "student" },
      { id: "st_a8", name: "Fatima Iqbal", rollNo: "RWU-22-090", phone: "0302-3344556", category: "guardian", department: "Software Engineering", room: "B-203", guardianName: "Sheikh Imran", guardianPhone: "0302-3344500", homePhone: "051-4405678", medical: "", role: "student" }
    ],
    permissions: [
      { id: "pm_1", studentId: "st_a6", purpose: "Medical Checkup", dateOut: t, timeOut: "10:00", expectedReturn: "14:00", status: "pending", decidedBy: "", createdAt: t + " 09:05" },
      { id: "pm_2", studentId: "st_a5", purpose: "Family Function", dateOut: t, timeOut: "16:00", expectedReturn: "21:00", status: "pending", decidedBy: "", createdAt: t + " 10:05" },
      { id: "pm_3", studentId: "st_a7", purpose: "Shopping", dateOut: t, timeOut: "13:00", expectedReturn: "17:00", status: "pending", decidedBy: "", createdAt: t + " 12:00" },
      { id: "pm_4", studentId: "st_a4", purpose: "University Work", dateOut: t, timeOut: "14:00", expectedReturn: "18:00", status: "approved", decidedBy: "Warden", createdAt: t + " 08:30" }
    ],
    gateLog: [
      { id: "g_1", studentId: "st_a1", date: t, exitTime: "17:05", accompaniedBy: "Tariq Mehmood", entryTime: "", receivedBy: "", sign: "Mahnoor Fatima" },
      { id: "g_2", studentId: "st_a2", date: t, exitTime: "16:20", accompaniedBy: "Father", entryTime: "", receivedBy: "", sign: "Areeba Khan" },
      { id: "g_3", studentId: "st_a3", date: t, exitTime: "15:45", accompaniedBy: "Cousin", entryTime: "", receivedBy: "", sign: "Sana Ali" },
      { id: "g_4", studentId: "st_a4", date: t, exitTime: "14:10", accompaniedBy: "Brother", entryTime: "19:30", receivedBy: "Security Guard", sign: "Laiba Noor" },
      { id: "g_5", studentId: "st_a6", date: t, exitTime: "13:05", accompaniedBy: "Mother", entryTime: "17:45", receivedBy: "Security Guard", sign: "Hira Khan" },
      { id: "g_6", studentId: "st_a5", date: t, exitTime: "12:20", accompaniedBy: "Friend", entryTime: "16:30", receivedBy: "Security Guard", sign: "Komal Zahra" }
    ],
    attendance: [],
    alerts: [
      { id: "al_1", type: "late", studentId: "st_a1", date: t, time: "21:05", text: "Mahnoor Fatima (RWU-21-032) is late. Expected back by 21:00, exited 17:05 with Tariq Mehmood.", acknowledged: false },
      { id: "al_2", type: "mismatch", studentId: "st_a2", date: t, time: "22:10", text: "Areeba Khan (RWU-22-014) marked PRESENT in night attendance but no return in gate register.", acknowledged: false }
    ],
    users: [
      { id: "u_warden", email: "warden@hostelhub.pk", role: "warden", name: "Warden" },
      { id: "u_guard", email: "guard@hostelhub.pk", role: "guard", name: "Security Guard" }
    ]
  };
}
