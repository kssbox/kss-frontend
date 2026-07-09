'use client'

import { useState, useMemo } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './popover'
import { ScrollArea } from './scroll-area'
import { Input } from './input'
import { Button } from './button'
import { cn } from '../../lib/utils'
import {
  Zap, Code, Settings, Globe, Database, Shield, Search, FileText,
  Mail, MessageSquare, Phone, Calendar, Clock, Camera, Image,
  Video, Music, Download, Upload, Cloud, Lock, Unlock, Key,
  Heart, Star, Bookmark, Bell, AlertCircle, Info, HelpCircle,
  CheckCircle, XCircle, Eye, EyeOff, Edit, Trash2, Copy,
  Link, ExternalLink, Share2, Send, Inbox, Archive,
  Folder, File, Terminal, Monitor, Smartphone, Tablet,
  Wifi, Bluetooth, Battery, Cpu, HardDrive, Server,
  MapPin, Navigation, Compass, Map, Home, Building,
  Users, User, UserPlus, UserCheck, UserX, CreditCard,
  ShoppingCart, Package, Gift, Truck, DollarSign, TrendingUp,
  BarChart2, PieChart, Activity, Layers, Grid, Layout,
  Maximize, Minimize, RotateCw, RefreshCw, Repeat, Shuffle,
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Sun, Moon, CloudRain, Thermometer, Droplets, Wind,
  Scissors, Paperclip, Pen, Type, Hash, AtSign,
  Lightbulb, Rocket, Target, Award, Flag, Flame,
  Wrench, Hammer, Bug, GitBranch, GitCommit, GitMerge,
  Bot, BrainCircuit, Sparkles, Wand2, Puzzle, Blocks,
  type LucideIcon,
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Code, Settings, Globe, Database, Shield, Search, FileText,
  Mail, MessageSquare, Phone, Calendar, Clock, Camera, Image,
  Video, Music, Download, Upload, Cloud, Lock, Unlock, Key,
  Heart, Star, Bookmark, Bell, AlertCircle, Info, HelpCircle,
  CheckCircle, XCircle, Eye, EyeOff, Edit, Trash2, Copy,
  Link, ExternalLink, Share2, Send, Inbox, Archive,
  Folder, File, Terminal, Monitor, Smartphone, Tablet,
  Wifi, Bluetooth, Battery, Cpu, HardDrive, Server,
  MapPin, Navigation, Compass, Map, Home, Building,
  Users, User, UserPlus, UserCheck, UserX, CreditCard,
  ShoppingCart, Package, Gift, Truck, DollarSign, TrendingUp,
  BarChart2, PieChart, Activity, Layers, Grid, Layout,
  Maximize, Minimize, RotateCw, RefreshCw, Repeat, Shuffle,
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Sun, Moon, CloudRain, Thermometer, Droplets, Wind,
  Scissors, Paperclip, Pen, Type, Hash, AtSign,
  Lightbulb, Rocket, Target, Award, Flag, Flame,
  Wrench, Hammer, Bug, GitBranch, GitCommit, GitMerge,
  Bot, BrainCircuit, Sparkles, Wand2, Puzzle, Blocks,
}

const ICON_ENTRIES = Object.entries(ICON_MAP)

export interface IconPickerProps {
  value?: string
  onChange?: (iconName: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return ICON_ENTRIES
    const lower = search.toLowerCase()
    return ICON_ENTRIES.filter(([name]) => name.toLowerCase().includes(lower))
  }, [search])

  const SelectedIcon = value ? ICON_MAP[value] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-full justify-start gap-2 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="size-4" />
              <span>{value}</span>
            </>
          ) : (
            <span>选择图标...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="搜索图标..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-8 gap-0.5 p-2">
            {filtered.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                className={cn(
                  'flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent',
                  value === name && 'bg-accent ring-1 ring-primary',
                )}
                title={name}
                onClick={() => {
                  onChange?.(name)
                  setOpen(false)
                  setSearch('')
                }}
              >
                <Icon className="size-4" />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-8 py-6 text-center text-sm text-muted-foreground">
                没有找到匹配的图标
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export interface SkillIconProps {
  name?: string
  className?: string
  fallback?: LucideIcon
}

export function SkillIcon({ name, className, fallback: Fallback = Zap }: SkillIconProps) {
  const Icon = name ? ICON_MAP[name] : null
  if (Icon) return <Icon className={className} />
  return <Fallback className={className} />
}
