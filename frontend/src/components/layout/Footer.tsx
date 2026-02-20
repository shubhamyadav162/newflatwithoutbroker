import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                FlatWithoutBrokerage
              </span>
            </Link>
            <p className="text-neutral-500 leading-relaxed">
              India's only 100% Free Real Estate Directory. Connect directly with property owners, zero middlemen, maximum savings.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-primary hover:text-white transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Top Cities */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-6 text-lg">Top Cities</h3>
            <ul className="space-y-4">
              {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Noida', 'Gurgaon'].map((city) => (
                <li key={city}>
                  <Link
                    to={`/properties/${city.toLowerCase()}`}
                    className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                    Properties in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services/rent-agreement" className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                  Rent Agreement
                </Link>
              </li>
              <li>
                <Link to="/services/movers-packers" className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                  Movers & Packers
                </Link>
              </li>
              <li>
                <Link to="/services/home-loans" className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                  Home Loans
                </Link>
              </li>
              <li>
                <Link to="/services/legal-services" className="text-neutral-500 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary transition-colors"></span>
                  Legal Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-6 text-lg">Contact Us</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Tech Park, Bandra Kurla Complex (BKC),<br />
                  Bandra East, Mumbai,<br />
                  Maharashtra 400051
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:hello@flatwithoutbrokerage.com" className="text-neutral-500 hover:text-primary transition-colors text-sm">
                  hello@flatwithoutbrokerage.com
                </a>
              </div>
              <div className="flex gap-4 items-center">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+919876543210" className="text-neutral-500 hover:text-primary transition-colors text-sm">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-400 text-sm">
            © {new Date().getFullYear()} FlatWithoutBrokerage. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-400">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
