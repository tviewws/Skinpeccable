/*
 * SKINPECCABLE GLOWTIQUE — App Router
 * Routes: / | /shop | /shop/:id | /about | /contact | /checkout | /checkout/success
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const prevLocation = useRef(location);

  useEffect(() => {
    const prev = prevLocation.current;
    const curr = location;

    // Only scroll to top when navigating forward to a new page
    // Don't scroll when going back from product detail to shop
    const goingBackToShop = curr === '/shop' && prev.startsWith('/shop/');

    if (!goingBackToShop) {
      window.scrollTo(0, 0);
    }

    prevLocation.current = curr;
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/shop" component={() => <Layout><Shop /></Layout>} />
      <Route path="/shop/:id" component={() => <Layout><ProductDetail /></Layout>} />
      <Route path="/about" component={() => <Layout><About /></Layout>} />
      <Route path="/contact" component={() => <Layout><Contact /></Layout>} />
      <Route path="/checkout/success" component={() => <Layout><CheckoutSuccess /></Layout>} />
      <Route path="/checkout" component={() => <Layout><Checkout /></Layout>} />
      <Route path="/404" component={() => <Layout><NotFound /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}