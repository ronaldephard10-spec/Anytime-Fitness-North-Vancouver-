import { InspectionItem } from '../types/inspection';

export const CORE_SERVICES: InspectionItem[] = [
  {
    id: 'core-entrance-foyer',
    name: 'Entrance & Foyer Cleaning',
    category: 'core',
    applicableDays: ['all'],
    description: 'Clean entrance glass doors inside/out, sanitize door handles & push plates, wipe reception check-in counter, vacuum walk-on mats, and mop foyer floor.',
  },
  {
    id: 'core-office-cleaning',
    name: 'Office Cleaning & Organization',
    category: 'core',
    applicableDays: ['all'],
    description: 'Spot clean and sanitize desks, credenzas, tables, properly position office furniture, empty office trash with fresh liner, vacuum carpet, and turn off office lights.',
  },
  {
    id: 'core-restrooms-showers',
    name: 'Restrooms & Showers disinfection',
    category: 'core',
    applicableDays: ['all'],
    description: 'Disinfect all shower stalls, toilets, urinals, sink basins, fixtures, spot clean walls/partitions, and restock supplies.',
  },
  {
    id: 'core-mirrors-glass',
    name: 'Gym Mirrors & Glass spot cleaning',
    category: 'core',
    applicableDays: ['all'],
    description: 'Spot clean all weight room mirrors, training room glass, smudges, and splash marks.',
  },
  {
    id: 'core-trash',
    name: 'Trash & Waste Removal',
    category: 'core',
    applicableDays: ['all'],
    description: 'Empty all trash bins throughout gym floor, locker rooms, and office; replace with fresh liners.',
  },
  {
    id: 'core-water-dispensers',
    name: 'Water Dispensers & Refill Stations',
    category: 'core',
    applicableDays: ['all'],
    description: 'Sanitize bottle refill stations, drinking fountains, nozzles, splash panels, and drip trays.',
  },
  {
    id: 'core-cubbies',
    name: 'Member Storage Cubbies',
    category: 'core',
    applicableDays: ['all'],
    description: 'Wipe down and sanitize member storage cubbies, lockers, and bag check shelves.',
  },
  {
    id: 'core-floor-mopping',
    name: 'Hard Floor Mopping & Sweeping',
    category: 'core',
    applicableDays: ['all'],
    description: 'Dust mop and damp mop all hard surfaces, entryway tile, and restroom floors with neutral disinfectant detergent.',
  },
  {
    id: 'core-closet-supplies',
    name: 'Janitor Closet & Closing Security',
    category: 'core',
    applicableDays: ['all'],
    description: 'Ensure supply closet is organized, chemical bottles sealed, equipment stored, office lights switched off, and all exterior doors locked (1 Fob + 1 Key).',
  },
];

export const SUNDAY_SPECIFIC: InspectionItem[] = [
  {
    id: 'sun-microwave',
    name: 'Microwave interior',
    category: 'sunday',
    applicableDays: ['sunday'],
    description: 'Clean and sanitize staff/member microwave turntable and interior walls.',
  },
  {
    id: 'sun-partition-glass',
    name: 'Partition glass dusting',
    category: 'sunday',
    applicableDays: ['sunday'],
    description: 'Dust and wipe all architectural glass partition dividers and frames.',
  },
  {
    id: 'sun-traffic-vacuum',
    name: 'High-traffic vacuum',
    category: 'sunday',
    applicableDays: ['sunday'],
    description: 'Vacuum main thoroughfares, cardio row walkways, and entrance tracks thoroughly.',
  },
];

export const SUNDAY_MONTHLY: InspectionItem[] = [
  {
    id: 'sun-monthly-refrigerator',
    name: 'Refrigerator clean (Monthly)',
    category: 'monthly',
    applicableDays: ['sunday'],
    isMonthly: true,
    description: 'Monthly scheduled deep clean of interior refrigerator shelves, crispers, and exterior handle.',
  },
  {
    id: 'sun-monthly-partition-detail',
    name: 'Partition glass detail (Monthly)',
    category: 'monthly',
    applicableDays: ['sunday'],
    isMonthly: true,
    description: 'Monthly edge-to-edge streak-free squeegee detail on all gym partition glass panes.',
  },
];

export const TUESDAY_SPECIFIC: InspectionItem[] = [
  {
    id: 'tue-high-low-dusting',
    name: 'High/Low dusting (up to 6ft)',
    category: 'tuesday',
    applicableDays: ['tuesday'],
    description: 'Dust low shelves, surfaces, corners, picture frames, and high areas up to 6 feet.',
  },
  {
    id: 'tue-surface-dusting',
    name: 'Surface dusting (fixtures & office furniture)',
    category: 'tuesday',
    applicableDays: ['tuesday'],
    description: 'Dust all fixtures and office furniture including computer monitors, file cabinets, desks, credenzas, countertops, display units, and window ledges.',
  },
];

export const TUESDAY_MONTHLY: InspectionItem[] = [
  {
    id: 'tue-monthly-blinds-entrance',
    name: 'Blinds/Entrance glass (Monthly)',
    category: 'monthly',
    applicableDays: ['tuesday'],
    isMonthly: true,
    description: 'Monthly detailed dusting of window blinds and full wash of exterior & interior entrance glass.',
  },
  {
    id: 'tue-monthly-vents-fixtures',
    name: 'Ceiling vents/fixtures (Monthly)',
    category: 'monthly',
    applicableDays: ['tuesday'],
    isMonthly: true,
    description: 'Monthly vacuuming and wiping of HVAC return air vents, diffusers, and hanging light fixtures.',
  },
];

export const THURSDAY_SPECIFIC: InspectionItem[] = [
  {
    id: 'thu-wipe-desks-furniture',
    name: 'Damp wipe desks & office furniture',
    category: 'thursday',
    applicableDays: ['thursday'],
    description: 'Damp wipe and disinfect office desks, manager chairs, client meeting tables, credenzas, and shelves.',
  },
  {
    id: 'thu-sanitize-phones',
    name: 'Sanitize phones & check-in electronics',
    category: 'thursday',
    applicableDays: ['thursday'],
    description: 'Disinfect office desk phones, touchscreens, keypads, and check-in station scanners.',
  },
  {
    id: 'thu-carpet-spot-clean',
    name: 'Carpet spot vacuuming & desk floor mats',
    category: 'thursday',
    applicableDays: ['thursday'],
    description: 'Vacuum and remove spots (1" diameter) from carpet and walk-on mats; vacuum or damp mop floor protector mats under office desks.',
  },
  {
    id: 'thu-carpet-vacuum-full',
    name: 'Full floor carpet vacuum',
    category: 'thursday',
    applicableDays: ['thursday'],
    description: 'Complete wall-to-wall vacuuming of all carpeted cardio, turf transition, and office zones.',
  },
  {
    id: 'thu-traffic-vacuum',
    name: 'Traffic vacuum',
    category: 'thursday',
    applicableDays: ['thursday'],
    description: 'Targeted high-speed pass on entrance mats, stretching mats perimeter, and free-weight lanes.',
  },
];

export const THURSDAY_MONTHLY: InspectionItem[] = [
  {
    id: 'thu-monthly-detail-edge-vacuum',
    name: 'Detail edge vacuuming (Monthly)',
    category: 'monthly',
    applicableDays: ['thursday'],
    isMonthly: true,
    description: 'Monthly crevice tool vacuuming along all baseboard perimeters, weight racks, and corners.',
  },
  {
    id: 'thu-monthly-fabric-furniture',
    name: 'Fabric furniture vacuuming (Monthly)',
    category: 'monthly',
    applicableDays: ['thursday'],
    isMonthly: true,
    description: 'Monthly vacuuming and lint removal on member lounge chairs, fabric seating, and cushions.',
  },
];
