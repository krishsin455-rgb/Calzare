
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

// Layout components
import Header from "./components/Header";
import FloatingCart from "./components/FloatingCart";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import {
  Story,
  Contact,
  OrderSuccess,
} from "./pages/Static";

// Main website layout
function MainLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingCart />
    </>
  );
}

// 404 page
function NotFound() {
  return (
    <section className="page-shell empty-state">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">
        Back to Home
      </a>
    </section>
  );
}

// Application routes
export default function App() {
  return (
    <Routes>

      {/* Main website */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<Product />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />

        <Route path="/story" element={<Story />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer protected pages */}
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Account />} />
          <Route
            path="/order-success/:id"
            element={<OrderSuccess />}
          />
        </Route>

        {/* Admin protected page */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
  );
}
