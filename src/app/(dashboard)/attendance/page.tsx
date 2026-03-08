"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { calcDeductions, DailyEntry, Employee } from "@/lib/attendance-data"
import { useAttendanceStore } from "@/lib/attendance-store"
import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ShieldCheck,
  ShieldOff,
  UndoDot,
} from "lucide-react"
import * as React from "react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function displayDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  })
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

function minutesToDisplay(mins: number) {
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m late`
  return `${m}m late`
}

function earlyMinutesToDisplay(mins: number) {
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m early`
  return `${m}m early out`
}

// ─── Log Entry Dialog ─────────────────────────────────────────────────────────

interface LogEntryDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  employee: Employee
  date: string
  existing?: DailyEntry
}

function LogEntryDialog({ open, onOpenChange, employee, date, existing }: LogEntryDialogProps) {
  const { settings, upsertEntry } = useAttendanceStore()

  const [checkIn, setCheckIn] = React.useState(existing?.checkIn ?? "")
  const [lunchOut, setLunchOut] = React.useState(existing?.lunchOut ?? "")
  const [lunchIn, setLunchIn] = React.useState(existing?.lunchIn ?? "")
  const [checkOut, setCheckOut] = React.useState(existing?.checkOut ?? "")
  const [advance, setAdvance] = React.useState(String(existing?.advance ?? 0))

  // Preview deductions live
  const preview = calcDeductions(
    {
      id: "", employeeId: employee.id, date,
      checkIn: checkIn || undefined,
      lunchOut: lunchOut || undefined,
      lunchIn: lunchIn || undefined,
      checkOut: checkOut || undefined,
      advance: 0,
      pardons: {}
    },
    settings,
    employee.salary
  )

  function handleSave() {
    upsertEntry({
      id: existing?.id,
      employeeId: employee.id,
      date,
      checkIn: checkIn || undefined,
      lunchOut: lunchOut || undefined,
      lunchIn: lunchIn || undefined,
      checkOut: checkOut || undefined,
      advance: Number(advance) || 0,
      pardons: existing?.pardons ?? {},
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{employee.initials}</AvatarFallback>
            </Avatar>
            {employee.name}
          </DialogTitle>
          <DialogDescription>{displayDate(date)}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="checkIn" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Check-In
                <span className="ml-auto text-muted-foreground font-normal">(before {settings.officeStartTime})</span>
              </Label>
              <Input id="checkIn" type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              {preview.checkInLateMins > 0 && (
                <p className="text-[11px] text-orange-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {minutesToDisplay(preview.checkInLateMins)} · −{preview.checkInDeduction.toLocaleString()} BDT
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lunchOut" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Lunch Out
                <span className="ml-auto text-muted-foreground font-normal">(~{settings.lunchOutTime})</span>
              </Label>
              <Input id="lunchOut" type="time" value={lunchOut} onChange={e => setLunchOut(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lunchIn" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Lunch Return
                <span className="ml-auto text-muted-foreground font-normal">(by {settings.lunchInTime})</span>
              </Label>
              <Input id="lunchIn" type="time" value={lunchIn} onChange={e => setLunchIn(e.target.value)} />
              {preview.lunchInLateMins > 0 && (
                <p className="text-[11px] text-orange-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {minutesToDisplay(preview.lunchInLateMins)} · −{preview.lunchInDeduction.toLocaleString()} BDT
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="checkOut" className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Check-Out
                <span className="ml-auto text-muted-foreground font-normal">(after {settings.officeEndTime})</span>
              </Label>
              <Input id="checkOut" type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              {preview.checkOutEarlyMins > 0 && (
                <p className="text-[11px] text-orange-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {earlyMinutesToDisplay(preview.checkOutEarlyMins)} · −{preview.checkOutDeduction.toLocaleString()} BDT
                </p>
              )}
            </div>
          </div>

          {/* Advance */}
          <div className="grid gap-1.5">
            <Label htmlFor="advance" className="text-xs font-medium flex items-center gap-1">
              <BadgeDollarSign className="h-3 w-3" /> Cash Advance (BDT)
            </Label>
            <Input
              id="advance"
              type="number"
              min="0"
              placeholder="0"
              value={advance}
              onChange={e => setAdvance(e.target.value)}
            />
          </div>

          {/* Deduction summary */}
          {preview.totalDeduction > 0 && (
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-sm">
              <p className="text-orange-600 dark:text-orange-400 font-medium text-xs mb-1">Computed Deductions (will apply unless pardoned)</p>
              <p className="text-orange-700 dark:text-orange-300 font-bold">−{preview.totalDeduction.toLocaleString()} BDT</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4" />
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Daily Log View ───────────────────────────────────────────────────────────

function DailyLog({ date }: { date: string }) {
  const { employees, entries, settings, togglePardon } = useAttendanceStore()
  const [logTarget, setLogTarget] = React.useState<Employee | null>(null)

  const dayEntries = entries.filter(e => e.date === date)

  function getEntry(empId: string) {
    return dayEntries.find(e => e.employeeId === empId)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px]">Employee</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Lunch Out</TableHead>
              <TableHead>Lunch Return</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(emp => {
              const entry = getEntry(emp.id)
              const deduct = entry ? calcDeductions(entry, settings, emp.salary) : null
              const isMissing = !entry

              return (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors border-border/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{emp.initials}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0">
                        <span className="text-sm font-semibold">{emp.name}</span>
                        <span className="text-[10px] text-muted-foreground">{emp.position}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Check-In */}
                  <TableCell>
                    {entry?.checkIn ? (
                      <div className="space-y-1">
                        <span className="font-mono text-sm">{entry.checkIn}</span>
                        {deduct && deduct.checkInLateMins > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-orange-500 bg-orange-500/10 border-orange-500/20">
                              {minutesToDisplay(deduct.checkInLateMins)}
                            </Badge>
                            <button
                              onClick={() => togglePardon(entry.id, "checkIn")}
                              title={entry.pardons.checkIn ? "Remove pardon" : "Pardon this"}
                              className="rounded p-0.5 hover:bg-muted transition-colors"
                            >
                              {entry.pardons.checkIn
                                ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                : <ShieldOff className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500" />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Lunch Out */}
                  <TableCell>
                    {entry?.lunchOut
                      ? <span className="font-mono text-sm">{entry.lunchOut}</span>
                      : <span className="text-muted-foreground text-xs">—</span>
                    }
                  </TableCell>

                  {/* Lunch In */}
                  <TableCell>
                    {entry?.lunchIn ? (
                      <div className="space-y-1">
                        <span className="font-mono text-sm">{entry.lunchIn}</span>
                        {deduct && deduct.lunchInLateMins > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-orange-500 bg-orange-500/10 border-orange-500/20">
                              {minutesToDisplay(deduct.lunchInLateMins)}
                            </Badge>
                            <button
                              onClick={() => togglePardon(entry.id, "lunchIn")}
                              title={entry.pardons.lunchIn ? "Remove pardon" : "Pardon this"}
                              className="rounded p-0.5 hover:bg-muted transition-colors"
                            >
                              {entry.pardons.lunchIn
                                ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                : <ShieldOff className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500" />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Check-Out */}
                  <TableCell>
                    {entry?.checkOut ? (
                      <div className="space-y-1">
                        <span className="font-mono text-sm">{entry.checkOut}</span>
                        {deduct && deduct.checkOutEarlyMins > 0 && (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-rose-500 bg-rose-500/10 border-rose-500/20">
                              {earlyMinutesToDisplay(deduct.checkOutEarlyMins)}
                            </Badge>
                            <button
                              onClick={() => togglePardon(entry.id, "checkOut")}
                              title={entry.pardons.checkOut ? "Remove pardon" : "Pardon this"}
                              className="rounded p-0.5 hover:bg-muted transition-colors"
                            >
                              {entry.pardons.checkOut
                                ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                : <ShieldOff className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500" />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Advance */}
                  <TableCell className="text-right">
                    {entry && entry.advance > 0
                      ? <span className="text-orange-500 font-medium text-sm">−{entry.advance.toLocaleString()} <span className="text-[10px] text-muted-foreground">BDT</span></span>
                      : <span className="text-muted-foreground text-xs">—</span>
                    }
                  </TableCell>

                  {/* Total deduction */}
                  <TableCell className="text-right">
                    {deduct && deduct.netDeduction > 0 ? (
                      <div className="text-right space-y-0.5">
                        <div className="text-rose-500 font-semibold text-sm">−{deduct.netDeduction.toLocaleString()} <span className="text-[10px]">BDT</span></div>
                        {deduct.totalPardoned > 0 && (
                          <div className="text-emerald-500 text-[10px] flex items-center justify-end gap-0.5">
                            <UndoDot className="h-3 w-3" />
                            {deduct.totalPardoned.toLocaleString()} pardoned
                          </div>
                        )}
                      </div>
                    ) : deduct && deduct.totalPardoned > 0 ? (
                      <div className="text-emerald-500 text-[11px] flex items-center justify-end gap-0.5">
                        <ShieldCheck className="h-3 w-3" />
                        All pardoned
                      </div>
                    ) : (
                      <span className="text-emerald-500 text-xs">Clear</span>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isMissing ? "default" : "outline"}
                      className="h-7 text-xs gap-1"
                      onClick={() => setLogTarget(emp)}
                    >
                      {isMissing ? <Plus className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {isMissing ? "Log" : "Edit"}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Log entry dialog */}
      {logTarget && (
        <LogEntryDialog
          open={!!logTarget}
          onOpenChange={(v) => !v && setLogTarget(null)}
          employee={logTarget}
          date={date}
          existing={getEntry(logTarget.id)}
        />
      )}
    </div>
  )
}

// ─── Monthly Report ───────────────────────────────────────────────────────────

function MonthlyReport() {
  const { employees, entries, settings, getSalaryForMonth, snapshotSalary } = useAttendanceStore()
  const now = new Date()
  const [year, setYear] = React.useState(now.getFullYear())
  const [month, setMonth] = React.useState(now.getMonth())

  const mk = monthKey(year, month)
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Snapshot salaries when viewing a month (deferred capture)
  React.useEffect(() => {
    employees.forEach(emp => snapshotSalary(emp.id, mk))
  }, [mk, employees])

  const monthEntries = entries.filter(e => e.date.startsWith(mk))

  function getStats(empId: string) {
    const empEntries = monthEntries.filter(e => e.employeeId === empId)
    const daysPresent = empEntries.filter(e => e.checkIn).length
    let totalDeduction = 0
    let totalAdvance = 0
    let totalPardoned = 0
    let hasLateness = false

    const salary = getSalaryForMonth(empId, mk)
    for (const entry of empEntries) {
      const d = calcDeductions(entry, settings, salary)
      totalDeduction += d.netDeduction
      totalAdvance += entry.advance
      totalPardoned += d.totalPardoned
      
      if (d.checkInLateMins > 0 || d.lunchInLateMins > 0 || d.checkOutEarlyMins > 0) {
        hasLateness = true
      }
    }

    const bonus = (daysPresent > 0 && !hasLateness) ? (settings.noLateBonus ?? 0) : 0
    const netPayout = (salary ?? 0) + bonus - (totalDeduction ?? 0) - (totalAdvance ?? 0)
    return { daysPresent, totalDeduction, totalAdvance, totalPardoned, salary, netPayout, bonus }
  }

  return (
    <div className="space-y-4">
      {/* Month Navigator */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center font-semibold text-sm">{monthLabel}</div>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary cards */}
      {(() => {
        const totals = employees.reduce((acc, emp) => {
          const s = getStats(emp.id)
          acc.totalDeductions += s.totalDeduction
          acc.totalAdvances += s.totalAdvance
          acc.totalPardoned += s.totalPardoned
          acc.totalBonus += s.bonus
          acc.totalNetPayout += s.netPayout
          return acc
        }, { totalDeductions: 0, totalAdvances: 0, totalPardoned: 0, totalBonus: 0, totalNetPayout: 0 })

        return (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-3 text-center md:text-left">
                <p className="text-xs text-muted-foreground">Total Deductions</p>
                <p className="text-xl font-bold text-rose-500 mt-0.5">−{totals.totalDeductions.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">BDT</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-3 text-center md:text-left">
                <p className="text-xs text-muted-foreground">Total Advances</p>
                <p className="text-xl font-bold text-orange-500 mt-0.5">−{totals.totalAdvances.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">BDT</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-3 text-center md:text-left">
                <p className="text-xs text-muted-foreground">Total Pardoned</p>
                <p className="text-xl font-bold text-emerald-500 mt-0.5">+{totals.totalPardoned.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">BDT</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4 pb-3 text-center md:text-left">
                <p className="text-xs text-muted-foreground">Total Bonus</p>
                <p className="text-xl font-bold text-blue-500 mt-0.5">+{totals.totalBonus.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">BDT</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8" />
              <CardContent className="pt-4 pb-3 text-center md:text-left relative z-10">
                <p className="text-xs text-muted-foreground">Total Net Payout</p>
                <p className="text-xl font-bold text-primary mt-0.5">{totals.totalNetPayout.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">BDT</p>
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* Per-employee breakdown */}
      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px]">Employee</TableHead>
              <TableHead className="text-center">Days Present</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Late Deductions</TableHead>
              <TableHead className="text-right text-emerald-500">Pardoned</TableHead>
              <TableHead className="text-right text-blue-500">Bonus</TableHead>
              <TableHead className="text-right">Advances</TableHead>
              <TableHead className="text-right font-bold">Net Payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(emp => {
              const s = getStats(emp.id)
              return (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors border-border/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{emp.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground">{emp.position}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">{s.daysPresent}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{s.salary.toLocaleString()} <span className="text-[10px] text-muted-foreground">BDT</span></TableCell>
                  <TableCell className="text-right text-rose-500 font-medium">
                    {s.totalDeduction > 0 ? `−${s.totalDeduction.toLocaleString()}` : "—"} <span className="text-[10px] text-muted-foreground">BDT</span>
                  </TableCell>
                  <TableCell className="text-right text-emerald-500 font-medium">
                    {s.totalPardoned > 0 ? `+${s.totalPardoned.toLocaleString()}` : "—"} <span className="text-[10px] text-muted-foreground">BDT</span>
                  </TableCell>
                  <TableCell className="text-right text-blue-500 font-medium">
                    {s.bonus > 0 ? `+${s.bonus.toLocaleString()}` : "—"} <span className="text-[10px] text-muted-foreground">BDT</span>
                  </TableCell>
                  <TableCell className="text-right text-orange-500 font-medium">
                    {s.totalAdvance > 0 ? `−${s.totalAdvance.toLocaleString()}` : "—"} <span className="text-[10px] text-muted-foreground">BDT</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-primary text-sm">{s.netPayout.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">BDT</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [activeTab, setActiveTab] = React.useState<"daily" | "monthly">("daily")
  const [currentDate, setCurrentDate] = React.useState(formatDate(new Date()))

  function shiftDate(days: number) {
    const d = new Date(currentDate + "T00:00:00")
    d.setDate(d.getDate() + days)
    setCurrentDate(formatDate(d))
  }

  const isToday = currentDate === formatDate(new Date())

  return (
    <div className="flex-1 space-y-6 pt-2 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Log daily times, manage pardons, and view monthly salary reports.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {(["daily", "monthly"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "daily" ? "Daily Log" : "Monthly Report"}
          </button>
        ))}
      </div>

      {/* Daily tab content */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {/* Date navigation */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => shiftDate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 relative group cursor-pointer h-7 px-2 hover:bg-muted rounded transition-colors">
                    <input
                      type="date"
                      value={currentDate}
                      onChange={e => setCurrentDate(e.target.value)}
                      className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                      onClick={e => (e.target as any).showPicker?.()}
                    />
                    <span className="text-sm font-semibold">
                      {currentDate.split("-").reverse().join("/")}
                    </span>
                    {isToday && <Badge variant="secondary" className="text-[10px] px-1.5 font-normal">Today</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => shiftDate(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {!isToday && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setCurrentDate(formatDate(new Date()))}>
                    Go to Today
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DailyLog date={currentDate} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly tab content */}
      {activeTab === "monthly" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Salary Report</CardTitle>
            <CardDescription>
              Per-employee breakdown of salary, deductions, pardons, and advances.
              Salary is locked to the value at the time of the month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyReport />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
