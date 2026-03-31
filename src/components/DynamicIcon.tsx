import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function DynamicIcon({ name, size = 16, className, style }: DynamicIconProps) {
  const Icon = (Icons as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>)[name];
  if (!Icon) return <Icons.HelpCircle size={size} className={className} style={style} />;
  return <Icon size={size} className={className} style={style} />;
}
