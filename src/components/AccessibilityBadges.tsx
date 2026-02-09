'use client';

interface AccessibilityBadgesProps {
  wheelchairAccessibleParking?: boolean | null;
  wheelchairAccessibleEntrance?: boolean | null;
  wheelchairAccessibleRestroom?: boolean | null;
  wheelchairAccessibleSeating?: boolean | null;
}

export default function AccessibilityBadges(props: AccessibilityBadgesProps) {
  const badges: string[] = [];

  if (props.wheelchairAccessibleEntrance) badges.push('♿ Accessible Entrance');
  if (props.wheelchairAccessibleParking) badges.push('♿ Accessible Parking');
  if (props.wheelchairAccessibleRestroom) badges.push('♿ Accessible Restroom');
  if (props.wheelchairAccessibleSeating) badges.push('♿ Accessible Seating');

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
