import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronDown,
  Code2,
  Component,
  Download,
  Layers3,
  PanelRightOpen,
  RefreshCcw,
  Search,
  Settings2,
  Sparkles,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kssbox/ui'

const packageRows = [
  { name: '@kssbox/ui', role: 'React components', status: 'Ready', size: '637 KB' },
  { name: '@kssbox/eslint-config', role: 'Flat config', status: 'Ready', size: '5 files' },
  { name: '@kssbox/tsconfig', role: 'TS presets', status: 'Ready', size: '4 presets' },
  { name: '@kssbox/build-config', role: 'Vite and tsup helpers', status: 'Ready', size: '2 helpers' },
]

const controls = [
  { label: 'Dark-ready tokens', value: true },
  { label: 'Public package metadata', value: true },
  { label: 'Local source aliases', value: true },
]

export function App() {
  const [density, setDensity] = useState('balanced')
  const [enabled, setEnabled] = useState(true)
  const [note, setNote] = useState('Validate package exports before publishing.')
  const progress = useMemo(() => (enabled ? 82 : 46), [enabled])

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-[var(--pg-bg)] text-[var(--pg-ink)]">
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[272px_1fr]">
          <aside className="border-b border-[var(--pg-line)] bg-[var(--pg-rail)] px-5 py-5 xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-[var(--pg-ink)] text-white">
                <Box className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Kssbox</p>
                <p className="text-xs text-[var(--pg-muted)]">Local package demo</p>
              </div>
            </div>

            <div className="mt-7 space-y-2">
              {['Components', 'Tokens', 'Publishing'].map((item, index) => (
                <Button
                  key={item}
                  variant={index === 0 ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  size="lg"
                >
                  {index === 0 && <Component className="size-4" />}
                  {index === 1 && <Layers3 className="size-4" />}
                  {index === 2 && <ArrowUpRight className="size-4" />}
                  {item}
                </Button>
              ))}
            </div>

            <div className="mt-8 rounded-md border border-[var(--pg-line)] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--pg-muted)]">
                  Build
                </span>
                <Badge variant="success">passing</Badge>
              </div>
              <Progress value={progress} className="mt-4" />
              <p className="mt-3 text-xs leading-5 text-[var(--pg-muted)]">
                Workspace packages resolve through local pnpm links.
              </p>
            </div>
          </aside>

          <section className="px-5 py-5 sm:px-8 lg:px-10">
            <header className="flex flex-col gap-4 border-b border-[var(--pg-line)] pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">workspace:*</Badge>
                  <Badge variant="outline">Vite</Badge>
                  <Badge variant="outline">React 19</Badge>
                </div>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Kssbox UI component workbench
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="lg" aria-label="Refresh preview">
                      <RefreshCcw className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh preview</TooltipContent>
                </Tooltip>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary" size="lg">
                      <PanelRightOpen className="size-4" />
                      Inspect
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Package wiring</SheetTitle>
                      <SheetDescription>
                        Playground imports components from local `@kssbox/ui` source aliases.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-3 text-sm">
                      {controls.map((item) => (
                        <label key={item.label} className="flex items-center justify-between rounded-md border p-3">
                          <span>{item.label}</span>
                          <Checkbox checked={item.value} disabled />
                        </label>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <div className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <Card className="rounded-md border-[var(--pg-line)] shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="size-5 text-[var(--pg-accent)]" />
                      Interaction kit
                    </CardTitle>
                    <CardDescription>
                      Buttons, fields, menus, dialog, select, and toggles from `@kssbox/ui`.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button>
                            <Check className="size-4" />
                            Publish ready
                          </Button>
                          <Button variant="outline">
                            <Download className="size-4" />
                            Export
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary">
                                Actions
                                <ChevronDown className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Run build</DropdownMenuItem>
                              <DropdownMenuItem>Run type-check</DropdownMenuItem>
                              <DropdownMenuItem>Pack package</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--pg-muted)]" />
                          <Input id="component-search" name="component-search" className="pl-9" placeholder="Search components" />
                        </div>

                        <Textarea
                          id="release-note"
                          name="release-note"
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          className="min-h-24"
                        />
                      </div>

                      <div className="space-y-4 rounded-md border border-[var(--pg-line)] bg-[var(--pg-soft)] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Strict preview</p>
                            <p className="text-sm text-[var(--pg-muted)]">Toggle package guardrails</p>
                          </div>
                          <Switch checked={enabled} onCheckedChange={setEnabled} />
                        </div>

                        <Select value={density} onValueChange={setDensity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Density" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Bell className="size-4" />
                              Open release dialog
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Publish rehearsal</DialogTitle>
                              <DialogDescription>
                                This dialog confirms that overlay primitives are wired through the local package.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="rounded-md bg-[var(--pg-soft)] p-4 text-sm">
                              `@kssbox/ui` is resolved from workspace source during playground development.
                            </div>
                            <DialogFooter>
                              <Button>Continue</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="packages">
                  <TabsList>
                    <TabsTrigger value="packages">Packages</TabsTrigger>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="imports">Imports</TabsTrigger>
                  </TabsList>
                  <TabsContent value="packages" className="mt-4">
                    <Card className="rounded-md border-[var(--pg-line)] shadow-none">
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Package</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Output</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {packageRows.map((row) => (
                              <TableRow key={row.name}>
                                <TableCell className="font-mono text-sm">{row.name}</TableCell>
                                <TableCell>{row.role}</TableCell>
                                <TableCell>
                                  <Badge variant="success">{row.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-[var(--pg-muted)]">{row.size}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="tokens" className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {['--primary', '--accent', '--muted'].map((token) => (
                        <div key={token} className="rounded-md border border-[var(--pg-line)] bg-white p-4">
                          <div className="mb-3 h-10 rounded-sm bg-[var(--pg-accent)]" />
                          <p className="font-mono text-sm">{token}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="imports" className="mt-4">
                    <pre className="overflow-x-auto rounded-md bg-[#101417] p-4 text-sm text-[#d7f7e7]">
                      <code>{"import { Button, Card, Tabs } from '@kssbox/ui'"}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>

              <aside className="space-y-5">
                <Card className="rounded-md border-[var(--pg-line)] bg-[var(--pg-ink)] text-white shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="size-5 text-[var(--pg-accent)]" />
                      Demo health
                    </CardTitle>
                    <CardDescription className="text-white/65">
                      Local package integration status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Metric label="Imports" value="18" />
                      <Metric label="Mode" value={density} />
                    </div>
                    <Progress value={progress} />
                  </CardContent>
                </Card>

                <Card className="rounded-md border-[var(--pg-line)] shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Code2 className="size-5" />
                      Local packages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {packageRows.map((row) => (
                      <div key={row.name} className="flex items-center justify-between border-b border-[var(--pg-line)] pb-3 last:border-0 last:pb-0">
                        <span className="font-mono text-xs">{row.name}</span>
                        <Badge variant="outline">{row.status}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button variant="outline" className="w-full justify-between" size="lg">
                  <span className="inline-flex items-center gap-2">
                    <Settings2 className="size-4" />
                    Open settings
                  </span>
                  <ArrowUpRight className="size-4" />
                </Button>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold capitalize">{value}</p>
    </div>
  )
}
