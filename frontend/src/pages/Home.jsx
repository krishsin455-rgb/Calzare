
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

const defaults = {
  heroTag: "⭐ PREMIUM FOOTWEAR",
  heroLine1: "Walk Your",
  heroLine2: "Own",
  heroHighlight: "Way.",
  heroDescription: "Premium footwear for every step of your journey.",
  heroButtonText: "Shop the Collection →",
  heroButtonLink: "/shop",
  heroImage: "",

  featuredTitle: "Featured Collection",
  featuredDescription: "Discover our most loved styles",

  everydayEyebrow: "THE EVERYDAY COLLECTION",
  everydayLine1: "Your day",
  everydayLine2: "found its footing.",
  everydayDescription: "Everyday comfort. Everyday style. Find your perfect pair.",
  everydayButtonText: "EXPLORE COLLECTION",
  everydayButtonLink: "/shop",

  trustItems: [
    { title: "Premium Quality", description: "Built to last", icon: "♢" },
    { title: "Trusted Shopping", description: "Shop with confidence", icon: "♧" },
    { title: "Dedicated Support", description: "We're here to help", icon: "♧" },
    { title: "Easy Returns", description: "Hassle-free returns", icon: "↻" }
  ],

  menImage: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=85",
  womenImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85",
  menLabel: "THE MEN'S EDIT",
  womenLabel: "THE WOMEN'S EDIT",

  editorialImage: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1800&q=85",
  editorialEyebrow: "THE NEW PERSPECTIVE",
  editorialLine1: "Every step",
  editorialLine2: "is a statement.",
  editorialButtonText: "SHOP NEW ARRIVALS",
  editorialButtonLink: "/shop?collection=New%20Arrivals"
};

const getImage = (src) => {
  if (!src) return "";

  if (src.startsWith("/uploads")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5003/api";
    return `${apiBase.replace(/\/api\/?$/, "")}${src}`;
  }

  return src;
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState(defaults);

  useEffect(() => {
    api("/products?limit=8")
      .then((data) => setProducts(data.products || []))
      .catch(console.error);

    api("/content")
      .then((data) => {
        setContent((current) => ({
          ...current,
          ...(data.homepage || {})
        }));
      })
      .catch(console.error);
  }, []);

  const heroImage = getImage(content.heroImage) ||
    (products[0]?.images?.[0]
      ? getImage(products[0].images[0])
      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=90");

  return (
    <main className="cal-home">

      {/* 1. PREMIUM HERO SECTION */}
      <section className="cal-main-hero">
        <div className="cal-hero-content">
          <span className="cal-hero-tag">
            {content.heroTag}
          </span>

          <h1>
            {content.heroLine1}
            <br />
            {content.heroLine2} <span>{content.heroHighlight}</span>
          </h1>

          <p>{content.heroDescription}</p>

          <Link to={content.heroButtonLink || "/shop"} className="cal-hero-button">
            {content.heroButtonText}
          </Link>
        </div>

        <div className="cal-hero-visual">
          <img src={heroImage} alt="Calzare premium footwear" />
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
            <h2>{content.featuredTitle}</h2>
            <p>{content.featuredDescription}</p>
          </div>
          <span></span>
        </div>

        {products.length > 0 ? (
          <div className="cal-featured-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
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

      {/* 3. EVERYDAY COLLECTION */}
      <section className="cal-everyday-banner">
        <div className="cal-everyday-content">
          <p className="cal-everyday-eyebrow">
            {content.everydayEyebrow}
          </p>

          <h2>
            {content.everydayLine1}
            <br />
            {content.everydayLine2}
          </h2>

          <p className="cal-everyday-description">
            {content.everydayDescription}
          </p>

          <Link to={content.everydayButtonLink || "/shop"} className="cal-everyday-button">
            {content.everydayButtonText}
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
        {(content.trustItems || defaults.trustItems).map((item, index) => (
          <div className="cal-trust-item" key={index}>
            <span>{item.icon}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 5. MEN AND WOMEN COLLECTIONS */}
      <section className="category-banners">
        <Link to="/shop?category=Men" className="category-banner">
          <img src={getImage(content.menImage)} alt="Men's footwear" />
          <span>
            {content.menLabel} <b>SHOP MEN ↗</b>
          </span>
        </Link>

        <Link to="/shop?category=Women" className="category-banner">
          <img src={getImage(content.womenImage)} alt="Women's footwear" />
          <span>
            {content.womenLabel} <b>SHOP WOMEN ↗</b>
          </span>
        </Link>
      </section>

      {/* 6. BRAND EDITORIAL */}
      <section className="editorial">
        <img
          src={getImage(content.editorialImage)}
          alt="Calzare footwear collection"
        />

        <div>
          <p className="eyebrow light">{content.editorialEyebrow}</p>

          <h2>
            {content.editorialLine1}
            <br />
            <em>{content.editorialLine2}</em>
          </h2>

          <Link
            className="btn btn-light"
            to={content.editorialButtonLink || "/shop?collection=New%20Arrivals"}
          >
            {content.editorialButtonText}
          </Link>
        </div>
      </section>

    </main>
  );
}
