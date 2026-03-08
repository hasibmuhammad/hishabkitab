import { create } from "zustand"
import { persist, devtools } from "zustand/middleware"
import {
  AttendanceSettings,
  DailyEntry,
  Employee,
  SalarySnapshot,
  Pardons,
  DEFAULT_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_ENTRIES,
} from "@/lib/attendance-data"

// ─── Store shape ──────────────────────────────────────────────────────────────

interface AttendanceState {
  settings: AttendanceSettings
  employees: Employee[]
  entries: DailyEntry[]
  salarySnapshots: SalarySnapshot[]
}

interface AttendanceActions {
  updateSettings: (patch: Partial<AttendanceSettings>) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  upsertEntry: (entry: Omit<DailyEntry, "id"> & { id?: string }) => void
  togglePardon: (entryId: string, slot: keyof Pardons) => void
  snapshotSalary: (employeeId: string, monthKey: string) => void
  getSalaryForMonth: (employeeId: string, monthKey: string) => number
}

type AttendanceStore = AttendanceState & AttendanceActions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Initial state ──
        settings: DEFAULT_SETTINGS,
        employees: INITIAL_EMPLOYEES,
        entries: INITIAL_ENTRIES,
        salarySnapshots: [],

        // ── Actions ──
        updateSettings: (patch) =>
          set((s) => ({ settings: { ...s.settings, ...patch } })),

        updateEmployee: (id, patch) =>
          set((s) => ({
            employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          })),

        upsertEntry: (entry) =>
          set((s) => {
            const existing = s.entries.find(
              (e) =>
                e.id === entry.id ||
                (e.employeeId === entry.employeeId && e.date === entry.date)
            )
            if (existing) {
              return {
                entries: s.entries.map((e) =>
                  e.id === existing.id ? { ...existing, ...entry, id: existing.id } : e
                ),
              }
            }
            return {
              entries: [
                ...s.entries,
                {
                  ...entry,
                  id: entry.id ?? `${entry.employeeId}-${entry.date}-${Date.now()}`,
                },
              ],
            }
          }),

        togglePardon: (entryId, slot) =>
          set((s) => ({
            entries: s.entries.map((e) =>
              e.id === entryId
                ? { ...e, pardons: { ...e.pardons, [slot]: !e.pardons[slot] } }
                : e
            ),
          })),

        snapshotSalary: (employeeId, monthKey) => {
          const { employees, salarySnapshots } = get()
          const emp = employees.find((e) => e.id === employeeId)
          if (!emp) return
          const exists = salarySnapshots.find(
            (s) => s.employeeId === employeeId && s.monthKey === monthKey
          )
          if (exists) return
          set((s) => ({
            salarySnapshots: [
              ...s.salarySnapshots,
              { employeeId, monthKey, salary: emp.salary },
            ],
          }))
        },

        getSalaryForMonth: (employeeId, monthKey) => {
          const { employees, salarySnapshots } = get()
          const snap = salarySnapshots.find(
            (s) => s.employeeId === employeeId && s.monthKey === monthKey
          )
          if (snap) return snap.salary
          return employees.find((e) => e.id === employeeId)?.salary ?? 0
        },
      }),
      {
        name: "hishabkitab-attendance", // localStorage key
        // Custom merge logic to ensure new settings fields (like noLateBonus) 
        // are merged with existing persisted data.
        merge: (persistedState, currentState) => {
          const typedPersisted = persistedState as AttendanceState
          return {
            ...currentState,
            ...typedPersisted,
            settings: {
              ...DEFAULT_SETTINGS,
              ...(typedPersisted?.settings || {}),
            },
          }
        },
      }
    ),
    {
      name: "AttendanceStore",                           // label in Redux DevTools
      enabled: process.env.NODE_ENV === "development",  // only in dev
    }
  )
)
