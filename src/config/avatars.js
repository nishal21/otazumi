// Anime-themed profile avatars with character-accurate representations
// Using DiceBear API v9 - Using 'adventurer' style with gender parameters for all characters

// Anime Categories for better organization
export const animeCategories = {
  SHONEN: 'Shonen', // Action/Adventure targeting young males
  SEINEN: 'Seinen', // Mature themes
  SHOUJO: 'Shoujo', // Romance/Drama targeting young females
  PSYCHOLOGICAL: 'Psychological', // Psychological thrillers
  FANTASY: 'Fantasy', // Fantasy/Supernatural
  SCI_FI: 'Sci-Fi', // Science Fiction
  SLICE_OF_LIFE: 'Slice of Life', // Daily life stories
  SPORTS: 'Sports', // Sports anime
  MECHA: 'Mecha' // Robots/Mechs
};

// Anime series list with metadata for easy selection
export const animeSeries = [
  { name: 'Naruto', category: animeCategories.SHONEN, emoji: '🍥', characterCount: 6 },
  { name: 'One Piece', category: animeCategories.SHONEN, emoji: '🏴‍☠️', characterCount: 5 },
  { name: 'Dragon Ball', category: animeCategories.SHONEN, emoji: '🐉', characterCount: 4 },
  { name: 'My Hero Academia', category: animeCategories.SHONEN, emoji: '💚', characterCount: 5 },
  { name: 'Jujutsu Kaisen', category: animeCategories.SHONEN, emoji: '👁️', characterCount: 5 },
  { name: 'Demon Slayer', category: animeCategories.SHONEN, emoji: '⚔️', characterCount: 5 },
  { name: 'Bleach', category: animeCategories.SHONEN, emoji: '🗡️', characterCount: 3 },
  { name: 'Fullmetal Alchemist', category: animeCategories.SHONEN, emoji: '⚗️', characterCount: 3 },
  { name: 'Hunter x Hunter', category: animeCategories.SHONEN, emoji: '🎣', characterCount: 3 },
  { name: 'Attack on Titan', category: animeCategories.SEINEN, emoji: '🗡️', characterCount: 5 },
  { name: 'One Punch Man', category: animeCategories.SEINEN, emoji: '👊', characterCount: 3 },
  { name: 'Tokyo Ghoul', category: animeCategories.SEINEN, emoji: '👁️', characterCount: 2 },
  { name: 'Chainsaw Man', category: animeCategories.SEINEN, emoji: '🪚', characterCount: 3 },
  { name: 'Mob Psycho 100', category: animeCategories.SEINEN, emoji: '💯', characterCount: 2 },
  { name: 'Death Note', category: animeCategories.PSYCHOLOGICAL, emoji: '📓', characterCount: 3 },
  { name: 'Sword Art Online', category: animeCategories.FANTASY, emoji: '⚔️', characterCount: 3 },
  { name: 'Re:Zero', category: animeCategories.FANTASY, emoji: '🔄', characterCount: 3 },
  { name: 'Steins;Gate', category: animeCategories.SCI_FI, emoji: '⏰', characterCount: 2 },
  { name: 'Spy x Family', category: animeCategories.SLICE_OF_LIFE, emoji: '🕵️', characterCount: 3 },
  { name: 'Darling in the Franxx', category: animeCategories.MECHA, emoji: '💗', characterCount: 2 },
  { name: 'Code Geass', category: animeCategories.MECHA, emoji: '👑', characterCount: 2 },
  { name: 'Haikyuu!!', category: animeCategories.SPORTS, emoji: '🏐', characterCount: 2 },
  { name: 'Violet Evergarden', category: animeCategories.SHOUJO, emoji: '✉️', characterCount: 1 }
];

export const animeAvatars = [
  // Naruto Series - Shonen
  {
    id: 1,
    name: 'Naruto Uzumaki',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=NarutoOrangeNinjaFoxWhiskers',
    bgColor: '#ff9a3c',
    characterEmoji: '🍥'
  },
  {
    id: 2,
    name: 'Sasuke Uchiha',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'indigo',
    gradient: 'from-indigo-600 to-blue-800',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SasukeDarkUchihaLightning',
    bgColor: '#4338ca',
    characterEmoji: '⚡'
  },
  {
    id: 3,
    name: 'Sakura Haruno',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-400 to-rose-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SakuraPinkMedicalKunoichi',
    bgColor: '#f472b6',
    characterEmoji: '🌸'
  },
  {
    id: 4,
    name: 'Kakashi Hatake',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'gray',
    gradient: 'from-gray-400 to-slate-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KakashiSilverCopyNinja',
    bgColor: '#94a3b8',
    characterEmoji: '📖'
  },
  {
    id: 5,
    name: 'Hinata Hyuga',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-400 to-indigo-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=HinataByakuganGentleHyuga',
    bgColor: '#c084fc',
    characterEmoji: '👁️'
  },
  {
    id: 6,
    name: 'Itachi Uchiha',
    anime: 'Naruto',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'red',
    gradient: 'from-red-700 to-gray-900',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ItachiCrimsonSharinganCrow',
    bgColor: '#b91c1c',
    characterEmoji: '🦅'
  },
  
  // One Piece - Shonen
  {
    id: 7,
    name: 'Monkey D. Luffy',
    anime: 'One Piece',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'red',
    gradient: 'from-red-500 to-rose-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LuffyStrawHatRubberPirate',
    bgColor: '#dc2626',
    characterEmoji: '🏴‍☠️'
  },
  {
    id: 8,
    name: 'Roronoa Zoro',
    anime: 'One Piece',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'green',
    gradient: 'from-green-600 to-emerald-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ZoroGreenThreeSwordDemon',
    bgColor: '#16a34a',
    characterEmoji: '⚔️'
  },
  {
    id: 9,
    name: 'Nami',
    anime: 'One Piece',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'orange',
    gradient: 'from-orange-400 to-amber-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=NamiOrangeCatNavigator',
    bgColor: '#fb923c',
    characterEmoji: '🍊'
  },
  {
    id: 10,
    name: 'Sanji',
    anime: 'One Piece',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-600 to-orange-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SanjiBlackLegCookChef',
    bgColor: '#ca8a04',
    characterEmoji: '🚬'
  },
  {
    id: 11,
    name: 'Nico Robin',
    anime: 'One Piece',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-600 to-indigo-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RobinPurpleArchaeologist',
    bgColor: '#9333ea',
    characterEmoji: '📚'
  },
  
  // Dragon Ball - Shonen
  {
    id: 12,
    name: 'Goku',
    anime: 'Dragon Ball',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-400 to-amber-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=GokuOrangeSaiyanKamehameha',
    bgColor: '#fb923c',
    characterEmoji: '🐉'
  },
  {
    id: 13,
    name: 'Vegeta',
    anime: 'Dragon Ball',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'blue',
    gradient: 'from-blue-600 to-indigo-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=VegetaBlueSaiyanPrince',
    bgColor: '#2563eb',
    characterEmoji: '⚡'
  },
  {
    id: 14,
    name: 'Gohan',
    anime: 'Dragon Ball',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=GohanPurpleScholarFighter',
    bgColor: '#a855f7',
    characterEmoji: '📚'
  },
  {
    id: 15,
    name: 'Bulma',
    anime: 'Dragon Ball',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'blue',
    gradient: 'from-blue-400 to-cyan-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=BulmaBlueGeniusInventor',
    bgColor: '#60a5fa',
    characterEmoji: '🔬'
  },
  
  // My Hero Academia - Shonen
  {
    id: 16,
    name: 'Izuku Midoriya',
    anime: 'My Hero Academia',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'green',
    gradient: 'from-green-500 to-emerald-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=DekuGreenOneForAll',
    bgColor: '#22c55e',
    characterEmoji: '💚'
  },
  {
    id: 17,
    name: 'Katsuki Bakugo',
    anime: 'My Hero Academia',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-500 to-red-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=BakugoOrangeExplosionHero',
    bgColor: '#f97316',
    characterEmoji: '💥'
  },
  {
    id: 18,
    name: 'Shoto Todoroki',
    anime: 'My Hero Academia',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'cyan',
    gradient: 'from-cyan-400 to-red-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TodorokiIceFireDual',
    bgColor: '#22d3ee',
    characterEmoji: '❄️'
  },
  {
    id: 19,
    name: 'Ochaco Uraraka',
    anime: 'My Hero Academia',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-400 to-rose-400',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=UrarakaGravityPinkHero',
    bgColor: '#f472b6',
    characterEmoji: '🌸'
  },
  {
    id: 20,
    name: 'Momo Yaoyorozu',
    anime: 'My Hero Academia',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'red',
    gradient: 'from-red-500 to-rose-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MomoCreationRedQueen',
    bgColor: '#ef4444',
    characterEmoji: '⚡'
  },
  
  // Jujutsu Kaisen - Shonen
  {
    id: 21,
    name: 'Satoru Gojo',
    anime: 'Jujutsu Kaisen',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'cyan',
    gradient: 'from-cyan-400 to-blue-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=GojoInfinitySixEyes',
    bgColor: '#22d3ee',
    characterEmoji: '👁️'
  },
  {
    id: 22,
    name: 'Yuji Itadori',
    anime: 'Jujutsu Kaisen',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'red',
    gradient: 'from-red-500 to-pink-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ItadoriCursedEnergy',
    bgColor: '#ef4444',
    characterEmoji: '✊'
  },
  {
    id: 23,
    name: 'Megumi Fushiguro',
    anime: 'Jujutsu Kaisen',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'indigo',
    gradient: 'from-indigo-600 to-blue-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=FushiguroShadowShikigami',
    bgColor: '#4f46e5',
    characterEmoji: '🐺'
  },
  {
    id: 24,
    name: 'Nobara Kugisaki',
    anime: 'Jujutsu Kaisen',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KugisakiHammerNails',
    bgColor: '#f97316',
    characterEmoji: '🔨'
  },
  {
    id: 25,
    name: 'Maki Zenin',
    anime: 'Jujutsu Kaisen',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'green',
    gradient: 'from-green-600 to-emerald-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MakiCursedWeapons',
    bgColor: '#16a34a',
    characterEmoji: '🗡️'
  },
  
  // Demon Slayer - Shonen
  {
    id: 26,
    name: 'Tanjiro Kamado',
    anime: 'Demon Slayer',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'teal',
    gradient: 'from-teal-500 to-green-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TanjiroWaterBreathing',
    bgColor: '#14b8a6',
    characterEmoji: '⚔️'
  },
  {
    id: 27,
    name: 'Nezuko Kamado',
    anime: 'Demon Slayer',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=NezukoPinkBamboo',
    bgColor: '#ec4899',
    characterEmoji: '🎋'
  },
  {
    id: 28,
    name: 'Zenitsu Agatsuma',
    anime: 'Demon Slayer',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'yellow',
    gradient: 'from-yellow-400 to-orange-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ZenitsuThunderBreathing',
    bgColor: '#facc15',
    characterEmoji: '⚡'
  },
  {
    id: 29,
    name: 'Inosuke Hashibira',
    anime: 'Demon Slayer',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=InosukeBoarBeastBreathing',
    bgColor: '#3b82f6',
    characterEmoji: '🐗'
  },
  {
    id: 30,
    name: 'Shinobu Kocho',
    anime: 'Demon Slayer',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-400 to-violet-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ShinobuInsectBreathing',
    bgColor: '#c084fc',
    characterEmoji: '🦋'
  },
  
  // Attack on Titan - Seinen
  {
    id: 31,
    name: 'Eren Yeager',
    anime: 'Attack on Titan',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'brown',
    gradient: 'from-amber-700 to-orange-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ErenAttackFoundingTitan',
    bgColor: '#b45309',
    characterEmoji: '🗡️'
  },
  {
    id: 32,
    name: 'Mikasa Ackerman',
    anime: 'Attack on Titan',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'gray',
    gradient: 'from-gray-600 to-slate-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MikasaAckermanScarf',
    bgColor: '#4b5563',
    characterEmoji: '🧣'
  },
  {
    id: 33,
    name: 'Armin Arlert',
    anime: 'Attack on Titan',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-500 to-amber-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ArminColossalStrategist',
    bgColor: '#eab308',
    characterEmoji: '📖'
  },
  {
    id: 34,
    name: 'Levi Ackerman',
    anime: 'Attack on Titan',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'slate',
    gradient: 'from-slate-600 to-gray-800',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LeviHumanityStrongest',
    bgColor: '#475569',
    characterEmoji: '⚔️'
  },
  {
    id: 35,
    name: 'Historia Reiss',
    anime: 'Attack on Titan',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'gold',
    gradient: 'from-yellow-400 to-amber-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=HistoriaQueenWalls',
    bgColor: '#fbbf24',
    characterEmoji: '👑'
  },
  
  // Death Note - Psychological
  {
    id: 36,
    name: 'Light Yagami',
    anime: 'Death Note',
    category: animeCategories.PSYCHOLOGICAL,
    gender: 'male',
    theme: 'brown',
    gradient: 'from-amber-600 to-orange-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LightKiraDeathNote',
    bgColor: '#d97706',
    characterEmoji: '📓'
  },
  {
    id: 37,
    name: 'L Lawliet',
    anime: 'Death Note',
    category: animeCategories.PSYCHOLOGICAL,
    gender: 'male',
    theme: 'black',
    gradient: 'from-gray-800 to-black',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LDetectiveSweets',
    bgColor: '#1f2937',
    characterEmoji: '🍰'
  },
  {
    id: 38,
    name: 'Misa Amane',
    anime: 'Death Note',
    category: animeCategories.PSYCHOLOGICAL,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MisaSecondKiraPink',
    bgColor: '#ec4899',
    characterEmoji: '🖤'
  },
  
  // Bleach - Shonen
  {
    id: 39,
    name: 'Ichigo Kurosaki',
    anime: 'Bleach',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-600 to-red-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=IchigoSoulReaperHollow',
    bgColor: '#ea580c',
    characterEmoji: '🗡️'
  },
  {
    id: 40,
    name: 'Rukia Kuchiki',
    anime: 'Bleach',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RukiaSoulSocietyKuchiki',
    bgColor: '#a855f7',
    characterEmoji: '❄️'
  },
  {
    id: 41,
    name: 'Renji Abarai',
    anime: 'Bleach',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'red',
    gradient: 'from-red-600 to-orange-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RenjiZabimaru',
    bgColor: '#dc2626',
    characterEmoji: '🐍'
  },
  
  // Fullmetal Alchemist - Shonen
  {
    id: 42,
    name: 'Edward Elric',
    anime: 'Fullmetal Alchemist',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-500 to-amber-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=EdwardFullmetalAlchemist',
    bgColor: '#eab308',
    characterEmoji: '⚗️'
  },
  {
    id: 43,
    name: 'Alphonse Elric',
    anime: 'Fullmetal Alchemist',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'gray',
    gradient: 'from-gray-500 to-slate-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=AlphonseArmorSoul',
    bgColor: '#6b7280',
    characterEmoji: '🛡️'
  },
  {
    id: 44,
    name: 'Winry Rockbell',
    anime: 'Fullmetal Alchemist',
    category: animeCategories.SHONEN,
    gender: 'female',
    theme: 'gold',
    gradient: 'from-yellow-400 to-orange-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=WinryAutomail',
    bgColor: '#facc15',
    characterEmoji: '🔧'
  },
  
  // One Punch Man - Seinen
  {
    id: 45,
    name: 'Saitama',
    anime: 'One Punch Man',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'yellow',
    gradient: 'from-yellow-400 to-red-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SaitamaOnePunchBald',
    bgColor: '#facc15',
    characterEmoji: '👊'
  },
  {
    id: 46,
    name: 'Genos',
    anime: 'One Punch Man',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-600 to-orange-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=GenosCyborgDemon',
    bgColor: '#ca8a04',
    characterEmoji: '🤖'
  },
  {
    id: 47,
    name: 'Tatsumaki',
    anime: 'One Punch Man',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'green',
    gradient: 'from-green-400 to-emerald-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=TatsumakiTornadoPsychic',
    bgColor: '#4ade80',
    characterEmoji: '🌪️'
  },
  
  // Sword Art Online - Fantasy
  {
    id: 48,
    name: 'Kirito',
    anime: 'Sword Art Online',
    category: animeCategories.FANTASY,
    gender: 'male',
    theme: 'black',
    gradient: 'from-gray-800 to-black',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KiritoBlackSwordsman',
    bgColor: '#1f2937',
    characterEmoji: '⚔️'
  },
  {
    id: 49,
    name: 'Asuna Yuuki',
    anime: 'Sword Art Online',
    category: animeCategories.FANTASY,
    gender: 'female',
    theme: 'red',
    gradient: 'from-red-400 to-orange-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=AsunaLightningFlash',
    bgColor: '#f87171',
    characterEmoji: '⚡'
  },
  {
    id: 50,
    name: 'Sinon',
    anime: 'Sword Art Online',
    category: animeCategories.FANTASY,
    gender: 'female',
    theme: 'blue',
    gradient: 'from-blue-400 to-cyan-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SinonSniper',
    bgColor: '#60a5fa',
    characterEmoji: '🏹'
  },
  
  // Tokyo Ghoul - Seinen
  {
    id: 51,
    name: 'Ken Kaneki',
    anime: 'Tokyo Ghoul',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'white',
    gradient: 'from-gray-300 to-slate-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KanekiWhiteHairGhoul',
    bgColor: '#d1d5db',
    characterEmoji: '👁️'
  },
  {
    id: 52,
    name: 'Touka Kirishima',
    anime: 'Tokyo Ghoul',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-600 to-indigo-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ToukaRabbitCoffee',
    bgColor: '#9333ea',
    characterEmoji: '☕'
  },
  
  // Darling in the Franxx - Mecha
  {
    id: 53,
    name: 'Zero Two',
    anime: 'Darling in the Franxx',
    category: animeCategories.MECHA,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-500 to-red-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ZeroTwoDarlingHorns',
    bgColor: '#ec4899',
    characterEmoji: '💗'
  },
  {
    id: 54,
    name: 'Hiro',
    anime: 'Darling in the Franxx',
    category: animeCategories.MECHA,
    gender: 'male',
    theme: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=HiroCode016Partner',
    bgColor: '#3b82f6',
    characterEmoji: '🤖'
  },
  
  // Hunter x Hunter - Shonen
  {
    id: 55,
    name: 'Gon Freecss',
    anime: 'Hunter x Hunter',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'green',
    gradient: 'from-green-500 to-emerald-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=GonJajanken',
    bgColor: '#22c55e',
    characterEmoji: '🎣'
  },
  {
    id: 56,
    name: 'Killua Zoldyck',
    anime: 'Hunter x Hunter',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'silver',
    gradient: 'from-slate-400 to-gray-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KilluaGodspeed',
    bgColor: '#94a3b8',
    characterEmoji: '⚡'
  },
  {
    id: 57,
    name: 'Kurapika',
    anime: 'Hunter x Hunter',
    category: animeCategories.SHONEN,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-600 to-amber-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KurapikaScarletEyes',
    bgColor: '#ca8a04',
    characterEmoji: '⛓️'
  },
  
  // Chainsaw Man - Seinen
  {
    id: 58,
    name: 'Denji',
    anime: 'Chainsaw Man',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-600 to-red-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=DenjiChainsawDevil',
    bgColor: '#ea580c',
    characterEmoji: '🪚'
  },
  {
    id: 59,
    name: 'Power',
    anime: 'Chainsaw Man',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-400 to-rose-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=PowerBloodFiend',
    bgColor: '#f472b6',
    characterEmoji: '😈'
  },
  {
    id: 60,
    name: 'Makima',
    anime: 'Chainsaw Man',
    category: animeCategories.SEINEN,
    gender: 'female',
    theme: 'red',
    gradient: 'from-red-500 to-orange-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MakimaControlDevil',
    bgColor: '#ef4444',
    characterEmoji: '👁️'
  },
  
  // Spy x Family - Slice of Life
  {
    id: 61,
    name: 'Loid Forger',
    anime: 'Spy x Family',
    category: animeCategories.SLICE_OF_LIFE,
    gender: 'male',
    theme: 'gold',
    gradient: 'from-yellow-600 to-amber-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LoidTwilightSpymaster',
    bgColor: '#ca8a04',
    characterEmoji: '🕵️'
  },
  {
    id: 62,
    name: 'Yor Forger',
    anime: 'Spy x Family',
    category: animeCategories.SLICE_OF_LIFE,
    gender: 'female',
    theme: 'red',
    gradient: 'from-red-600 to-rose-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=YorThornPrincess',
    bgColor: '#dc2626',
    characterEmoji: '🗡️'
  },
  {
    id: 63,
    name: 'Anya Forger',
    anime: 'Spy x Family',
    category: animeCategories.SLICE_OF_LIFE,
    gender: 'female',
    theme: 'pink',
    gradient: 'from-pink-300 to-rose-400',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=AnyaTelepath',
    bgColor: '#f9a8d4',
    characterEmoji: '🥜'
  },
  
  // Mob Psycho 100 - Seinen
  {
    id: 64,
    name: 'Shigeo Kageyama',
    anime: 'Mob Psycho 100',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'gray',
    gradient: 'from-gray-600 to-slate-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MobPsychic100Percent',
    bgColor: '#4b5563',
    characterEmoji: '💯'
  },
  {
    id: 65,
    name: 'Reigen Arataka',
    anime: 'Mob Psycho 100',
    category: animeCategories.SEINEN,
    gender: 'male',
    theme: 'brown',
    gradient: 'from-amber-600 to-orange-700',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=ReigenGreatestPsychic',
    bgColor: '#d97706',
    characterEmoji: '💼'
  },
  
  // Steins;Gate - Sci-Fi
  {
    id: 66,
    name: 'Rintaro Okabe',
    anime: 'Steins;Gate',
    category: animeCategories.SCI_FI,
    gender: 'male',
    theme: 'white',
    gradient: 'from-gray-200 to-slate-400',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=OkabeMadScientist',
    bgColor: '#e5e7eb',
    characterEmoji: '⏰'
  },
  {
    id: 67,
    name: 'Kurisu Makise',
    anime: 'Steins;Gate',
    category: animeCategories.SCI_FI,
    gender: 'female',
    theme: 'red',
    gradient: 'from-red-500 to-rose-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KurisuGeniusScientist',
    bgColor: '#ef4444',
    characterEmoji: '🔬'
  },
  
  // Code Geass - Mecha
  {
    id: 68,
    name: 'Lelouch Lamperouge',
    anime: 'Code Geass',
    category: animeCategories.MECHA,
    gender: 'male',
    theme: 'purple',
    gradient: 'from-purple-700 to-indigo-900',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=LelouchGeassZero',
    bgColor: '#7e22ce',
    characterEmoji: '👑'
  },
  {
    id: 69,
    name: 'C.C.',
    anime: 'Code Geass',
    category: animeCategories.MECHA,
    gender: 'female',
    theme: 'green',
    gradient: 'from-green-400 to-emerald-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=CCImmortalWitch',
    bgColor: '#4ade80',
    characterEmoji: '🍕'
  },
  
  // Haikyuu!! - Sports
  {
    id: 70,
    name: 'Shoyo Hinata',
    anime: 'Haikyuu!!',
    category: animeCategories.SPORTS,
    gender: 'male',
    theme: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=HinataLittleGiant',
    bgColor: '#f97316',
    characterEmoji: '🏐'
  },
  {
    id: 71,
    name: 'Tobio Kageyama',
    anime: 'Haikyuu!!',
    category: animeCategories.SPORTS,
    gender: 'male',
    theme: 'blue',
    gradient: 'from-blue-700 to-indigo-800',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=KageyamaKingCourt',
    bgColor: '#1d4ed8',
    characterEmoji: '👑'
  },
  
  // Violet Evergarden - Shoujo
  {
    id: 72,
    name: 'Violet Evergarden',
    anime: 'Violet Evergarden',
    category: animeCategories.SHOUJO,
    gender: 'female',
    theme: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=VioletDollWriter',
    bgColor: '#60a5fa',
    characterEmoji: '✉️'
  },
  
  // Re:Zero - Fantasy
  {
    id: 73,
    name: 'Subaru Natsuki',
    anime: 'Re:Zero',
    category: animeCategories.FANTASY,
    gender: 'male',
    theme: 'black',
    gradient: 'from-gray-700 to-gray-900',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SubaruReturnByDeath',
    bgColor: '#374151',
    characterEmoji: '🔄'
  },
  {
    id: 74,
    name: 'Emilia',
    anime: 'Re:Zero',
    category: animeCategories.FANTASY,
    gender: 'female',
    theme: 'purple',
    gradient: 'from-purple-400 to-violet-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=EmiliaHalfElfSpirit',
    bgColor: '#c084fc',
    characterEmoji: '❄️'
  },
  {
    id: 75,
    name: 'Rem',
    anime: 'Re:Zero',
    category: animeCategories.FANTASY,
    gender: 'female',
    theme: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    imageUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=RemBlueDemonMaid',
    bgColor: '#3b82f6',
    characterEmoji: '💙'
  }
];

// Default avatar for new users
export const defaultAvatar = animeAvatars[0];

// Get avatar by ID
export const getAvatarById = (id) => {
  return animeAvatars.find(avatar => avatar.id === id) || defaultAvatar;
};

// Get random avatar
export const getRandomAvatar = () => {
  return animeAvatars[Math.floor(Math.random() * animeAvatars.length)];
};

// Get avatars by anime series
export const getAvatarsByAnime = (animeName) => {
  return animeAvatars.filter(avatar => avatar.anime === animeName);
};

// Get avatars by gender
export const getAvatarsByGender = (gender) => {
  return animeAvatars.filter(avatar => avatar.gender === gender);
};

// Get avatars by category
export const getAvatarsByCategory = (category) => {
  return animeAvatars.filter(avatar => avatar.category === category);
};

// Get all unique anime series
export const getAllAnimeSeries = () => {
  return [...new Set(animeAvatars.map(avatar => avatar.anime))].sort();
};

// Get all categories
export const getAllCategories = () => {
  return Object.values(animeCategories);
};

// Get anime series grouped by category
export const getAnimeByCategory = () => {
  const grouped = {};
  animeAvatars.forEach(avatar => {
    if (!grouped[avatar.category]) {
      grouped[avatar.category] = new Set();
    }
    grouped[avatar.category].add(avatar.anime);
  });
  
  // Convert sets to sorted arrays
  Object.keys(grouped).forEach(key => {
    grouped[key] = [...grouped[key]].sort();
  });
  
  return grouped;
};

// Get gender statistics
export const getGenderStats = () => {
  const stats = { male: 0, female: 0 };
  animeAvatars.forEach(avatar => {
    stats[avatar.gender]++;
  });
  return stats;
};

// Get anime series info with character counts
export const getAnimeSeriesInfo = () => {
  return animeSeries;
};
