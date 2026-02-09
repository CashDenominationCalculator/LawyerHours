interface StatisticsSectionProps {
  cityName: string;
  totalAttorneys: number;
  eveningCount: number;
  weekendCount: number;
  emergencyCount: number;
}

export default function StatisticsSection({
  cityName,
  totalAttorneys,
  eveningCount,
  weekendCount,
  emergencyCount,
}: StatisticsSectionProps) {
  if (totalAttorneys === 0) return null;

  const eveningPct = Math.round((eveningCount / totalAttorneys) * 100);
  const weekendPct = Math.round((weekendCount / totalAttorneys) * 100);
  const emergencyPct = Math.round((emergencyCount / totalAttorneys) * 100);

  const stats = [
    {
      label: 'Total Attorneys',
      value: totalAttorneys,
      suffix: '',
      color: 'text-gray-900',
      bg: 'bg-gray-50',
      icon: '⚖️',
    },
    {
      label: 'Evening Hours',
      value: eveningPct,
      suffix: '%',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      icon: '🌙',
      sub: `${eveningCount} of ${totalAttorneys}`,
    },
    {
      label: 'Weekend Hours',
      value: weekendPct,
      suffix: '%',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      icon: '📅',
      sub: `${weekendCount} of ${totalAttorneys}`,
    },
    {
      label: 'Emergency Available',
      value: emergencyPct,
      suffix: '%',
      color: 'text-red-700',
      bg: 'bg-red-50',
      icon: '🚨',
      sub: `${emergencyCount} of ${totalAttorneys}`,
    },
  ];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Attorney Availability in {cityName}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-5 text-center`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}{stat.suffix}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">{stat.label}</div>
            {stat.sub && (
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
