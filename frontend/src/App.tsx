import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import CityPage from "./pages/CityPage";
import ServicePage from "./pages/ServicePage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import PropertyDetail from "./pages/PropertyDetail";
import PostProperty from "./pages/PostProperty";
import MyProperties from "./pages/MyProperties";
import Profile from "./pages/Profile";
import EditProperty from "./pages/EditProperty";
import ContactHistory from "./pages/ContactHistory";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminContacts from "@/pages/admin/AdminContacts";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/about" element={<About />} />
            <Route path="/properties/:city" element={<CityPage />} />
            <Route path="/services/:serviceName" element={<ServicePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* Property Routes */}
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            {/* User Dashboard Routes */}
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact-history" element={<ContactHistory />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
