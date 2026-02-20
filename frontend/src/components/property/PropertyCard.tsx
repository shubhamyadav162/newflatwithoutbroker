import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Maximize, ChevronLeft, ChevronRight, BadgeCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Property } from '@/data/mockProperties';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number, type: string) => {
    if (type === 'buy') {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}/mo`;
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Link to={`/property/${property.id}`}>
        <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border/50">
          {/* Image Carousel */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              src={property.images[currentImage]}
              alt={property.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4 }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {property.isVerified && (
                <span className="badge-verified flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-card/95 backdrop-blur-sm text-foreground font-heading font-bold text-lg px-4 py-2 rounded-xl shadow-soft border border-accent/30">
                {formatPrice(property.price, property.type)}
              </span>
            </div>

            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </>
            )}

            {/* Image Dots */}
            {property.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {property.images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      i === currentImage ? 'bg-accent w-4' : 'bg-card/50'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>

            {/* Features */}
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-accent" />
                <span>{property.bhk}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-accent" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-accent" />
                <span>{property.area} sqft</span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full btn-cherry gap-2" size="lg">
                <Phone className="w-4 h-4" />
                <span>Get Owner Details (Free)</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
