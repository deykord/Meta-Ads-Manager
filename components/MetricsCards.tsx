import React from 'react';
import { Campaign } from '../types';
import { DollarSign, Eye, MousePointer, TrendingUp, Target } from 'lucide-react';

interface MetricsCardsProps {
  campaigns: Campaign[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ campaigns }) => {
  // Aggregate data
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

  const cards = [
    {
      title: 'Total Spend',
      value: `$${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Impressions',
      value: totalImpressions.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Clicks',
      value: totalClicks.toLocaleString(),
      icon: MousePointer,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Conversions',
      value: totalConversions.toLocaleString(),
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Avg. CTR',
      value: `${avgCtr.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">{card.title}</span>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;