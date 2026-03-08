"use client"

import * as React from "react"
import { Clock, Save, RotateCcw, BadgeDollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAttendanceStore } from "@/lib/attendance-store"
import { DEFAULT_SETTINGS } from "@/lib/attendance-data"

export default function SettingsPage() {
  const { settings, updateSettings } = useAttendanceStore()

  // Local form state (only commit on Save)
  const [form, setForm] = React.useState({ ...settings })
  const [saved, setSaved] = React.useState(false)

  // Keep local state in sync if context changes externally
  React.useEffect(() => { setForm({ ...settings }) }, [settings])

  function handleChange(field: keyof typeof form, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS })
    updateSettings(DEFAULT_SETTINGS)
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings)

  return (
    <div className="flex-1 space-y-6 pt-2 pb-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure attendance thresholds and salary deduction rules.</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Attendance Thresholds */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Attendance Thresholds</CardTitle>
                <CardDescription>
                  These times define when lateness or early departure is calculated.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Office Start */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
              <div>
                <Label className="text-sm font-medium">Office Start Time</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Arriving after this is counted as late</p>
              </div>
              <Input
                type="time"
                value={form.officeStartTime}
                onChange={e => handleChange("officeStartTime", e.target.value)}
              />
            </div>

            <div className="border-t border-border/40" />

            {/* Lunch window */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-[11px]">Lunch Break Window</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
                <div>
                  <Label className="text-sm font-medium">Lunch Out (informational)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Approximate time meals begin — not penalised</p>
                </div>
                <Input
                  type="time"
                  value={form.lunchOutTime}
                  onChange={e => handleChange("lunchOutTime", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
                <div>
                  <Label className="text-sm font-medium">Lunch Return Deadline</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Returning after this is counted as late</p>
                </div>
                <Input
                  type="time"
                  value={form.lunchInTime}
                  onChange={e => handleChange("lunchInTime", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-border/40" />

            {/* Office End */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
              <div>
                <Label className="text-sm font-medium">Office End Time</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Leaving before this is counted as early departure</p>
              </div>
              <Input
                type="time"
                value={form.officeEndTime}
                onChange={e => handleChange("officeEndTime", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary-Based Deduction */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Salary-Based Deduction</CardTitle>
            <CardDescription>
              Deductions are calculated proportionally to each employee&apos;s monthly salary.
              1 hour late = 1 hour&apos;s worth of their salary deducted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
              <div>
                <Label className="text-sm font-medium">Working Days per Month</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Used to calculate the per-minute salary rate</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  value={form.workingDaysPerMonth}
                  onChange={e => handleChange("workingDaysPerMonth", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
              <div>
                <Label className="text-sm font-medium">Working Hours per Day</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Used to calculate the per-minute salary rate</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={form.workingHoursPerDay}
                  onChange={e => handleChange("workingHoursPerDay", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">hrs/day</span>
              </div>
            </div>

            {/* Live formula preview */}
            {(() => {
              const totalMins = form.workingDaysPerMonth * form.workingHoursPerDay * 60
              const exampleSalaries = [9000, 15000]
              return (
                <div className="mt-2 rounded-lg bg-muted/50 border border-border/40 p-3 text-xs space-y-2">
                  <p className="font-medium text-foreground text-sm">How it works</p>
                  <p className="text-muted-foreground">
                    Total working mins/month: <span className="font-mono text-foreground">{totalMins.toLocaleString()} min</span>
                  </p>
                  {exampleSalaries.map(salary => {
                    const ratePerMin = totalMins > 0 ? salary / totalMins : 0
                    return (
                      <div key={salary} className="rounded-md bg-background/60 border border-border/30 px-3 py-2 space-y-0.5">
                        <p className="font-medium text-foreground">{salary.toLocaleString()} BDT/month employee</p>
                        <p className="text-muted-foreground">Rate: <span className="font-mono">{ratePerMin.toFixed(4)} BDT/min</span></p>
                        <p>30 min late → <span className="text-rose-500 font-semibold">−{Math.round(ratePerMin * 30).toLocaleString()} BDT</span></p>
                        <p>1 hour late → <span className="text-rose-500 font-semibold">−{Math.round(ratePerMin * 60).toLocaleString()} BDT</span></p>
                      </div>
                    )
                  })}
                  <p className="text-muted-foreground">Pardoned → <span className="text-emerald-500 font-semibold">+waived</span></p>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Rewards & Bonuses */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <CardTitle>Rewards & Bonuses</CardTitle>
                <CardDescription>
                  Incentives to motivate employees and reward punctuality.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 items-center">
              <div>
                <Label className="text-sm font-medium">Monthly Punctuality Bonus</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Awarded if the employee has zero lateness for the entire month</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={form.noLateBonus}
                  onChange={e => handleChange("noLateBonus", Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">BDT</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save actions */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="gap-2" disabled={!isDirty && !saved}>
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
          <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
