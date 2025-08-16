import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const StatsCard = ({ title, value, description, icon: Icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% dari bulan lalu
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;