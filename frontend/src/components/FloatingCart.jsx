
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { money, imageUrl } from "../services/api";

export default function FloatingCart() {
  const [open, setOpen] = useState(false);

  const {
    cart,
    updateQty,
    removeFromCart
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  // Hide the floating cart on the main cart page.
  if (location.pathname === "/cart") return null;

  return (
    <div className="floating-cart-wrapper">

      <button
        className="floating-cart-button"
        onClick={() => setOpen(!open)}
        aria-label="Open shopping cart"
      >
        <span className="floating-cart-icon">🛍</span>
        <span className="floating-cart-label">BAG</span>
        <span className="floating-cart-count">{itemCount}</span>
      </button>

      {open && (
        <>
          <div
            className="floating-cart-overlay"
            onClick={() => setOpen(false)}
          />

          <aside className="floating-cart-panel">

            <div className="floating-cart-header">
              <div>
                <p className="eyebrow">CALZARE COLLECTION</p>
                <h2>Your Bag ({itemCount})</h2>
              </div>

              <button
                className="floating-cart-close"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="floating-cart-empty">
                <p>Your bag is empty.</p>
                <Link
                  to="/shop"
                  className="btn btn-dark"
                  onClick={() => setOpen(false)}
                >
                  EXPLORE FOOTWEAR
                </Link>
              </div>
            ) : (
              <>
                <div className="floating-cart-items">
                  {cart.map((item) => (
                    <div
                      className="floating-cart-item"
                      key={item.product._id + item.size}
                    >
                      <img
                        src={imageUrl(item.product.images?.[0])}
                        alt={item.product.name}
                      />

                      <div className="floating-cart-info">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={() => setOpen(false)}
                        >
                          {item.product.name}
                        </Link>

                        <span>
                          Size: {item.size || "Standard"}
                        </span>

                        <strong>
                          {money(item.product.price)}
                        </strong>

                        <button
                          className="remove-link"
                          onClick={() =>
                            removeFromCart(
                              item.product._id,
                              item.size
                            )
                          }
                        >
                          Remove
                        </button>

                        <div className="floating-cart-qty">
                          <button
                            onClick={() =>
                              updateQty(
                                item.product._id,
                                item.size,
                                item.quantity - 1
                              )
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQty(
                                item.product._id,
                                item.size,
                                Math.min(10, item.quantity + 1)
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="floating-cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Shipping</span>
                    <strong>
                      {shipping === 0 ? "FREE" : money(shipping)}
                    </strong>
                  </div>

                  <div className="floating-cart-total">
                    <span>Total</span>
                    <strong>{money(total)}</strong>
                  </div>

                  <button
                    className="btn btn-dark full"
                    onClick={() => {
                      setOpen(false);
                      navigate("/checkout");
                    }}
                  >
                    PROCEED TO CHECKOUT
                  </button>

                  <Link
                    to="/cart"
                    className="floating-cart-view"
                    onClick={() => setOpen(false)}
                  >
                    VIEW FULL BAG
                  </Link>
                </div>
              </>
            )}

          </aside>
        </>
      )}

    </div>
  );
}
