// Valid lucide-react icon mapping
// This file maps the icons used in the codebase to their actual lucide-react names

export const ICON_MAPPING = {
  // Admin Dashboard - Invalid imports
  'Activity': 'Activity',        // Valid
  'Users': 'Users',              // Valid
  'Zap': 'Zap',                  // Valid
  'TrendingUp': 'TrendingUp',    // Valid
  'TrendingDown': 'TrendingDown', // Valid
  'Eye': 'Eye',                  // Valid
  'EyeOff': 'EyeOff',            // Valid
  'Play': 'Play',                // Valid
  'Pause': 'Pause',              // Valid
  'SkipForward': 'SkipForward',  // Valid
  'Volume2': 'Volume2',          // Valid
  'VolumeX': 'VolumeX',          // Valid
  'Maximize2': 'Maximize2',      // Valid
  'Settings': 'Settings',        // Valid
  'Download': 'Download',        // Valid
  'RefreshCw': 'RefreshCw',      // Valid
  'Filter': 'Filter',            // Valid
  'Search': 'Search',            // Valid
  'Bell': 'Bell',                // Valid
  'MapPin': 'MapPin',            // Valid
  'Calendar': 'Calendar',        // Valid
  'BarChart3': 'BarChart3',      // Valid
  'PieChart': 'PieChart',        // Valid
  'LineChart': 'LineChart',      // Valid
  'Database': 'Database',        // Valid
  
  // Communication - Invalid imports
  'Video': 'Video',              // Valid
  'VideoOff': 'VideoOff',        // Valid
  'Mic': 'Mic',                  // Valid
  'MicOff': 'MicOff',            // Valid
  'PhoneOff': 'PhoneOff',        // Valid
  'Monitor': 'Monitor',          // Valid
  'MonitorOff': 'MonitorSpeaker', // Changed
  'Camera': 'Camera',            // Valid
  'CameraOff': 'CameraOff',      // Valid
  
  // Crisis components
  'AlertCircle': 'AlertTriangle', // Changed - AlertCircle doesn't exist
  'CheckCircle': 'CheckCircle2',  // Changed
  'Smile': 'Smile',               // Valid
  'Frown': 'Frown',               // Valid  
  'Meh': 'Meh',                   // Valid
  'CloudRain': 'CloudRain',       // Valid
  'Sun': 'Sun',                   // Valid
  'Moon': 'Moon',                 // Valid
  'Star': 'Star',                 // Valid
  'Brain': 'Brain',               // Valid
  'Wind': 'Wind',                 // Valid
  'Coffee': 'Coffee',             // Valid
  'Music': 'Music',               // Valid
  'BookOpen': 'BookOpen',         // Valid
  'Headphones': 'Headphones',     // Valid
  'Home': 'Home',                 // Valid
  'User': 'User',                 // Valid
  'ExternalLink': 'ExternalLink', // Valid
  'Paperclip': 'Paperclip',       // Valid
  'Bot': 'Bot',                   // Valid
  'CheckCheck': 'CheckCheck',     // Valid
  'Check': 'Check',               // Valid
  'Target': 'Target',             // Valid
  'Award': 'Award',               // Valid
  'Gift': 'Gift',                 // Valid
  'Sparkles': 'Sparkles',         // Valid
  'LifeBuoy': 'LifeBuoy',         // Valid
  'ArrowRight': 'ArrowRight',     // Valid
  'ChevronDown': 'ChevronDown',   // Valid
  'ChevronUp': 'ChevronUp',       // Valid
  'ChevronRight': 'ChevronRight', // Valid
  'ChevronLeft': 'ChevronLeft',   // Valid
  'Plus': 'Plus',                 // Valid
  'X': 'X',                       // Valid
  'Menu': 'Menu',                 // Valid
  'Grid': 'Grid3X3',              // Changed
  'Smartphone': 'Smartphone',     // Valid
  'Tablet': 'Tablet',             // Valid
  'ArrowUp': 'ArrowUp',           // Valid
  'ArrowDown': 'ArrowDown',       // Valid
  'Minus': 'Minus',               // Valid
  'Info': 'Info',                 // Valid
  'Vibrate': 'Vibrate',           // Valid
  'UserPlus': 'UserPlus',         // Valid
  'WifiOff': 'WifiOff',           // Valid
  'Globe': 'Globe',               // Valid
  'Infinity': 'Infinity',         // Valid
  'Edit': 'Edit',                 // Valid
  'Save': 'Save',                 // Valid
  'Share2': 'Share2',             // Valid
  'Briefcase': 'Briefcase',       // Valid
  'Book': 'Book',                 // Valid
  'Timer': 'Timer',               // Valid
  'Circle': 'Circle',             // Valid
  'Square': 'Square',             // Valid
  'Triangle': 'Triangle',         // Valid
  'Waves': 'Waves',               // Valid
  'RotateCcw': 'RotateCcw',       // Valid
  'Hand': 'Hand',                 // Valid
  'Ear': 'Ear',                   // Valid
  'Cpu': 'Cpu',                   // Valid
  'HardDrive': 'HardDrive',       // Valid
  'Wifi': 'Wifi',                 // Valid
  'Battery': 'Battery',           // Valid
  'Gauge': 'Gauge',               // Valid
  'XCircle': 'XCircle',           // Valid
  'Upload': 'Upload',             // Valid
  'Server': 'Server',             // Valid
  'Siren': 'Siren',               // Valid
  'Heart': 'Heart',               // Valid
  'MessageSquare': 'MessageSquare', // Valid
  'Unlock': 'Unlock'              // Valid
};

// Icons that don't exist and need manual replacement
export const MISSING_ICONS = {
  'useAnimation': 'motion.useAnimation', // From framer-motion, not lucide-react
  'useSpring': 'motion.useSpring',       // From framer-motion, not lucide-react
};