'use client';

interface PaymentIconsProps {
  acceptsCreditCards?: boolean | null;
  acceptsDebitCards?: boolean | null;
  cashOnly?: boolean | null;
  acceptsNfc?: boolean | null;
}

export default function PaymentIcons({ acceptsCreditCards, acceptsDebitCards, cashOnly, acceptsNfc }: PaymentIconsProps) {
  const items: { label: string; icon: string }[] = [];

  if (acceptsCreditCards) items.push({ label: 'Credit Cards', icon: '💳' });
  if (acceptsDebitCards) items.push({ label: 'Debit Cards', icon: '🏧' });
  if (cashOnly) items.push({ label: 'Cash Only', icon: '💵' });
  if (acceptsNfc) items.push({ label: 'Contactless', icon: '📱' });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
          title={item.label}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
