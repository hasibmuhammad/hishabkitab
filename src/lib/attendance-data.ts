"use client"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceSettings {
  officeStartTime: string
  lunchOutTime: string
  lunchInTime: string
  officeEndTime: string
  workingDaysPerMonth: number
  workingHoursPerDay: number
  noLateBonus: number          // BDT bonus for employees with zero late events in the month
}

export interface Pardons {
  checkIn?: boolean
  lunchIn?: boolean
  checkOut?: boolean
}

export interface DailyEntry {
  id: string
  employeeId: string
  date: string   // "YYYY-MM-DD"
  checkIn?: string    // "HH:MM"
  lunchOut?: string
  lunchIn?: string
  checkOut?: string
  advance: number     // cash taken today
  pardons: Pardons
}

export interface Employee {
  id: string
  name: string
  position: string
  salary: number
  initials: string
  status: string
}

export interface SalarySnapshot {
  employeeId: string
  monthKey: string   // "YYYY-MM"
  salary: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert "HH:MM" to total minutes since midnight */
export function toMins(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/** Format minutes-since-midnight back to "HH:MM" */
export function fromMins(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export interface DeductionBreakdown {
  checkInLateMins: number
  lunchInLateMins: number
  checkOutEarlyMins: number
  checkInDeduction: number
  lunchInDeduction: number
  checkOutDeduction: number
  totalDeduction: number
  totalPardoned: number
  netDeduction: number
}

/** Calculate deductions for a single daily entry */
export function calcDeductions(
  entry: DailyEntry,
  settings: AttendanceSettings,
  monthlySalary: number
): DeductionBreakdown {
  // Per-minute salary rate: salary / total working minutes in month
  const totalWorkingMins =
    settings.workingDaysPerMonth * settings.workingHoursPerDay * 60
  const ratePerMinute = totalWorkingMins > 0 ? monthlySalary / totalWorkingMins : 0

  const checkInLate =
    entry.checkIn
      ? Math.max(0, toMins(entry.checkIn) - toMins(settings.officeStartTime))
      : 0

  const lunchInLate =
    entry.lunchIn
      ? Math.max(0, toMins(entry.lunchIn) - toMins(settings.lunchInTime))
      : 0

  const checkOutEarly =
    entry.checkOut
      ? Math.max(0, toMins(settings.officeEndTime) - toMins(entry.checkOut))
      : 0

  const checkInDeduction = Math.round(checkInLate * ratePerMinute)
  const lunchInDeduction = Math.round(lunchInLate * ratePerMinute)
  const checkOutDeduction = Math.round(checkOutEarly * ratePerMinute)

  const pardoned =
    (entry.pardons.checkIn ? checkInDeduction : 0) +
    (entry.pardons.lunchIn ? lunchInDeduction : 0) +
    (entry.pardons.checkOut ? checkOutDeduction : 0)

  const total = checkInDeduction + lunchInDeduction + checkOutDeduction
  const net = total - pardoned

  return {
    checkInLateMins: checkInLate,
    lunchInLateMins: lunchInLate,
    checkOutEarlyMins: checkOutEarly,
    checkInDeduction,
    lunchInDeduction,
    checkOutDeduction,
    totalDeduction: total,
    totalPardoned: pardoned,
    netDeduction: net,
  }
}

// ─── Default seed data ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AttendanceSettings = {
  officeStartTime: "08:00",
  lunchOutTime: "13:00",
  lunchInTime: "14:00",
  officeEndTime: "22:30",
  workingDaysPerMonth: 26,
  workingHoursPerDay: 8,
  noLateBonus: 500,
}

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP001", name: "Mr John Doe",       position: "Senior Accountant",   salary: 9000,  initials: "JD", status: "Active" },
  { id: "EMP002", name: "Sarah Khan",         position: "Operations Manager",  salary: 15000, initials: "SK", status: "Active" },
  { id: "EMP003", name: "Jackson Lee",        position: "Sales Lead",          salary: 12000, initials: "JL", status: "On Leave" },
  { id: "EMP004", name: "Isabella Nguyen",    position: "HR Specialist",       salary: 10000, initials: "IN", status: "Active" },
  { id: "EMP005", name: "William Kim",        position: "Delivery Driver",     salary: 8000,  initials: "WK", status: "Active" },
]

// Demo entries for today
const today = new Date().toISOString().slice(0, 10)
export const INITIAL_ENTRIES: DailyEntry[] = [
  {
    id: "e1", employeeId: "EMP001", date: today,
    checkIn: "08:35", lunchOut: "13:05", lunchIn: "14:10", checkOut: "22:30",
    advance: 500, pardons: {},
  },
  {
    id: "e2", employeeId: "EMP002", date: today,
    checkIn: "08:00", lunchOut: "13:00", lunchIn: "14:00", checkOut: "22:30",
    advance: 0, pardons: {},
  },
]
