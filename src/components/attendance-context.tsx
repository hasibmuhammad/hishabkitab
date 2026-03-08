"use client"

import * as React from "react"
import {
  AttendanceSettings,
  DailyEntry,
  Employee,
  SalarySnapshot,
  DEFAULT_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_ENTRIES,
  Pardons,
} from "@/lib/attendance-data"

// ─── Context types ────────────────────────────────────────────────────────────

interface AttendanceContextValue {
  settings: AttendanceSettings
  updateSettings: (s: Partial<AttendanceSettings>) => void

  employees: Employee[]
  updateEmployee: (id: string, patch: Partial<Employee>) => void

  entries: DailyEntry[]
  upsertEntry: (entry: Omit<DailyEntry, "id"> & { id?: string }) => void
  togglePardon: (entryId: string, slot: keyof Pardons) => void

  salarySnapshots: SalarySnapshot[]
  snapshotSalary: (employeeId: string, monthKey: string) => void
  getSalaryForMonth: (employeeId: string, monthKey: string) => number
}

const AttendanceContext = React.createContext<AttendanceContextValue | null>(null)

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AttendanceSettings>(DEFAULT_SETTINGS)
  const [employees, setEmployees] = React.useState<Employee[]>(INITIAL_EMPLOYEES)
  const [entries, setEntries] = React.useState<DailyEntry[]>(INITIAL_ENTRIES)
  const [salarySnapshots, setSalarySnapshots] = React.useState<SalarySnapshot[]>([])

  const updateSettings = (patch: Partial<AttendanceSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  const updateEmployee = (id: string, patch: Partial<Employee>) =>
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    )

  const upsertEntry = (entry: Omit<DailyEntry, "id"> & { id?: string }) => {
    setEntries((prev) => {
      const existing = prev.find(
        (e) => e.id === entry.id ||
          (e.employeeId === entry.employeeId && e.date === entry.date)
      )
      if (existing) {
        return prev.map((e) =>
          e.id === existing.id ? { ...existing, ...entry, id: existing.id } : e
        )
      }
      return [
        ...prev,
        {
          ...entry,
          id: entry.id ?? `${entry.employeeId}-${entry.date}-${Date.now()}`,
        },
      ]
    })
  }

  const togglePardon = (entryId: string, slot: keyof Pardons) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, pardons: { ...e.pardons, [slot]: !e.pardons[slot] } }
          : e
      )
    )
  }

  const snapshotSalary = (employeeId: string, monthKey: string) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (!emp) return
    setSalarySnapshots((prev) => {
      const exists = prev.find(
        (s) => s.employeeId === employeeId && s.monthKey === monthKey
      )
      if (exists) return prev // don't overwrite existing snapshot
      return [...prev, { employeeId, monthKey, salary: emp.salary }]
    })
  }

  const getSalaryForMonth = (employeeId: string, monthKey: string): number => {
    const snap = salarySnapshots.find(
      (s) => s.employeeId === employeeId && s.monthKey === monthKey
    )
    if (snap) return snap.salary
    return employees.find((e) => e.id === employeeId)?.salary ?? 0
  }

  return (
    <AttendanceContext.Provider
      value={{
        settings,
        updateSettings,
        employees,
        updateEmployee,
        entries,
        upsertEntry,
        togglePardon,
        salarySnapshots,
        snapshotSalary,
        getSalaryForMonth,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance() {
  const ctx = React.useContext(AttendanceContext)
  if (!ctx) throw new Error("useAttendance must be used inside AttendanceProvider")
  return ctx
}
