import { motion } from 'framer-motion';
import { Ghost, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-6"
      >
        <div className="relative">
          {/* Ghost House SVG */}
          <svg width="200" height="180" viewBox="0 0 200 180" fill="none">
            {/* House Outline */}
            <motion.path
              d="M40 90 L100 40 L160 90 L160 160 L40 160 Z"
              stroke="hsl(var(--muted-foreground) / 0.3)"
              strokeWidth="3"
              strokeDasharray="8 4"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
            
            {/* Door */}
            <rect x="80" y="110" width="40" height="50" rx="4" fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" strokeDasharray="4 2" />
            
            {/* Windows */}
            <rect x="50" y="100" width="25" height="25" rx="4" fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
            <rect x="125" y="100" width="25" height="25" rx="4" fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
          </svg>

          {/* Floating Ghost */}
          <motion.div
            className="absolute top-8 left-1/2 -translate-x-1/2"
            animate={{ 
              y: [0, -15, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Ghost className="w-16 h-16 text-muted-foreground/50" />
          </motion.div>
        </div>
      </motion.div>

      <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
        Spooky! Nothing here yet
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn't find any properties matching your search. Try adjusting your filters or explore other areas.
      </p>

      <Link to="/listings">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="btn-solar gap-2">
            <Home className="w-4 h-4" />
            Explore All Properties
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}
