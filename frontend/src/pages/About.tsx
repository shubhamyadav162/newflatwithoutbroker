import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, User } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Hero Section */}
            <div className="pt-28 pb-16 bg-white border-b border-neutral-200">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                        Our Story
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight">
                        Disrupting India's Rental Market
                    </h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                        We believe finding a home should be free, simple, and direct. No middlemen, no brokerage, zero hassle.
                    </p>
                </div>
            </div>

            {/* Founder Story */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] bg-neutral-200 rounded-2xl overflow-hidden relative shadow-xl">
                                <img
                                    src="/shubham.png"
                                    alt="Shubham Yadav"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg border border-neutral-100 max-w-xs hidden md:block">
                                <Quote className="w-8 h-8 text-primary mb-2 opacity-50" />
                                <p className="text-sm font-medium text-neutral-800 italic">
                                    "The goal is simple: Everyone deserves a home without paying a fortune to find it."
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">The Founder</h2>
                                <h3 className="text-3xl font-bold text-neutral-900 mb-4">Shubham Yadav</h3>
                                <p className="text-neutral-500 font-medium">B.Tech (2018) • Serial Entrepreneur • Visionary</p>
                            </div>

                            <div className="space-y-6 text-neutral-600 leading-relaxed">
                                <p>
                                    Shubham Yadav isn't just another tech entrepreneur; he is a force of change in the Indian real estate sector. Since graduating with his B.Tech in 2018, Shubham has been driven by a singular obsession: **Efficiency.**
                                </p>
                                <p>
                                    Having witnessed the chaotic and often exploitative nature of the rental market—where middlemen demand exorbitant fees for minimal value—he decided to take a stand. He realized that technology could bridge the gap between owners and tenants directly, eliminating the need for brokerage entirely.
                                </p>
                                <p>
                                    With **Flat Without Brokerage**, Shubham is executing his vision to "disturb" the status quo. This isn't just a platform; it's a movement to democratize housing access for students, families, and professionals across India. His relentless pursuit of a 100% free model serves as a testament to his belief that basic needs like housing should not be gatekept by commissions.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    Join Our Mission <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Stat */}
            <section className="py-20 bg-primary/5 border-y border-primary/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-12">Building for the Future</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
                            <div className="text-4xl font-bold text-primary mb-2">100%</div>
                            <div className="text-neutral-600 font-medium">Brokerage Free</div>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
                            <div className="text-4xl font-bold text-primary mb-2">Direct</div>
                            <div className="text-neutral-600 font-medium">Owner Connections</div>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
                            <div className="text-4xl font-bold text-primary mb-2">Zero</div>
                            <div className="text-neutral-600 font-medium">Hidden Fees</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
