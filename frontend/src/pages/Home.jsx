
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

const getProductImage = (src) => {
  if (!src) return "";

  if (src.startsWith("/uploads")) {
    const apiBase =
      import.meta.env.VITE_API_URL || "http://localhost:5003/api";

    return `${apiBase.replace(/\/api$/, "")}${src}`;
  }

  return src;
};

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api("/products?limit=8")
      .then((data) => setProducts(data.products || []))
      .catch(console.error);
  }, []);

  const heroImage = products[0]?.images?.[0]
    ? getProductImage(products[0].images[0])
    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=90";

  return (
    <main className="cal-home">

      {/* 1. PREMIUM HERO SECTION */}
      <section className="cal-main-hero">
        <div className="cal-hero-content">
          <span className="cal-hero-tag">
            ⭐ PREMIUM FOOTWEAR
          </span>

          <h1>
            Walk Your
            <br />
            Own <span>Way.</span>
          </h1>

          <p>
            Premium footwear for every step
            of your journey.
          </p>

          <Link to="/shop" className="cal-hero-button">
            Shop the Collection →
          </Link>
        </div>

        <div className="cal-hero-visual">
          <img
            src={heroImage}
            alt="Calzare premium footwear"
          />
        </div>

        <div className="cal-hero-benefits">
          <div>🚚 <span>Free Shipping<br />Above ₹999</span></div>
          <div>♧ <span>Secure Checkout</span></div>
          <div>↻ <span>Easy Returns</span></div>
        </div>
      </section>


      {/* 2. FEATURED COLLECTION */}
      <section className="cal-featured-section">

        <div className="cal-section-title">
          <span></span>
          <div>
            <h2>Featured Collection</h2>
            <p>Discover our most loved styles</p>
          </div>
          <span></span>
        </div>

        {products.length > 0 ? (
          <div className="cal-featured-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="cal-empty-products">
            <h3>Your next favourite pair belongs here.</h3>
            <p>Products will appear when added to your catalogue.</p>
            <Link to="/shop">Explore shop →</Link>
          </div>
        )}

        <div className="cal-view-all">
          <Link to="/shop">VIEW ALL PRODUCTS →</Link>
        </div>

      </section>


      {/* 3. EVERYDAY COLLECTION BANNER */}
      <section className="cal-everyday-banner">

        <div className="cal-everyday-content">
          <p className="cal-everyday-eyebrow">
            THE EVERYDAY COLLECTION
          </p>

          <h2>
            Your day
            <br />
            found its footing.
          </h2>

          <p className="cal-everyday-description">
            Everyday comfort. Everyday style.
            <br />
            Find your perfect pair.
          </p>

          <Link to="/shop" className="cal-everyday-button">
            EXPLORE COLLECTION
          </Link>
        </div>

        <span className="cal-everyday-brand">
          CALZARE / EVERYDAY
        </span>

        <span className="cal-everyday-stamp">
          CALZARE · EST. 2026
        </span>

      </section>


      {/* 4. WHY CHOOSE CALZARE */}
      <section className="cal-trust-section">

        <div className="cal-trust-item">
          <span>♢</span>
          <div>
            <h3>Premium Quality</h3>
            <p>Built to last</p>
          </div>
        </div>

        <div className="cal-trust-item">
          <span>♧</span>
          <div>
            <h3>Trusted Shopping</h3>
            <p>Shop with confidence</p>
          </div>
        </div>

        <div className="cal-trust-item">
          <span>♧</span>
          <div>
            <h3>Dedicated Support</h3>
            <p>We're here to help</p>
          </div>
        </div>

        <div className="cal-trust-item">
          <span>↻</span>
          <div>
            <h3>Easy Returns</h3>
            <p>Hassle-free returns</p>
          </div>
        </div>

      </section>


      {/* 5. MEN AND WOMEN COLLECTIONS */}
      <section className="category-banners">

        <Link to="/shop?category=Men" className="category-banner">
          <img
            src="https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=85"
            alt="Men's footwear"
          />
          <span>
            THE MEN'S EDIT <b>SHOP MEN ↗</b>
          </span>
        </Link>

        <Link to="/shop?category=Women" className="category-banner">
          <img
            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85"
            alt="Women's footwear"
          />
          <span>
            THE WOMEN'S EDIT <b>SHOP WOMEN ↗</b>
          </span>
        </Link>

      </section>


      {/* 6. BRAND EDITORIAL */}
      <section className="editorial">
        <img
          src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1800&q=85"
          alt="Calzare footwear collection"
        />

        <div>
          <p className="eyebrow light">THE NEW PERSPECTIVE</p>

          <h2>
            Every step
            <br />
            <em>is a statement.</em>
          </h2>

          <Link
            className="btn btn-light"
            to="/shop?collection=New%20Arrivals"
          >
            SHOP NEW ARRIVALS
          </Link>
        </div>
      </section>

    </main>
  );
}
