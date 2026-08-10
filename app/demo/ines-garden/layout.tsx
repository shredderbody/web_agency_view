import "@/app/shop.css";
import { CartProvider } from "@/components/shop/cart";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFooter from "@/components/shop/ShopFooter";
import CartDrawer from "@/components/shop/CartDrawer";
import ShopDemoRibbon from "@/components/shop/ShopDemoRibbon";
import ShopDemoCta from "@/components/shop/ShopDemoCta";
import VapiWidget from "@/components/VapiWidget";

/**
 * Coquille de la démo Ines Garden : la boutique complète du site client
 * (website_expo/ines_garden) montée sous /demo/ines-garden, augmentée du
 * chrome démo (ruban + bandeau « je veux la mienne »).
 */
export default function InesGardenDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="shop">
        <ShopDemoRibbon />
        <ShopHeader />
        <main>{children}</main>
        <ShopDemoCta />
        <ShopFooter />
        <CartDrawer />
        {/* Bulle Vapi — réception boutique dédiée, présente sur toutes les pages */}
        <VapiWidget slug="ines-garden" />
      </div>
    </CartProvider>
  );
}
