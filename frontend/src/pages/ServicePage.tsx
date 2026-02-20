import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck } from "lucide-react";

const ServicePage = () => {
    const { serviceName } = useParams();

    // Map URL params to readable titles
    const getServiceData = (slug: string = "") => {
        switch (slug.toLowerCase()) {
            case 'rent-agreement':
                return {
                    title: "Rent Agreement",
                    icon: <ShieldCheck className="w-12 h-12 text-primary" />,
                    description: "Get legally valid rent agreements delivered to your doorstep. Hassle-free and affordable."
                };
            case 'movers-packers':
                return {
                    title: "Movers & Packers",
                    icon: <Truck className="w-12 h-12 text-primary" />,
                    description: "Verified professionals to help you shift safely. Best quotes guaranteed."
                };
            default:
                return {
                    title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
                    description: "Premium real estate services designed to make your life easier."
                };
        }
    };

    const service = getServiceData(serviceName);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <div className="pt-32 pb-20 bg-white border-b border-neutral-200">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
                        {service.icon}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight">
                        {service.title} Services
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        {service.description}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" className="h-12 px-8">
                            Get a Quote
                        </Button>
                        <Link to="/">
                            <Button variant="outline" size="lg" className="h-12 px-8">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ServicePage;
