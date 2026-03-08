import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { 
  Banknote, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  AlertCircle, 
  Wallet,
  History 
} from "lucide-react"
import { Overview } from "@/components/overview"

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "Employee Management System Overview",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 pt-2 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-muted-foreground">Managing payroll, advances, and penalties for this month.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Salary Liability",
            value: "145,230 BDT",
            change: "12 active employees",
            trend: "up",
            icon: Banknote,
            color: "from-blue-500/20 to-blue-500/5",
            iconColor: "text-blue-500",
          },
          {
            title: "Monthly Advances",
            value: "12,350 BDT",
            change: "8 pending advances",
            trend: "up",
            icon: Coins,
            color: "from-orange-500/20 to-orange-500/5",
            iconColor: "text-orange-500",
          },
          {
            title: "Total Penalties",
            value: "2,234 BDT",
            change: "15 logged incidents",
            trend: "up",
            icon: AlertCircle,
            color: "from-rose-500/20 to-rose-500/5",
            iconColor: "text-rose-500",
          },
          {
            title: "Net Net Payable",
            value: "130,646 BDT",
            change: "Estimated for Mar 2026",
            trend: "down",
            icon: Wallet,
            color: "from-emerald-500/20 to-emerald-500/5",
            iconColor: "text-emerald-500",
          },
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-border">
            <div className={`absolute top-0 right-0 h-24 w-24 bg-linear-to-br ${stat.color} blur-3xl opacity-50 -mr-8 -mt-8`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl bg-background/50 border border-border/50 ${stat.iconColor}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-0.5">
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Visualizing payroll trends and deductions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <Overview />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-0.5">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Advances and Penalties logged today.</CardDescription>
            </div>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "John Doe", type: "Advance Taken", detail: "Cash advance", amount: "-4,000 BDT", initial: "JD", color: "bg-orange-100 text-orange-600", trend: "down" },
                { name: "Sarah Khan", type: "Penalty", detail: "Half-day absence", amount: "-150 BDT", initial: "SK", color: "bg-rose-100 text-rose-600", trend: "down" },
                { name: "Isabella Nguyen", type: "Advance Taken", detail: "Medical emergency", amount: "-2,000 BDT", initial: "IN", color: "bg-orange-100 text-orange-600", trend: "down" },
                { name: "William Kim", type: "Penalty", detail: "Late arrival", amount: "-50 BDT", initial: "WK", color: "bg-rose-100 text-rose-600", trend: "down" },
                { name: "Sofia Davis", type: "Salary Update", detail: "Promoted to Senior", amount: "+5,000 BDT", initial: "SD", color: "bg-emerald-100 text-emerald-600", trend: "up" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <Avatar className="h-10 w-10 border border-border/50 group-hover:scale-105 transition-transform">
                    <AvatarFallback className={activity.color}>{activity.initial}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold leading-none">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">{activity.type}: {activity.detail}</p>
                  </div>
                  <div className={`ml-auto font-bold text-sm ${activity.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
