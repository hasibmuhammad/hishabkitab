"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus
} from "lucide-react"
import * as React from "react"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const employees = [
  {
    id: "EMP001",
    name: "Mr John Doe",
    position: "Senior Accountant",
    salary: 9000,
    advances: 4000,
    penalties: 150,
    status: "Active",
    initials: "JD",
  },
  {
    id: "EMP002",
    name: "Sarah Khan",
    position: "Operations Manager",
    salary: 15000,
    advances: 2000,
    penalties: 0,
    status: "Active",
    initials: "SK",
  },
  {
    id: "EMP003",
    name: "Jackson Lee",
    position: "Sales Lead",
    salary: 12000,
    advances: 0,
    penalties: 500,
    status: "On Leave",
    initials: "JL",
  },
  {
    id: "EMP004",
    name: "Isabella Nguyen",
    position: "HR Specialist",
    salary: 10000,
    advances: 3000,
    penalties: 200,
    status: "Active",
    initials: "IN",
  },
  {
    id: "EMP005",
    name: "William Kim",
    position: "Delivery Driver",
    salary: 8000,
    advances: 1000,
    penalties: 100,
    status: "Active",
    initials: "WK",
  },
]

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6 pt-2 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Detailed view of your employees and their financial status.</p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger
                    render={
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Employee
                        </Button>
                    }
                />
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new staff member. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="e.g. Mr John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Input id="position" placeholder="e.g. Account Assistant" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Monthly Salary (BDT)</Label>
                            <Input id="salary" type="number" placeholder="9000" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Employee</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="grid gap-0.5">
              <CardTitle>Employee List</CardTitle>
              <CardDescription>A complete list of your current staff members.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="pl-8 bg-background/50 border-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">Staff Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">Advances</TableHead>
                  <TableHead className="text-right">Penalty</TableHead>
                  <TableHead className="text-right font-bold">Net Payout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => {
                  const netPayout = emp.salary - emp.advances - emp.penalties
                  return (
                    <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors border-border/40">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{emp.initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <span className="font-semibold">{emp.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{emp.id} • {emp.position}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "Active" ? "default" : "secondary"} className="font-normal">
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{emp.salary.toLocaleString()} <span className="text-[10px] text-muted-foreground">BDT</span></TableCell>
                      <TableCell className="text-right text-orange-500 font-medium">{emp.advances > 0 ? `-${emp.advances.toLocaleString()}` : "0"} <span className="text-[10px] text-muted-foreground text-orange-500/70">BDT</span></TableCell>
                      <TableCell className="text-right text-rose-500 font-medium">{emp.penalties > 0 ? `-${emp.penalties.toLocaleString()}` : "0"} <span className="text-[10px] text-muted-foreground text-rose-500/70">BDT</span></TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-emerald-500">{netPayout.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">BDT</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                    Log Advance
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                                    Log Penalty
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2">
                                    <Edit2 className="h-4 w-4" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-rose-500">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
