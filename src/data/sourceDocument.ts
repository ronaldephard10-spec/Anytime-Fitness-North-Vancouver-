export interface CoverallDocumentInfo {
  documentTitle: string;
  accountNumber: string;
  customerName: string;
  customerAddress: string;
  printingDate: string;
  totalAnnualVisits: number;
  primaryContact: {
    name: string;
    phone: string;
    email: string;
  };
  secondaryContact: {
    name: string;
    phone: string;
  };
  franchisee: {
    name: string;
    system: string;
    officeFax: string;
  };
  facilityDetails: {
    frequency: string;
    cleaningHours: string;
    scheduledDays: string[];
    keysReceived: string;
    startDate: string;
    initialCleanDone: boolean;
    billingMonthly: string;
    suppliesOrderedBy: string;
    areasToService: string[];
  };
}

export const ORIGINAL_SOURCE_DOCUMENT: CoverallDocumentInfo = {
  documentTitle: "Coverall Health-Based Cleaning System Franchisee Work Agreement & 12-Month Schedule",
  accountNumber: "3007",
  customerName: "Anytime Fitness North Vancouver",
  customerAddress: "103 - 2180 Dollarton Hwy, North Vancouver, BC V7H 0B5",
  printingDate: "May 20, 2026",
  totalAnnualVisits: 156,
  primaryContact: {
    name: "Jennifer Johnson",
    phone: "604-785-4857",
    email: "jen.johnson@anytimefitness.ca",
  },
  secondaryContact: {
    name: "Tara",
    phone: "604-620-0048",
  },
  franchisee: {
    name: "Ronald Ephard",
    system: "Coverall Health-Based Cleaning System",
    officeFax: "(604) 434-7774",
  },
  facilityDetails: {
    frequency: "3x / Week (Tuesday, Thursday, Sunday after 11:00 PM — 156 Visits / Year)",
    cleaningHours: "After 11:00 PM (After Hours)",
    scheduledDays: ["Tuesday", "Thursday", "Sunday"],
    keysReceived: "1 Fob + 1 Key",
    startDate: "May 20, 2026 (Agreement Printed: May 20, 2026 • 12-Month Schedule: 156 Visits)",
    initialCleanDone: true,
    billingMonthly: "$685.00 / month",
    suppliesOrderedBy: "Customer",
    areasToService: [
      "Entrance Foyer & Front Lobby (Unit 103)",
      "Private Offices & Administrative Areas",
      "Restrooms & Locker Rooms",
      "Showers & Wet Change Areas",
      "Kitchens & Staff Breakrooms",
      "Weight Room, Functional Training & Cardio Floor",
      "Storage & Janitor's Closet Area",
      "Entrance Doors & Glazing",
      "Window Blinds & Perimeter Sills",
      "Interior Glass Partition Walls & Conference Dividers",
    ],
  },
};

export interface ServiceFrequencyItem {
  id: string;
  section: string;
  task: string;
  frequency: '3x Week' | '2x Week' | '1x Week' | '1x Month' | 'Periodic / Annual';
  dayOrTiming: string;
  toolsSupplies: string;
  notes?: string;
}

export const WORK_SCHEDULE_ITEMS: ServiceFrequencyItem[] = [
  // DAILY / 3X WEEK SERVICES (Pages 3-6 of Source Agreement)

  // 1. ENTRANCE & FOYER (3x / Week)
  {
    id: 'ws-entrance-foyer-doors',
    section: 'Entrance & Foyer Area',
    task: 'Clean and spot clean entrance glass doors (inside & outside), doorframes, and polish handles/trim. Remove fingerprints and smudges.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade glass disinfectant',
  },
  {
    id: 'ws-entrance-foyer-mats',
    section: 'Entrance & Foyer Area',
    task: 'Vacuum entryway walk-on carpet mats, clean entrance tracks, and shake out dirt.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Commercial HEPA upright vacuum',
  },
  {
    id: 'ws-entrance-foyer-reception',
    section: 'Entrance & Foyer Area',
    task: 'Clean and sanitize front lobby check-in desk, reception counter surfaces, and member greeting areas.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Disinfectant wipe & microfiber cloth',
  },
  {
    id: 'ws-entrance-foyer-touchpoints',
    section: 'Entrance & Foyer Area',
    task: 'Sanitize high-touch entrance touchpoints: key fob scanner, push bars, door hardware, light switches, and wipe entryway doorframes.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'EPA-registered hospital disinfectant',
  },
  {
    id: 'ws-entrance-foyer-floor',
    section: 'Entrance & Foyer Area',
    task: 'Damp mop entrance tile / foyer floor with neutral disinfectant cleaner.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Microfiber color-coded flat mopping system',
  },

  // 2. OFFICE CLEANING (3x / Week)
  {
    id: 'ws-office-desks-surfaces',
    section: 'Office Cleaning',
    task: 'Spot clean all desks, credenzas, tables, counters, doorframes, and light switches in private offices.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-office-furniture-position',
    section: 'Office Cleaning',
    task: 'Properly position furniture, desk chairs, and client meeting chairs in offices.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Physical alignment standard',
  },
  {
    id: 'ws-office-trash',
    section: 'Office Cleaning',
    task: 'Empty office trash and recycling receptacles, replace with fresh trash liners, and wipe exterior bins.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Heavy duty trash liners & sanitizing wipes',
  },
  {
    id: 'ws-office-floors',
    section: 'Office Cleaning',
    task: 'Vacuum office carpeting and damp mop hard floor chair protector mats.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Commercial HEPA upright vacuum & microfiber flat mop',
  },
  {
    id: 'ws-office-lights',
    section: 'Office Cleaning',
    task: 'Turn off designated office lights upon completion of shift (Office only) and verify room security.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Office switches',
  },

  // 3. GENERAL GYM & AMENITY AREAS (3x / Week)
  {
    id: 'ws-mirrors',
    section: 'General Workout Floor & Amenities',
    task: 'Clean all gym weight room mirrors, training glass, and remove splash marks and smudges.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and streak-free glass cleaner',
  },
  {
    id: 'ws-trash',
    section: 'General Workout Floor & Amenities',
    task: 'Empty all trash receptacles across gym floor and locker rooms, take to designated area, and replace liners.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Heavy duty trash liners & sanitizing wipes',
  },
  {
    id: 'ws-water-dispensers',
    section: 'General Workout Floor & Amenities',
    task: 'Clean and sanitize water dispensers / bottle refill stations, drip trays, and nozzles.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Hospital grade disinfectant & sanitized microfibers',
  },
  {
    id: 'ws-cubbies',
    section: 'General Workout Floor & Amenities',
    task: 'Clean, dust, and sanitize member storage cubbies, lockers, and bag racks.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Duster & microfiber disinfectant cloth',
  },

  // 4. HARD FLOOR CARE (3x / Week)
  {
    id: 'ws-dust-mop',
    section: 'Floor Cleaning (Carpet, Tile, Concrete)',
    task: 'Dust mop all hard-surface floors.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Microfiber color-coded flat mopping system',
  },
  {
    id: 'ws-damp-mop',
    section: 'Floor Cleaning (Carpet, Tile, Concrete)',
    task: 'Damp mop all hard surface floors with hospital grade disinfectant.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Microfiber color-coded flat mopping system & hospital disinfectant',
  },
  {
    id: 'ws-concrete-mop',
    section: 'Floor Cleaning (Carpet, Tile, Concrete)',
    task: 'Sweep or damp mop designated concrete floor areas.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Heavy duty sweep & flat mop',
  },

  // 5. RESTROOMS & SHOWERS (3x / Week)
  {
    id: 'ws-restrooms-fixtures',
    section: 'Restrooms',
    task: 'Clean all dispensers and fixtures. Clean and disinfect washbasins, toilets, urinals and countertops.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-restrooms-mop',
    section: 'Restrooms',
    task: 'Mop all restroom floors with hospital grade disinfectant flat mop.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Microfiber color-coded flat mopping system & hospital disinfectant',
  },
  {
    id: 'ws-restrooms-metal-mirrors',
    section: 'Restrooms',
    task: 'Clean all metal, chrome fixtures, and restroom mirrors.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths, hospital disinfectant and glass cleaner',
  },
  {
    id: 'ws-restrooms-restock',
    section: 'Restrooms',
    task: 'Restock all paper towels, toilet tissue, soap, sanitary products and empty trash receptacles.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Supplies ordered by Customer',
  },
  {
    id: 'ws-restrooms-walls',
    section: 'Restrooms',
    task: 'Spot clean all restroom walls and/or partitions.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and hospital disinfectant',
  },
  {
    id: 'ws-restrooms-showers',
    section: 'Restrooms & Showers',
    task: 'Clean and disinfect all showers thoroughly.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Color-coded microfiber cloths and hospital disinfectant',
  },

  // 6. CLOSING INSTRUCTIONS (3x / Week)
  {
    id: 'ws-closing-logbook',
    section: 'Closing Instructions',
    task: 'Check logbook for special instructions or messages from club management.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Franchisee logbook review',
  },
  {
    id: 'ws-closing-closet',
    section: 'Closing Instructions',
    task: 'Clean and organize janitor\'s closet, store chemicals, and rinse mop pads.',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Chemical organization and storage racks',
  },
  {
    id: 'ws-closing-security',
    section: 'Closing Instructions',
    task: 'Verify facility perimeter, lock all exterior doors and windows (1 Fob + 1 Key).',
    frequency: '3x Week',
    dayOrTiming: 'Every Sun, Tue, Thu at 11:00 PM',
    toolsSupplies: 'Physical keys (1 Fob + 1 Key)',
  },

  // WEEKLY SERVICES
  {
    id: 'ws-microwaves',
    section: 'Kitchens / Breakrooms',
    task: 'Clean inside of microwaves.',
    frequency: '1x Week',
    dayOrTiming: 'Every Sunday Shift',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-traffic-vacuum',
    section: 'Floor Cleaning (Carpet, Tile, Concrete)',
    task: 'Traffic vacuuming of high traffic areas including walk on mats.',
    frequency: '2x Week',
    dayOrTiming: 'Sunday & Thursday Shifts',
    toolsSupplies: 'Commercial HEPA upright vacuum',
  },
  {
    id: 'ws-dust-partitions',
    section: 'Internal Glass Cleaning, Window Cleaning',
    task: 'Dust glass/plexi-glass sections of partitions and doors with colour coded microfiber or approved dusting methods. Remove smudges and fingerprints.',
    frequency: '1x Week',
    dayOrTiming: 'Every Sunday Shift (except 3rd Sunday which receives 1x Month deep clean)',
    toolsSupplies: 'Microfiber duster & glass wipe',
  },
  {
    id: 'ws-high-low-dust',
    section: 'Office Areas & Gym Perimeter',
    task: 'Dust low shelves, surfaces, corners and high areas up to 6 ft. Dust all picture frames.',
    frequency: '1x Week',
    dayOrTiming: 'Every Tuesday Shift',
    toolsSupplies: 'Extension duster and microfiber',
  },
  {
    id: 'ws-dust-furniture-fixtures',
    section: 'Office Areas & Gym Perimeter',
    task: 'Dust all fixtures and office furniture including computer monitors, file cabinets, desks, credenzas, countertops, display units and window ledges.',
    frequency: '1x Week',
    dayOrTiming: 'Every Tuesday Shift',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-damp-wipe',
    section: 'Office Areas & Entrances',
    task: 'Damp wipe all office furniture, desks, credenzas, and shelves.',
    frequency: '1x Week',
    dayOrTiming: 'Every Thursday Shift',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-telephones',
    section: 'Office Areas & Entrances',
    task: 'Clean and disinfect all telephones.',
    frequency: '1x Week',
    dayOrTiming: 'Every Thursday Shift',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
  },
  {
    id: 'ws-carpet-spot-vacuum',
    section: 'Floor Cleaning (Carpet, Tile, Concrete)',
    task: 'Vacuum and remove spots (1" in diameter) from carpeted areas including walk on mats. Vacuum or damp mop floor protector mats by desks.',
    frequency: '1x Week',
    dayOrTiming: 'Every Thursday Shift',
    toolsSupplies: 'Spot cleaner, damp mop & HEPA commercial vacuum',
  },

  // MONTHLY ROTATION SERVICES (Pages 7-19)
  // MONTHLY ROTATING SERVICES (Coverall Commercial Cleaning Schedule • 156-Visit Contract)
  {
    id: 'ws-month-partition-glass',
    section: 'Internal Glass & Partition Walls',
    task: 'Clean partition glass (interior glass partition walls, conference dividers, and sidelites).',
    frequency: '1x Month',
    dayOrTiming: '1st Tuesday of every Month',
    toolsSupplies: 'Color-coded microfiber cloths and streak-free professional glass cleaner',
    notes: 'Mandated on 1st Tuesday. Cleans all conference glass sidelites and partition dividers.',
  },
  {
    id: 'ws-month-vents-fixtures',
    section: 'Ceilings & High Dusting',
    task: 'Dust all light fixtures, ceiling vents and areas above 6 ft. and up to 10 ft., such as corners and horizontal surfaces.',
    frequency: '1x Month',
    dayOrTiming: '2nd Tuesday of every Month',
    toolsSupplies: 'High reach vacuum pole & static microfiber duster (6-10 ft)',
    notes: 'Scheduled: 2nd Tuesday of each month.',
  },
  {
    id: 'ws-month-refrigerator',
    section: 'Kitchens / Breakrooms',
    task: 'Clean inside of refrigerators (shelves, crisper bins, door gaskets).',
    frequency: '1x Month',
    dayOrTiming: '2nd Sunday of every Month',
    toolsSupplies: 'Color-coded microfiber cloths and hospital grade disinfectant',
    notes: 'Deep interior sanitation of refrigerator.',
  },
  {
    id: 'ws-month-entrance-blinds',
    section: 'Window Coverings & Entrance',
    task: 'Clean glass entrance doors, polish trim, and dust all window blinds.',
    frequency: '1x Month',
    dayOrTiming: '3rd Tuesday of every Month',
    toolsSupplies: 'Microfiber blind duster & vacuum attachment',
    notes: 'Scheduled: 3rd Tuesday of each month.',
  },
  {
    id: 'ws-month-furniture-vacuum',
    section: 'Furniture & Seating',
    task: 'Vacuum all fabric type furniture. Wipe down plastic and leather furniture.',
    frequency: '1x Month',
    dayOrTiming: '2nd Thursday of every Month',
    toolsSupplies: 'Color-coded microfiber cloths, upholstery vacuum attachment & hospital disinfectant',
    notes: 'Scheduled: 2nd Thursday of each month.',
  },
  {
    id: 'ws-month-edge-vacuum',
    section: 'Floor Perimeter Detail',
    task: 'Detail edge vacuum around all furniture and walls.',
    frequency: '1x Month',
    dayOrTiming: '3rd Thursday of every Month',
    toolsSupplies: 'Commercial crevice tool vacuuming',
    notes: 'Scheduled: 3rd Thursday of each month.',
  },
  {
    id: 'ws-month-partition-detail',
    section: 'Glass & Partitions',
    task: 'Partition Glass Detail (Streak-free squeegee and frame polish).',
    frequency: '1x Month',
    dayOrTiming: '4th Sunday of every Month',
    toolsSupplies: 'Hospital glass cleaner, rubber squeegee, microfiber edger',
    notes: 'Deep monthly glass squeegee detail on all gym partition glass panes.',
  },

  // ANNUAL & PERIODIC SPECIAL SERVICES (Page 21)
  {
    id: 'ws-special-initial-clean',
    section: 'Special Service Agreement (Page 21)',
    task: 'Initial Clean (includes monthly services)',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Completed on Contract Start (Sept 13, 2026)',
    toolsSupplies: 'Full facility deep scrub, sanitation and detail',
    notes: 'Initial handover baseline clean',
  },
  {
    id: 'ws-special-strip-refinish',
    section: 'Special Service Agreement (Page 21)',
    task: 'Hard Floor Strip & Refinish',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Scheduled Annually or Bi-Annually as Requested',
    toolsSupplies: 'Floor stripper machine, neutralizer, multi-coat polymer finish',
    notes: 'Complete stripping of old wax down to bare tile/flooring and re-sealing',
  },
  {
    id: 'ws-special-scrub-wax',
    section: 'Special Service Agreement (Page 21)',
    task: 'Scrub & Wax Maintenance',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Periodic High-Traffic Maintenance (e.g. Semi-Annual)',
    toolsSupplies: 'High-speed rotary scrubber and topcoat wax buffing',
    notes: 'Removes surface scuffs and restores high gloss protective finish',
  },
  {
    id: 'ws-special-extract-carpets',
    section: 'Special Service Agreement (Page 21)',
    task: 'Deep Carpet & Walk-on Mat Extraction',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Periodic Deep Clean (Annual / Semi-Annual)',
    toolsSupplies: 'Commercial hot-water extraction machine & heavy soil pre-treatment',
    notes: 'Full deep water rinse extraction of embedded sweat, dirt, and gym grit',
  },
  {
    id: 'ws-special-interior-windows',
    section: 'Special Service Agreement (Page 21)',
    task: 'Complete Interior Windows Wash & Detail',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Periodic Detailing (Quarterly or Semi-Annual)',
    toolsSupplies: 'Squeegees, scrubbers, streak-free window solution, sill detailers',
    notes: 'Full coverage of all architectural glass panes and transoms',
  },
  {
    id: 'ws-special-exterior-windows',
    section: 'Special Service Agreement (Page 21)',
    task: 'Exterior Windows Cleaning',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Periodic Detailing as Requested by Franchisee/Customer',
    toolsSupplies: 'Exterior squeegees, water-fed poles or ladder access',
    notes: 'Commercial street-facing exterior glass cleaning',
  },
  {
    id: 'ws-special-upholstery',
    section: 'Special Service Agreement (Page 21)',
    task: 'Upholstery Deep Cleaning & Sanitization',
    frequency: 'Periodic / Annual',
    dayOrTiming: 'Periodic (Annual or As Needed)',
    toolsSupplies: 'Fabric extraction tool, antimicrobial fabric sanitizer',
    notes: 'All fabric lounge chairs, lobby seating, and office cloth chairs',
  },
];
