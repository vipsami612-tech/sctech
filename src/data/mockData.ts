import { Video, Channel, ShortItem, Playlist, NotificationItem } from '../types';

// Helper to generate a rich SVG data URI thumbnail
export function generateThumbnailSvg(
  title: string,
  category: string,
  gradientStart: string,
  gradientEnd: string,
  accentColor: string,
  iconType: 'play' | 'code' | 'game' | 'film' | 'car' | 'mountain' | 'sparkle'
): string {
  const iconSvg = {
    play: `<polygon points="40,25 70,45 40,65" fill="${accentColor}" />`,
    code: `<path d="M35 30 L20 45 L35 60 M65 30 L80 45 L65 60 M55 25 L45 65" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" fill="none" />`,
    game: `<rect x="25" y="32" width="50" height="28" rx="8" fill="none" stroke="${accentColor}" stroke-width="4" /><circle cx="40" cy="46" r="3" fill="${accentColor}"/><circle cx="60" cy="46" r="3" fill="${accentColor}"/>`,
    film: `<rect x="25" y="28" width="50" height="34" rx="4" fill="none" stroke="${accentColor}" stroke-width="3" /><circle cx="50" cy="45" r="8" fill="${accentColor}"/>`,
    car: `<path d="M25 50 L35 34 L65 34 L75 50 Z M30 50 A 6 6 0 0 0 42 50 M58 50 A 6 6 0 0 0 70 50" stroke="${accentColor}" stroke-width="3.5" fill="none"/>`,
    mountain: `<path d="M20 58 L45 28 L60 45 L70 34 L85 58 Z" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linejoin="round"/>`,
    sparkle: `<path d="M50 20 L54 38 L72 42 L54 46 L50 64 L46 46 L28 42 L46 38 Z" fill="${accentColor}"/>`
  }[iconType];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="40%" stop-color="transparent" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="640" height="360" fill="url(#bgGrad)" />
    <rect width="640" height="360" fill="url(#grid)" />
    <g transform="translate(270, 95) scale(1.0)">
      <circle cx="50" cy="45" r="42" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      ${iconSvg}
    </g>
    <rect width="640" height="360" fill="url(#overlay)" />
    <text x="36" y="52" fill="${accentColor}" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2">${category.toUpperCase()}</text>
    <text x="36" y="300" fill="#ffffff" font-family="system-ui, sans-serif" font-size="24" font-weight="800" text-anchor="start">
      ${title.length > 36 ? title.substring(0, 34) + '...' : title}
    </text>
    <text x="36" y="328" fill="rgba(255,255,255,0.7)" font-family="system-ui, sans-serif" font-size="13" font-weight="500">
      SVTECH MEDIA ORIGINAL · 4K 60FPS
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'blender-foundation',
    name: 'Blender Foundation',
    handle: '@BlenderStudio',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
    subscribers: '3.42M',
    subscriberCountNumber: 3420000,
    verified: true,
    description: 'Official channel of the Blender Foundation and Blender Open Movie Studio. We pioneer open-source 3D graphics, visual effects, and CGI film production.',
    joinedDate: 'Jun 12, 2011',
    totalViews: '542,891,020',
    videosCount: 148,
    featuredVideoId: 'video-1'
  },
  {
    id: 'tech-overdrive',
    name: 'Tech Overdrive',
    handle: '@TechOverdrive',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    subscribers: '1.89M',
    subscriberCountNumber: 1890000,
    verified: true,
    description: 'The pinnacle of hardware teardowns, extreme overclocking, AI engineering workstation builds, and in-depth tech deep dives.',
    joinedDate: 'Jan 15, 2018',
    totalViews: '210,430,900',
    videosCount: 420,
    featuredVideoId: 'video-5'
  },
  {
    id: 'cinema-odyssey',
    name: 'Cinema Odyssey VFX',
    handle: '@CinemaOdyssey',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80',
    subscribers: '890K',
    subscriberCountNumber: 890000,
    verified: true,
    description: 'Sci-fi shorts, cutting edge motion capture, visual effects breakdowns, and cinematic storytelling crafted for the digital age.',
    joinedDate: 'Mar 24, 2019',
    totalViews: '98,720,110',
    videosCount: 92,
    featuredVideoId: 'video-2'
  },
  {
    id: 'supercar-rally',
    name: 'Apex Rally & Track',
    handle: '@ApexRallyTrack',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1600&auto=format&fit=crop&q=80',
    subscribers: '2.15M',
    subscriberCountNumber: 2150000,
    verified: true,
    description: 'High-speed tarmac sprints, rally stages across continents, hypercar engineering, and real automotive road-trip documentaries.',
    joinedDate: 'Oct 08, 2016',
    totalViews: '380,120,450',
    videosCount: 310,
    featuredVideoId: 'video-6'
  },
  {
    id: 'cyber-code-craft',
    name: 'Crafting Code & Web',
    handle: '@CraftingCodeWeb',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80',
    subscribers: '650K',
    subscriberCountNumber: 650000,
    verified: true,
    description: 'Modern full-stack architecture, clean TypeScript patterns, React 19 deep dives, and production-grade software craftsmanship.',
    joinedDate: 'Aug 19, 2020',
    totalViews: '45,390,200',
    videosCount: 165,
    featuredVideoId: 'video-3'
  },
  {
    id: 'nature-unbounded',
    name: 'Earth Unbounded',
    handle: '@EarthUnbounded',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
    subscribers: '4.2M',
    subscriberCountNumber: 4200000,
    verified: true,
    description: 'Cinematic 4K natural world journeys, mountain expeditions, oceanic wonders, and peaceful wildlife encounters.',
    joinedDate: 'Feb 10, 2015',
    totalViews: '890,440,000',
    videosCount: 280,
    featuredVideoId: 'video-4'
  }
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'video-1',
    title: 'Big Buck Bunny - 4K 60FPS CGI Open Animation Remastered',
    description: `A large and lovable rabbit deals with bullying forest creatures in this legendary open-source CGI animated classic produced by the Blender Foundation.\n\nRendered in Blender with cycles ray-tracing and full dynamic fur simulation. Experience the crisp 4K color grading, Dolby Atmos master soundmix, and hilarious woodland antics.\n\nTimestamps:\n0:00 - Sunrise in the Forest\n2:15 - Meet the Bully Trio\n5:10 - The Golden Carrot Trap\n8:00 - The Bunny Strikes Back\n9:20 - Credits & Open Art Assets`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Big Buck Bunny 4K Remaster',
      'Animation',
      '#064e3b',
      '#022c22',
      '#34d399',
      'film'
    ),
    duration: 596,
    durationFormatted: '9:56',
    views: 1245030,
    uploadDate: '3 days ago',
    category: 'Animation',
    channel: {
      id: 'blender-foundation',
      name: 'Blender Foundation',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '3.42M'
    },
    likes: 84200,
    dislikes: 120,
    tags: ['Blender', 'Animation', '4K', 'CGI', 'Open Source', 'Bunny'],
    chapters: [
      { title: 'Sunrise in the Forest', time: 0 },
      { title: 'Meet the Bully Trio', time: 135 },
      { title: 'The Golden Carrot Trap', time: 310 },
      { title: 'The Bunny Strikes Back', time: 480 },
      { title: 'Credits & Open Art Assets', time: 560 }
    ],
    commentsCount: 1420,
    accessType: 'free',
    price: 0,
    isPremium: false
  },
  {
    id: 'video-2',
    title: 'Tears of Steel - High Budget Cyberpunk Sci-Fi Short Film',
    description: `Set in a dystopian Amsterdam future, a group of scientists and warriors attempt to save the earth from rogue cybernetic tentacles using holographic time reconstruction.\n\nFeaturing cutting-edge open VFX pipelines, realistic robotic compositing, and full live-action motion matching.\n\nDirected by Ian Hubert. Produced by Ton Roosendaal.\nFree software used: Blender, GIMP, Krita, Inkscape.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Tears of Steel: Cyberpunk Amsterdam',
      'Sci-Fi',
      '#1e1b4b',
      '#0f172a',
      '#38bdf8',
      'sparkle'
    ),
    duration: 734,
    durationFormatted: '12:14',
    views: 890400,
    uploadDate: '1 week ago',
    category: 'Sci-Fi',
    channel: {
      id: 'cinema-odyssey',
      name: 'Cinema Odyssey VFX',
      handle: '@CinemaOdyssey',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '890K'
    },
    likes: 49300,
    dislikes: 85,
    tags: ['Sci-Fi', 'VFX', 'Cyberpunk', 'Robots', 'Amsterdam', 'Short Film'],
    chapters: [
      { title: 'The Old Church Briefing', time: 0 },
      { title: 'Robotic Attack on Dam Square', time: 180 },
      { title: 'Temporal Memory Calibration', time: 420 },
      { title: 'Final Reconciliation', time: 640 }
    ],
    commentsCount: 895,
    accessType: 'pro',
    price: 100,
    currency: 'ETB',
    isPremium: true
  },
  {
    id: 'video-3',
    title: 'Next-Gen Full Stack TypeScript Architecture (2026 Edition)',
    description: `How top engineering teams build scalable, ultra-responsive web applications with TypeScript, React 19, Tailwind CSS v4, and edge-native caching.\n\nWe break down folder architecture, composable state stores, zero-latency optimistic updates, and robust media streaming pipelines without performance bottlenecks.\n\nSource code repository linked on GitHub!`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Full Stack TS Architecture 2026',
      'Coding',
      '#1e293b',
      '#090d16',
      '#60a5fa',
      'code'
    ),
    duration: 15,
    durationFormatted: '0:15',
    views: 312000,
    uploadDate: '5 days ago',
    category: 'Coding',
    channel: {
      id: 'cyber-code-craft',
      name: 'Crafting Code & Web',
      handle: '@CraftingCodeWeb',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '650K'
    },
    likes: 21500,
    dislikes: 42,
    tags: ['TypeScript', 'React 19', 'WebDev', 'Programming', 'Architecture'],
    chapters: [
      { title: 'Architecture Overview', time: 0 },
      { title: 'State Flow & Microservices', time: 6 },
      { title: 'Production Benchmarks', time: 12 }
    ],
    commentsCount: 340
  },
  {
    id: 'video-4',
    title: 'Earth Unbounded: Untamed Mountain Expeditions & Wilderness 4K',
    description: `Immerse yourself in breathtaking 4K panoramic views of remote mountain ranges, crystal-clear glacial streams, and untouched forests.\n\nFilmed over 6 months across Patagonia, the Swiss Alps, and the Canadian Rockies with high-altitude cinema drones and medium-format sensors. Perfect for ambient focus, relaxation, or high-definition screen testing.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Untamed Mountain Wilderness 4K',
      'Travel',
      '#134e4a',
      '#042f2e',
      '#2dd4bf',
      'mountain'
    ),
    duration: 15,
    durationFormatted: '0:15',
    views: 540900,
    uploadDate: '2 weeks ago',
    category: 'Travel',
    channel: {
      id: 'nature-unbounded',
      name: 'Earth Unbounded',
      handle: '@EarthUnbounded',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '4.2M'
    },
    likes: 67800,
    dislikes: 19,
    tags: ['Nature', '4K', 'Mountains', 'Wildlife', 'Documentary', 'Calm'],
    chapters: [
      { title: 'Alpine Dawn', time: 0 },
      { title: 'Glacial Valleys', time: 7 },
      { title: 'Summit Sunset', time: 12 }
    ],
    commentsCount: 512,
    accessType: 'pro',
    price: 150,
    currency: 'ETB',
    isPremium: true
  },
  {
    id: 'video-5',
    title: 'Next-Gen Ray-Tracing Gaming Rig: 240FPS at 4K Ultrawide',
    description: `We pushed the latest quantum cooling liquid loop to the limit to benchmark AAA gaming titles at maximum ultra fidelity with path tracing enabled.\n\nWatch frame-time consistency analysis, thermal monitoring graphs, and side-by-side gameplay fidelity captures. Is 240Hz at 4K finally attainable for consumer rigs?`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: generateThumbnailSvg(
      '4K 240FPS Ultimate Gaming Rig',
      'Gaming',
      '#4c0519',
      '#1c040d',
      '#fb7185',
      'game'
    ),
    duration: 60,
    durationFormatted: '1:00',
    views: 940000,
    uploadDate: '4 days ago',
    category: 'Gaming',
    channel: {
      id: 'tech-overdrive',
      name: 'Tech Overdrive',
      handle: '@TechOverdrive',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '1.89M'
    },
    likes: 72100,
    dislikes: 110,
    tags: ['Gaming', 'Hardware', 'RTX', 'PC Build', 'Benchmark', 'Esports'],
    chapters: [
      { title: 'Component Rundown', time: 0 },
      { title: 'Liquid Loop Cooling Rig', time: 20 },
      { title: '4K Path Tracing Benchmarks', time: 42 }
    ],
    commentsCount: 978
  },
  {
    id: 'video-6',
    title: 'Track Day Showdown: 1,000HP Supercars Pushed to Redline',
    description: `Pure unadulterated naturally aspirated V10 and twin-turbo V8 engine roars. We took four world-class hypercars to the Nürburgring for timed sector laps and telemetry comparisons.\n\nOn-board pedal cameras, tire temperature heatmaps, and telemetry data synchronized in 4K high frame rate.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: generateThumbnailSvg(
      '1,000HP Track Day Showdown',
      'Automotive',
      '#431407',
      '#1a0601',
      '#fb923c',
      'car'
    ),
    duration: 15,
    durationFormatted: '0:15',
    views: 1120000,
    uploadDate: '6 days ago',
    category: 'Automotive',
    channel: {
      id: 'supercar-rally',
      name: 'Apex Rally & Track',
      handle: '@ApexRallyTrack',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '2.15M'
    },
    likes: 91400,
    dislikes: 130,
    tags: ['Supercars', 'TrackDay', 'Nurburgring', 'Racing', 'Automotive'],
    chapters: [
      { title: 'Warmup Lap & Pitlane', time: 0 },
      { title: 'Carousel High-G Cornering', time: 7 },
      { title: 'Final Straight Top Speed', time: 12 }
    ],
    commentsCount: 1130
  },
  {
    id: 'video-7',
    title: 'Sintel - The Legendary Fantasy Animated Dragon Quest',
    description: `The emotional journey of a lonely young girl searching the desert wasteland for her stolen companion dragon.\n\nCreated by the Blender Institute with an international team of open-source animators. Featuring grand fantasy landscapes, dramatic aerial combat, and an unforgettable story twist.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Sintel: The Dragon Quest 4K',
      'Animation',
      '#311042',
      '#13061c',
      '#c084fc',
      'film'
    ),
    duration: 52,
    durationFormatted: '0:52',
    views: 2480000,
    uploadDate: '1 month ago',
    category: 'Animation',
    channel: {
      id: 'blender-foundation',
      name: 'Blender Foundation',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '3.42M'
    },
    likes: 154000,
    dislikes: 310,
    tags: ['Blender', 'Sintel', 'Fantasy', 'Dragon', 'CGI', 'Adventure'],
    chapters: [
      { title: 'The Snow Blizzard', time: 0 },
      { title: 'Memory of Scales', time: 20 },
      { title: 'The Gate of Ismr', time: 40 }
    ],
    commentsCount: 3120
  },
  {
    id: 'video-8',
    title: 'Extreme Stress Testing: Can Hardware Survive 100°C Heat?',
    description: `What happens when cooling pumps fail under full GPU & CPU synthetic load? We disabled all chassis fans and measured throttle curves, solder joints, and emergency safety cutoff thresholds.\n\nWarning: Do not try this at home! All equipment tested inside fireproof isolation chambers.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Hardware Thermal Stress Test',
      'Tech',
      '#450a0a',
      '#180303',
      '#f87171',
      'sparkle'
    ),
    duration: 15,
    durationFormatted: '0:15',
    views: 410000,
    uploadDate: '3 days ago',
    category: 'Tech',
    channel: {
      id: 'tech-overdrive',
      name: 'Tech Overdrive',
      handle: '@TechOverdrive',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '1.89M'
    },
    likes: 31200,
    dislikes: 54,
    tags: ['Tech', 'TortureTest', 'Hardware', 'Overclocking', 'Thermals'],
    chapters: [
      { title: 'Test Chamber Setup', time: 0 },
      { title: 'Thermal runaway at 98C', time: 6 },
      { title: 'Emergency Cutoff Trigger', time: 11 }
    ],
    commentsCount: 420
  },
  {
    id: 'video-9',
    title: 'Transcontinental Rally: 3,000 Miles Across American Highways',
    description: `A non-stop rally adventure traversing 12 states in 72 hours. From coastal highways to desert flats, experience the camaraderie, roadside pit stops, and mechanical endurance of long-distance rallying.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Transcontinental Rally Tour',
      'Automotive',
      '#361204',
      '#140702',
      '#f97316',
      'car'
    ),
    duration: 47,
    durationFormatted: '0:47',
    views: 672000,
    uploadDate: '3 weeks ago',
    category: 'Automotive',
    channel: {
      id: 'supercar-rally',
      name: 'Apex Rally & Track',
      handle: '@ApexRallyTrack',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '2.15M'
    },
    likes: 42000,
    dislikes: 90,
    tags: ['Rally', 'Roadtrip', 'CoastToCoast', 'Cars', 'Highway'],
    chapters: [
      { title: 'Starting Grid Ceremony', time: 0 },
      { title: 'Desert Interstate Night Cruise', time: 22 },
      { title: 'Finish Line in Los Angeles', time: 38 }
    ],
    commentsCount: 680
  },
  {
    id: 'video-10',
    title: 'Overlanding & Wild Camping Across Rocky Mountain Trails',
    description: `Taking an all-wheel-drive overland rig deep into the backcountry. We navigate river crossings, muddy forest switchbacks, and set up camp under a pristine canopy of stars.\n\nTips on off-grid power management, solar setups, and trail recovery gear.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Rocky Mountain Overlanding',
      'Travel',
      '#14532d',
      '#052e16',
      '#4ade80',
      'mountain'
    ),
    duration: 594,
    durationFormatted: '9:54',
    views: 780500,
    uploadDate: '1 month ago',
    category: 'Travel',
    channel: {
      id: 'nature-unbounded',
      name: 'Earth Unbounded',
      handle: '@EarthUnbounded',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '4.2M'
    },
    likes: 54100,
    dislikes: 72,
    tags: ['Camping', 'Overland', 'Offroad', 'Mountains', 'Adventure'],
    chapters: [
      { title: 'Hitting the Dirt Trail', time: 0 },
      { title: 'River Crossing Technique', time: 210 },
      { title: 'Basecamp Setup & Stargazing', time: 480 }
    ],
    commentsCount: 710
  },
  {
    id: 'video-11',
    title: 'Elephants Dream - Surreal Sci-Fi Clockwork Machine World',
    description: `The very first open movie created by the Blender Foundation! Follow Proog and Emo as they navigate an infinitely complex mechanical machine where reality bends to perception.\n\nGroundbreaking open-source history with a brilliant philosophical narrative.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: generateThumbnailSvg(
      'Elephants Dream Clockwork',
      'Sci-Fi',
      '#1f2937',
      '#030712',
      '#a78bfa',
      'film'
    ),
    duration: 653,
    durationFormatted: '10:53',
    views: 1890000,
    uploadDate: '2 months ago',
    category: 'Sci-Fi',
    channel: {
      id: 'blender-foundation',
      name: 'Blender Foundation',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '3.42M'
    },
    likes: 112000,
    dislikes: 210,
    tags: ['Blender', 'ElephantsDream', 'Sci-Fi', 'Steampunk', 'Classic'],
    chapters: [
      { title: 'Entering the Machine Core', time: 0 },
      { title: 'The Telephone Gallery', time: 240 },
      { title: 'The Cable Room Climax', time: 520 }
    ],
    commentsCount: 2210
  },
  {
    id: 'video-12',
    title: 'Budget Car Rescue Challenge: Can You Buy a Fun Runner for $1,000?',
    description: `Can an ultra-cheap used car survive a 500-mile endurance test and a track lap without throwing a rod? We scour classifieds, inspect rust buckets, and fix up an unexpected road warrior.`,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnailUrl: generateThumbnailSvg(
      '$1,000 Budget Car Challenge',
      'Automotive',
      '#292524',
      '#0c0a09',
      '#facc15',
      'car'
    ),
    duration: 560,
    durationFormatted: '9:20',
    views: 920000,
    uploadDate: '3 weeks ago',
    category: 'Automotive',
    channel: {
      id: 'supercar-rally',
      name: 'Apex Rally & Track',
      handle: '@ApexRallyTrack',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
      subscribers: '2.15M'
    },
    likes: 67300,
    dislikes: 105,
    tags: ['BudgetCar', 'UsedCars', 'TrackDay', 'ProjectCar', 'Wrenching'],
    chapters: [
      { title: 'The Search & The Purchase', time: 0 },
      { title: 'Junkyard Repairs', time: 260 },
      { title: 'The 500 Mile Endurance Test', time: 480 }
    ],
    commentsCount: 1390
  }
];

export const INITIAL_SHORTS: ShortItem[] = [
  {
    id: 'short-1',
    title: 'When your CSS flexbox centers perfectly on the first try 🔥 #coding #shorts',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: generateThumbnailSvg('CSS Flexbox Magic', 'Shorts', '#1e1b4b', '#030712', '#38bdf8', 'code'),
    channel: {
      id: 'cyber-code-craft',
      name: 'Crafting Code & Web',
      handle: '@CraftingCodeWeb',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      verified: true
    },
    likes: 89400,
    commentsCount: 942,
    soundTitle: 'Original Audio - Cyber Sound Lab',
    tags: ['coding', 'webdev', 'tech']
  },
  {
    id: 'short-2',
    title: 'Secret 3D lighting setup used by Pixar animators 💡 #blender #3d',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: generateThumbnailSvg('Pixar 3D Lighting Secret', 'Shorts', '#064e3b', '#022c22', '#34d399', 'film'),
    channel: {
      id: 'blender-foundation',
      name: 'Blender Foundation',
      handle: '@BlenderStudio',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true
    },
    likes: 142000,
    commentsCount: 1540,
    soundTitle: 'Cinematic Chillwave Beats',
    tags: ['animation', 'lighting', 'tutorial']
  },
  {
    id: 'short-3',
    title: 'Cold start exhaust note of an 800HP sequential turbo V8! 🏎️💨',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: generateThumbnailSvg('Cold Start V8 Roar', 'Shorts', '#431407', '#1a0601', '#fb923c', 'car'),
    channel: {
      id: 'supercar-rally',
      name: 'Apex Rally & Track',
      handle: '@ApexRallyTrack',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true
    },
    likes: 230500,
    commentsCount: 2890,
    soundTitle: 'Pure V8 Engine Sound (Stereo HD)',
    tags: ['supercar', 'exhaust', 'cars']
  },
  {
    id: 'short-4',
    title: 'Camping under the Northern Lights in sub-zero wilderness 🌌❄️',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: generateThumbnailSvg('Aurora Wilderness Camp', 'Shorts', '#134e4a', '#042f2e', '#2dd4bf', 'mountain'),
    channel: {
      id: 'nature-unbounded',
      name: 'Earth Unbounded',
      handle: '@EarthUnbounded',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      verified: true
    },
    likes: 318000,
    commentsCount: 3120,
    soundTitle: 'Ethereal Ambient Night Sounds',
    tags: ['aurora', 'norway', 'nature']
  }
];

export const INITIAL_COMMENTS: Record<string, { author: { name: string; avatarUrl: string; isOwner?: boolean }; text: string; timestamp: string; likes: number; id: string }[]> = {
  'video-1': [
    {
      id: 'c1',
      author: {
        name: 'Sarah Chen (Lead Animator)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isOwner: true
      },
      text: 'Thank you everyone for supporting open source cinema! All character rigs, texture packs, and Blender 4.x scene files are available free on our repository.',
      timestamp: '2 days ago',
      likes: 4230
    },
    {
      id: 'c2',
      author: {
        name: 'Marcus Brody',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      text: 'The 4K 60FPS remaster looks so crisp! The fur physics on Big Buck Bunny hold up even today against modern studio productions.',
      timestamp: '1 day ago',
      likes: 890
    },
    {
      id: 'c3',
      author: {
        name: 'Elena Rostova',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      text: 'That squirrel trap scene at 5:10 had me laughing out loud. Pure timeless slapstick comedy gold!',
      timestamp: '18 hours ago',
      likes: 342
    }
  ],
  'video-2': [
    {
      id: 'c4',
      author: {
        name: 'Alex Rivera VFX',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      text: 'Ian Hubert revolutionized tracking and projection mapping with this film. To this day, a masterclass in independent VFX.',
      timestamp: '5 days ago',
      likes: 1205
    }
  ]
};

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    title: 'Top Favorite Picks',
    description: 'Curated selection of best animations, sci-fi VFX, and hardware masterclasses.',
    videoIds: ['video-1', 'video-2', 'video-5'],
    updatedAt: 'Yesterday',
    isPrivate: false
  },
  {
    id: 'pl-tech',
    title: 'Deep Tech & Engineering',
    description: 'TypeScript architecture, extreme thermal benchmarks, and gaming builds.',
    videoIds: ['video-3', 'video-5', 'video-8'],
    updatedAt: '3 days ago',
    isPrivate: false
  },
  {
    id: 'pl-chill',
    title: 'Wilderness & Adventure Escapes',
    description: 'Mountain expeditions, overland camping, and scenic open road drives.',
    videoIds: ['video-4', 'video-10', 'video-6'],
    updatedAt: '1 week ago',
    isPrivate: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Blender Foundation uploaded a new film',
    message: 'Big Buck Bunny - 4K 60FPS CGI Open Animation Remastered is now live.',
    time: '2 hours ago',
    read: false,
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    videoId: 'video-1'
  },
  {
    id: 'notif-2',
    title: 'Tech Overdrive premiered a video',
    message: 'Next-Gen Ray-Tracing Gaming Rig: 240FPS at 4K Ultrawide',
    time: '5 hours ago',
    read: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    videoId: 'video-5'
  },
  {
    id: 'notif-3',
    title: 'Your comment reached 100 likes',
    message: 'People love your thoughts on "TypeScript Architecture 2026"',
    time: '1 day ago',
    read: true,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    videoId: 'video-3'
  }
];
