import { Card, CardContent } from "./card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
          <Icon className="text-primary text-2xl" />
        </div>
        {trend && (
          <div className={`mt-2 text-xs ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </div>
        )}
        {subtitle && (
          <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
