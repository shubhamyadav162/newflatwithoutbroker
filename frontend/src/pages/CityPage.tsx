import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, ArrowRight } from "lucide-react";
import { CITY_DESCRIPTIONS } from "@/config/cityContent";

const CityPage = () => {
    const { city } = useParams();
    // Ensure consistent capitalization for lookup (e.g. "mumbai" -> "Mumbai")
    const formattedCity = city ? city.charAt(0).toUpperCase() + city.slice(1).toLowerCase() : "City";

    const cityContent = CITY_DESCRIPTIONS[formattedCity as keyof typeof CITY_DESCRIPTIONS];

    const title = cityContent ? cityContent.title : `Properties in ${formattedCity}`;
    const description = cityContent ? cityContent.description : `Explore 100% brokerage-free flats, houses, and rooms in ${formattedCity}. Connect directly with owners and save money.`;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Hero */}
            <div className="pt-32 pb-20 bg-neutral-900 text-white relative overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span>{cityContent ? 'City Guide' : `Prime Locations in ${formattedCity}`}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        {description}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to={`/listings?city=${formattedCity}`}>
                            <Button size="lg" className="h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-white border-0">
                                View Listings in {formattedCity}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content Placeholder */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                        <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            {cityContent ? `Find Homes in ${formattedCity}` : 'Browse Top Localities'}
                        </h2>
                        <p className="text-neutral-500 max-w-md mx-auto mb-6">
                            {cityContent ? cityContent.meta : `We are actively verifying properties in ${formattedCity}. Browse our complete database to find your perfect home.`}
                        </p>
                        <Link to={`/listings?city=${formattedCity}`}>
                            <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                                Search All Properties <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CityPage;
