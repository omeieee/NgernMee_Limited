// src/components/ui/CategoryIcon.tsx
// Dynamic Lucide icon renderer for categories

import React from 'react';
import {
  Utensils,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Shirt,
  Zap,
  PiggyBank,
  MoreHorizontal,
  Coffee,
  Fuel,
  Train,
  Wrench,
  Stethoscope,
  ShieldCheck,
  Droplets,
  Wifi,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Circle,
  Navigation,
  PartyPopper,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coins,
  Tag,
  CreditCard,
  Sparkles,
  Calculator,
  BarChart3,
  LayoutGrid,
  Settings,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  shirt: Shirt,
  zap: Zap,
  'piggy-bank': PiggyBank,
  'more-horizontal': MoreHorizontal,
  coffee: Coffee,
  fuel: Fuel,
  train: Train,
  wrench: Wrench,
  stethoscope: Stethoscope,
  'shield-check': ShieldCheck,
  droplets: Droplets,
  wifi: Wifi,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  gift: Gift,
  'plus-circle': PlusCircle,
  navigation: Navigation,
  'party-popper': PartyPopper,
  circle: Circle,
  receipt: Receipt,
  'arrow-up-right': ArrowUpRight,
  'arrow-down-right': ArrowDownRight,
  wallet: Wallet,
  coins: Coins,
  tag: Tag,
  'credit-card': CreditCard,
  sparkles: Sparkles,
  calculator: Calculator,
  'bar-chart-3': BarChart3,
  'layout-grid': LayoutGrid,
  settings: Settings,
};

interface CategoryIconProps extends Omit<LucideProps, 'name'> {
  name: string | null | undefined;
  fallback?: React.FC<LucideProps>;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, fallback = Tag, ...props }) => {
  const IconComponent = name && ICON_MAP[name] ? ICON_MAP[name] : fallback;
  return <IconComponent {...props} />;
};
