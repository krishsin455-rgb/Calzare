
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from "react";

import { api } from "../services/api";

const StoreContext = createContext(null);

export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("calzare_cart") || "[]");
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("calzare_wishlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("calzare_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("calzare_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (localStorage.getItem("calzare_token")) {
      api("/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem("calzare_token"));
    }
  }, []);

  const addToCart = (product, size = "") => {
    setCart((old) => {
      const found = old.find(
        (item) =>
          item.product._id === product._id &&
          item.size === size
      );

      if (found) {
        return old.map((item) =>
          item === found
            ? { ...item, quantity: Math.min(10, item.quantity + 1) }
            : item
        );
      }

      return [...old, { product, size, quantity: 1 }];
    });
  };

  const updateQty = (id, size, quantity) => {
    setCart((old) =>
      old
        .map((item) =>
          item.product._id === id && item.size === size
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id, size) => {
    setCart((old) =>
      old.filter(
        (item) =>
          !(item.product._id === id && item.size === size)
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((old) =>
      old.some((item) => item._id === product._id)
        ? old.filter((item) => item._id !== product._id)
        : [...old, product]
    );
  };

  const logout = () => {
    localStorage.removeItem("calzare_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      cart,
      setCart,
      wishlist,
      addToCart,
      updateQty,
      removeFromCart,
      toggleWishlist,
      logout
    }),
    [user, cart, wishlist]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
