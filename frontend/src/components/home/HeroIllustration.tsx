import { motion } from 'framer-motion';
import { Key, Heart, IndianRupee, Home, Star, Shield, Award } from 'lucide-react';

export function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
      {/* Main House SVG */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        viewBox="0 0 400 350"
        className="w-full h-full"
        fill="none"
      >
        {/* Ground Shadow */}
        <ellipse cx="200" cy="320" rx="150" ry="20" fill="hsl(0 0% 7% / 0.08)" />

        {/* House Base */}
        <motion.g
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Main Building */}
          <rect x="80" y="140" width="180" height="160" rx="8" fill="hsl(0 0% 100%)" stroke="hsl(0 0% 7%)" strokeWidth="3" />
          
          {/* Roof - Cherry color */}
          <path d="M60 150 L170 60 L280 150" fill="none" stroke="hsl(346 77% 47%)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 150 L170 60 L280 150 Z" fill="hsl(346 77% 47% / 0.15)" />
          
          {/* Chimney */}
          <rect x="220" y="80" width="25" height="50" rx="4" fill="hsl(346 77% 47%)" />
          
          {/* Door */}
          <rect x="145" y="210" width="50" height="90" rx="4" fill="hsl(0 0% 7%)" />
          <circle cx="185" cy="260" r="5" fill="hsl(42 42% 56%)" />
          
          {/* Windows */}
          <rect x="100" y="170" width="35" height="45" rx="4" fill="hsl(0 0% 7% / 0.2)" stroke="hsl(0 0% 7%)" strokeWidth="2" />
          <rect x="205" y="170" width="35" height="45" rx="4" fill="hsl(0 0% 7% / 0.2)" stroke="hsl(0 0% 7%)" strokeWidth="2" />
          <line x1="117" y1="170" x2="117" y2="215" stroke="hsl(0 0% 7%)" strokeWidth="2" />
          <line x1="100" y1="192" x2="135" y2="192" stroke="hsl(0 0% 7%)" strokeWidth="2" />
          <line x1="222" y1="170" x2="222" y2="215" stroke="hsl(0 0% 7%)" strokeWidth="2" />
          <line x1="205" y1="192" x2="240" y2="192" stroke="hsl(0 0% 7%)" strokeWidth="2" />
        </motion.g>

        {/* Happy Family - Left side */}
        <motion.g
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Person 1 */}
          <circle cx="310" cy="240" r="18" fill="hsl(30 60% 70%)" />
          <rect x="295" y="260" width="30" height="50" rx="10" fill="hsl(0 0% 7%)" />
          <circle cx="310" cy="235" r="3" fill="hsl(0 0% 7%)" />
          <path d="M303 245 Q310 250 317 245" stroke="hsl(0 0% 7%)" strokeWidth="2" fill="none" />
        </motion.g>

        <motion.g
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Person 2 */}
          <circle cx="350" cy="245" r="16" fill="hsl(30 60% 65%)" />
          <rect x="337" y="263" width="26" height="45" rx="10" fill="hsl(346 77% 47%)" />
          <circle cx="350" cy="240" r="2.5" fill="hsl(0 0% 7%)" />
          <path d="M344 248 Q350 252 356 248" stroke="hsl(0 0% 7%)" strokeWidth="1.5" fill="none" />
        </motion.g>

        {/* Owner with Key */}
        <motion.g
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <circle cx="50" cy="250" r="20" fill="hsl(30 60% 72%)" />
          <rect x="33" y="272" width="34" height="55" rx="12" fill="hsl(42 42% 56%)" />
          <circle cx="50" cy="245" r="3" fill="hsl(0 0% 7%)" />
          <path d="M42 257 Q50 262 58 257" stroke="hsl(0 0% 7%)" strokeWidth="2" fill="none" />
        </motion.g>
      </motion.svg>

      {/* Floating Elements with Theme Colors */}
      <motion.div
        className="absolute top-10 left-[15%]"
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/15 backdrop-blur-sm flex items-center justify-center shadow-cherry">
          <Key className="w-7 h-7 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-20 right-[10%]"
        animate={{ y: [10, -10, 10], rotate: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center shadow-gold">
          <Award className="w-6 h-6 text-accent" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-24 left-[5%]"
        animate={{ y: [-8, 8, -8], x: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <div className="w-11 h-11 rounded-2xl bg-secondary/10 backdrop-blur-sm flex items-center justify-center shadow-soft">
          <IndianRupee className="w-5 h-5 text-secondary" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[40%] right-[5%]"
        animate={{ y: [5, -15, 5], rotate: [-3, 3, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" fill="hsl(346 77% 47%)" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 right-[20%]"
        animate={{ y: [-5, 10, -5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/15 backdrop-blur-sm flex items-center justify-center shadow-gold">
          <Shield className="w-6 h-6 text-accent" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[30%] left-[8%]"
        animate={{ y: [8, -8, 8], x: [2, -2, 2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <div className="w-9 h-9 rounded-xl bg-secondary/10 backdrop-blur-sm flex items-center justify-center">
          <Star className="w-4 h-4 text-accent" fill="hsl(42 42% 56%)" />
        </div>
      </motion.div>
    </div>
  );
}
