'use client';

interface ParkingBadgeProps {
  freeParkingLot?: boolean | null;
  paidParkingLot?: boolean | null;
  freeStreetParking?: boolean | null;
  valetParking?: boolean | null;
  freeGarageParking?: boolean | null;
  paidGarageParking?: boolean | null;
}

export default function ParkingBadge(props: ParkingBadgeProps) {
  const badges: { label: string; color: string }[] = [];

  if (props.freeParkingLot) badges.push({ label: 'Free Lot', color: 'bg-green-100 text-green-700' });
  if (props.freeGarageParking) badges.push({ label: 'Free Garage', color: 'bg-green-100 text-green-700' });
  if (props.freeStreetParking) badges.push({ label: 'Street Parking', color: 'bg-blue-100 text-blue-700' });
  if (props.paidParkingLot) badges.push({ label: 'Paid Lot', color: 'bg-amber-100 text-amber-700' });
  if (props.paidGarageParking) badges.push({ label: 'Paid Garage', color: 'bg-amber-100 text-amber-700' });
  if (props.valetParking) badges.push({ label: 'Valet', color: 'bg-purple-100 text-purple-700' });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${badge.color}`}
        >
          🅿️ {badge.label}
        </span>
      ))}
    </div>
  );
}
