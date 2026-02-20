import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Phone, MapPin, Calendar, Building2, User,
    ExternalLink, Search, Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getContactHistory } from '@/services/propertyService';
import { ContactHistoryItem } from '@/types/property';

export default function ContactHistory() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [history, setHistory] = useState<ContactHistoryItem[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<ContactHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }
        if (isAuthenticated) {
            loadHistory();
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = history.filter(item =>
                item.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.property.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.owner.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }
    }, [searchQuery, history]);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const data = await getContactHistory();
            setHistory(data);
            setFilteredHistory(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load contact history',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const groupByDate = (items: ContactHistoryItem[]) => {
        const groups: { [key: string]: ContactHistoryItem[] } = {};

        items.forEach(item => {
            const date = new Date(item.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(item);
        });

        return groups;
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Skeleton className="h-12 w-64 mb-8" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const groupedHistory = groupByDate(filteredHistory);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-8 h-px bg-primary" />
                            <span className="text-primary text-sm font-medium uppercase tracking-wider">History</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold">Contact History</h1>
                        <p className="text-muted-foreground">Properties whose owners you've contacted</p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by property, location, or owner..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </motion.div>

                    {/* Stats */}
                    {!isLoading && history.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-3 gap-4 mb-8"
                        >
                            <div className="bg-card rounded-xl p-4 border border-border text-center">
                                <p className="text-2xl font-bold text-primary">{history.length}</p>
                                <p className="text-sm text-muted-foreground">Total Contacts</p>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border text-center">
                                <p className="text-2xl font-bold">{new Set(history.map(h => h.property.city)).size}</p>
                                <p className="text-sm text-muted-foreground">Cities</p>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border text-center">
                                <p className="text-2xl font-bold">₹0</p>
                                <p className="text-sm text-muted-foreground">Brokerage Paid</p>
                            </div>
                        </motion.div>
                    )}

                    {/* History List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
                    ) : history.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                <Phone className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="font-heading text-2xl font-bold mb-2">No Contact History</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                You haven't contacted any property owners yet. Browse properties and reveal owner contacts to get started!
                            </p>
                            <Button className="btn-cherry" onClick={() => navigate('/listings')}>
                                Browse Properties
                            </Button>
                        </motion.div>
                    ) : filteredHistory.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedHistory).map(([date, items]) => (
                                <motion.div
                                    key={date}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {date}
                                    </h3>
                                    <div className="space-y-3">
                                        {items.map((item, index) => {
                                            const { time } = formatDate(item.timestamp);
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => navigate(`/property/${item.property.id}`)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Building2 className="w-6 h-6 text-primary" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <h4 className="font-semibold line-clamp-1">{item.property.title}</h4>
                                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {item.property.locality}, {item.property.city}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="flex-shrink-0">
                                                                    {time}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="text-sm font-medium">{item.owner.name || 'Owner'}</span>
                                                                </div>
                                                                {item.owner.phone && (
                                                                    <a
                                                                        href={`tel:${item.owner.phone}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                                                    >
                                                                        <Phone className="w-4 h-4" />
                                                                        <span className="text-sm">{item.owner.phone}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
