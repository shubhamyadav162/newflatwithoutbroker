import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { topCities, allLocalities } from '@/data/mockProperties';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'rent', label: 'Rent' },
  { id: 'buy', label: 'Buy' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'pg', label: 'PG/Hostel' },
];

const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];

interface OmniSearchProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function OmniSearch({ isModal = false, onClose }: OmniSearchProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rent');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('type', activeTab);
    if (city) params.set('city', city);
    if (locality) params.set('locality', locality);
    if (bhk) params.set('bhk', bhk.replace(' BHK', '').replace('+', ''));
    
    navigate(`/listings?${params.toString()}`);
    onClose?.();
  };

  const localities = city ? allLocalities[city] || [] : [];

  const SearchContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        'bg-card rounded-2xl shadow-elevated p-2 border border-border/50',
        isModal ? 'w-full' : 'max-w-4xl mx-auto'
      )}
    >
      {/* Tabs */}
      <div className="flex p-1 mb-4 bg-muted rounded-xl">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-cherry'
                : 'text-muted-foreground hover:text-foreground'
            )}
            whileHover={{ scale: activeTab === tab.id ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-2">
        {/* City/Locality */}
        <div className="md:col-span-1 relative">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
            <Select value={city} onValueChange={(val) => { setCity(val); setLocality(''); }}>
              <SelectTrigger className="pl-12 h-14 rounded-xl border-border bg-background text-base focus:ring-primary">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {topCities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Locality */}
        <div className="md:col-span-1">
          <Select value={locality} onValueChange={setLocality} disabled={!city}>
            <SelectTrigger className="h-14 rounded-xl border-border bg-background text-base focus:ring-primary">
              <SelectValue placeholder={city ? 'Select Locality' : 'Select city first'} />
            </SelectTrigger>
            <SelectContent>
              {localities.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* BHK */}
        <div className="md:col-span-1">
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
            <Select value={bhk} onValueChange={setBhk}>
              <SelectTrigger className="pl-12 h-14 rounded-xl border-border bg-background text-base focus:ring-primary">
                <SelectValue placeholder="BHK Type" />
              </SelectTrigger>
              <SelectContent>
                {bhkOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-1"
        >
          <Button
            onClick={handleSearch}
            className="w-full h-14 btn-cherry text-lg gap-2 rounded-xl"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <div className="flex justify-end mb-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-card shadow-soft"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          {SearchContent}
        </motion.div>
      </motion.div>
    );
  }

  return SearchContent;
}
