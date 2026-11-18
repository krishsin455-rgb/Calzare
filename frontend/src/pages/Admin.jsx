
import { useEffect, useMemo, useState } from "react";
import ContentEditor from "./ContentEditor";
import { api, money, imageUrl } from "../services/api";
import { useStore } from "../context/StoreContext";

const blank = {
  name: "",
  description: "",
  category: "Women",
  collection: "New Arrivals",
  price: 1999,
  compareAtPrice: 0,
  images: [],
  video: "",
  sizes: ["36", "37", "38", "39", "40", "41"],
  colors: ["Black"],
  stock: 10,
  featured: false,
  active: true,
};

const navItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "orders", icon: "🛒", label: "Orders" },
  { id: "products", icon: "◇", label: "Products" },
  { id: "users", icon: "♙", label: "Users" },
  { id: "homepage", icon: "⌂", label: "Homepage" },
{ id: "story", icon: "✦", label: "Our Story" },
];

export default function Admin() {
  const { user } = useStore();
  const isSuperAdmin = user?.role === "superadmin";

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api("/superadmin/users");
      setUsers(data.users || []);
    } catch (error) {
      setMsg(error.message || "Could not load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const changeUserRole = async (id, role) => {
    try {
      await api(`/superadmin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      setMsg("User role updated successfully.");
      await loadUsers();
    } catch (error) {
      setMsg(error.message || "Could not update user role.");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      await api(`/superadmin/users/${id}`, {
        method: "DELETE",
      });

      setMsg("User deleted successfully.");
      await loadUsers();
    } catch (error) {
      setMsg(error.message || "Could not delete user.");
    }
  };

  const refresh = async () => {
    try {
      const [productData, orderData] = await Promise.all([
        api("/products/admin/all"),
        api("/orders"),
      ]);

      setProducts(productData.products || []);
      setOrders(orderData.orders || []);
    } catch (error) {
      setMsg(error.message || "Could not load store data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if ((tab === "users" || tab === "dashboard") && isSuperAdmin) {
      loadUsers();
    }
  }, [tab, isSuperAdmin]);

  const stats = useMemo(() => {
    const stock = products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0
    );

    const orderValue = orders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    const customers = new Set(
      orders.map((order) => order.user?.email).filter(Boolean)
    ).size;

    const lowStock = products.filter(
      (product) => Number(product.stock) < 5
    ).length;

    return {
      products: products.length,
      orders: orders.length,
      stock,
      orderValue,
      customers,
      registeredUsers: users.length,
      lowStock,
    };
  }, [products, orders, users]);

  const save = async (event) => {
    event.preventDefault();
    setMsg("");

    try {
      const data = {
        ...form,
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice),
        stock: Number(form.stock),
      };

      if (editing) {
        await api(`/products/${editing}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        setMsg("Product updated successfully.");
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
        setMsg("Product added successfully.");
      }

      setEditing(null);
      setForm(blank);
      await refresh();
    } catch (error) {
      setMsg(error.message || "Could not save product.");
    }
  };

  const edit = (product) => {
    setEditing(product._id);
    setForm({
      ...blank,
      ...product,
      images: product.images || [],
      video: product.video || "",
      sizes: product.sizes || [],
      colors: product.colors || [],
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));

    try {
      const result = await api("/products/upload", {
        method: "POST",
        body: fd,
      });

      setForm((current) => ({
        ...current,
        images: [...current.images, ...(result.images || [])],
      }));

      setMsg("Images uploaded successfully.");
    } catch (error) {
      setMsg(error.message || "Image upload failed.");
    }

    event.target.value = "";
  };

  const uploadVideo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "video/mp4") {
      setMsg("Please select an MP4 video.");
      event.target.value = "";
      return;
    }

    const fd = new FormData();
    fd.append("video", file);

    try {
      const result = await api("/products/upload-video", {
        method: "POST",
        body: fd,
      });

      setForm((current) => ({
        ...current,
        video: result.video || "",
      }));

      setMsg("Product video uploaded successfully.");
    } catch (error) {
      setMsg(error.message || "Video upload failed.");
    }

    event.target.value = "";
  };


  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api(`/products/${id}`, { method: "DELETE" });
      setMsg("Product deleted.");
      await refresh();
    } catch (error) {
      setMsg(error.message || "Could not delete product.");
    }
  };
  const printOrder = (order) => {
    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]);

    const address = order.shippingAddress || {};
    const fullAddress = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean).join(", ");

    const itemsHtml = (order.items || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.size || "—")}</td>
        <td>${escapeHtml(item.quantity || 1)}</td>
        <td>${escapeHtml(money(item.price))}</td>
        <td>${escapeHtml(money(Number(item.price || 0) * Number(item.quantity || 1)))}</td>
      </tr>
    `).join("");

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      setMsg("Please allow pop-ups to print the order.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calzare Order</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 35px; color: #222; }
          h1 { letter-spacing: 5px; margin-bottom: 5px; }
          h2 { margin-top: 30px; }
          .muted { color: #666; }
          .section { border: 1px solid #ddd; padding: 18px; margin-top: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f2f2f2; }
          .total { text-align: right; margin-top: 25px; font-size: 18px; }
          .footer { margin-top: 45px; text-align: center; color: #777; }
          @media print { button { display: none; } }
          @page {
  size: A4;
  margin: 12mm;
}

body {
  font-family: Arial, sans-serif;
  padding: 10px;
  color: #222;
  font-size: 12px;
}

h1 {
  letter-spacing: 5px;
  margin-bottom: 4px;
  font-size: 25px;
}

h2 {
  margin-top: 16px;
  font-size: 16px;
}

p {
  margin: 6px 0;
}

.section {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background: #f2f2f2;
}

.total {
  text-align: right;
  margin-top: 12px;
}

.footer {
  margin-top: 20px;
  text-align: center;
  color: #777;
}

@media print {
  button {
    display: none;
  }
}
        </style>
      </head>
      <body>
        <h1>CALZARE</h1>
        <p class="muted">Walk Your Own Way</p>
        <hr>

        <h2>ORDER DETAILS</h2>
        <p><strong>Order ID:</strong> #${escapeHtml(order._id)}</p>
        <p><strong>Date:</strong> ${escapeHtml(new Date(order.createdAt).toLocaleString("en-IN"))}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.orderStatus)}</p>

        <div class="section">
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> ${escapeHtml(address.name || order.user?.name || "Not available")}</p>
          <p><strong>Email:</strong> ${escapeHtml(order.user?.email || "Not available")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(address.phone || "Not available")}</p>
          <p><strong>Delivery Address:</strong> ${escapeHtml(fullAddress || "Not available")}</p>
        </div>

        <h2>Ordered Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div class="total">
          <p>Subtotal: ${escapeHtml(money(order.subtotal))}</p>
          <p>Shipping: ${escapeHtml(money(order.shipping))}</p>
          <h2>Total: ${escapeHtml(money(order.total))}</h2>
        </div>

        <div class="section">
          <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}</p>
          <p><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus)}</p>
        </div>

        <div class="footer">Thank you for choosing CALZARE.</div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };
  const updateStatus = async (id, orderStatus) => {
    try {
      await api(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus }),
      });
      await refresh();
    } catch (error) {
      setMsg(error.message || "Could not update order.");
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const recentOrders = [...orders].slice(-5).reverse();

  return (
    <main className="cal-admin">
      <aside className="cal-sidebar">
        <a className="cal-brand" href="/">
          <span className="cal-brand-mark">C</span>
          <span>CALZARE</span>
        </a>

        <p className="cal-side-label">STORE MANAGEMENT</p>

        <nav className="cal-nav">
          {navItems
            .filter((item) => item.id !== "users" || isSuperAdmin)
            .map((item) => (
              <button
                key={item.id}
                className={tab === item.id ? "selected" : ""}
                onClick={() => {
                  setTab(item.id);
                  setMsg("");
                }}
              >
                <span className="cal-nav-icon">{item.icon}</span>
                {item.label}
                {item.id === "products" && (
                  <span className="cal-nav-count">{products.length}</span>
                )}
                {item.id === "orders" && (
                  <span className="cal-nav-count">{orders.length}</span>
                )}
              </button>
            ))}
        </nav>

        <div className="cal-sidebar-bottom">
          <p>CALZARE ADMIN</p>
          <span>Store control panel</span>
        </div>
      </aside>

      <section className="cal-main">
        <header className="cal-topbar">
          <div>
            <p className="cal-eyebrow">CALZARE CONTROL ROOM</p>
            <h1>
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "products"
                ? "Products"
                : tab === "orders"
                ? "Orders"
                : tab === "homepage"
                ? "Homepage"
                : tab === "story"
                ? "Our Story"
                : "User Management"}
            </h1>
          </div>

          <div className="cal-admin-profile">
            <span className="cal-avatar">C</span>
            <div>
              <strong>Store Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {msg && (
          <div className="cal-message">
            {msg}
            <button onClick={() => setMsg("")}>×</button>
          </div>
        )}

        {loading ? (
          <div className="cal-loading">Loading your store...</div>
        ) : (
          <>
            {tab === "dashboard" && (
              <div className="cal-dashboard">
                <div className="cal-welcome">
                  <div>
                    <span>STORE OVERVIEW</span>
                    <h2>Welcome to Calzare</h2>
                    <p>Here's what's happening with your store.</p>
                  </div>
                  <button onClick={() => setTab("products")}>
                    + Add Product
                  </button>
                </div>

                <div className="cal-stat-grid">
                  <article className="cal-stat-card highlighted">
                    <div className="cal-stat-top">
                      <span>Order Value</span>
                      <span className="cal-stat-icon">₹</span>
                    </div>
                    <strong>{money(stats.orderValue)}</strong>
                    <small>Combined value of listed orders</small>
                  </article>

                  <article className="cal-stat-card">
                    <div className="cal-stat-top">
                      <span>Total Orders</span>
                      <span className="cal-stat-icon">▣</span>
                    </div>
                    <strong>{stats.orders}</strong>
                    <small>Orders in your store</small>
                  </article>

                  <article className="cal-stat-card">
                    <div className="cal-stat-top">
                      <span>Total Products</span>
                      <span className="cal-stat-icon">◇</span>
                    </div>
                    <strong>{stats.products}</strong>
                    <small>Products in your catalogue</small>
                  </article>

                  <article className="cal-stat-card">
                    <div className="cal-stat-top">
                      <span>Customers</span>
                      <span className="cal-stat-icon">♙</span>
                    </div>
                    <strong>{stats.customers}</strong>
                    <small>Unique customer emails in orders</small>
                  </article>

                  {isSuperAdmin && (
                    <article className="cal-stat-card">
                      <div className="cal-stat-top">
                        <span>Registered Users</span>
                        <span className="cal-stat-icon">♙</span>
                      </div>
                      <strong>
                        {usersLoading ? "..." : stats.registeredUsers}
                      </strong>
                      <small>Accounts registered on Calzare</small>
                    </article>
                  )}

                  <article className="cal-stat-card">
                    <div className="cal-stat-top">
                      <span>Low Stock Alerts</span>
                      <span className="cal-stat-icon">!</span>
                    </div>
                    <strong>{stats.lowStock}</strong>
                    <small>Products with fewer than 5 units</small>
                  </article>
                </div>

                <div className="cal-dashboard-grid">
                  <section className="cal-panel cal-recent-panel">
                    <div className="cal-panel-heading">
                      <div>
                        <h3>Recent Orders</h3>
                        <p>Your latest customer orders</p>
                      </div>
                      <button onClick={() => setTab("orders")}>
                        View all →
                      </button>
                    </div>

                    {recentOrders.length ? (
                      <div className="cal-table-wrap">
                        <table className="cal-table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Customer</th>
                              <th>Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order._id}>
                                <td>
                                  #{order._id.slice(-7).toUpperCase()}
                                </td>
                                <td>{order.user?.name || "Customer"}</td>
                                <td>{money(order.total)}</td>
                                <td>
                                  <span className="cal-status">
                                    {order.orderStatus || "Placed"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="cal-empty">
                        No orders yet. New orders will appear here.
                      </div>
                    )}
                  </section>

                  <section className="cal-panel cal-stock-panel">
                    <div className="cal-panel-heading">
                      <div>
                        <h3>Inventory Overview</h3>
                        <p>Current catalogue stock</p>
                      </div>
                    </div>
                    <div className="cal-stock-number">{stats.stock}</div>
                    <p className="cal-stock-caption">Total units in stock</p>
                    <div className="cal-stock-line">
                      <span>Products with low stock</span>
                      <strong>{stats.lowStock}</strong>
                    </div>
                    <button
                      className="cal-secondary-button"
                      onClick={() => setTab("products")}
                    >
                      Manage inventory
                    </button>
                  </section>
                </div>

                <section className="cal-panel cal-products-panel">
                  <div className="cal-panel-heading">
                    <div>
                      <h3>Product Catalogue</h3>
                      <p>Your latest products</p>
                    </div>
                    <button onClick={() => setTab("products")}>
                      Manage products →
                    </button>
                  </div>

                  {products.length ? (
                    <div className="cal-product-grid">
                      {products.slice(0, 4).map((product) => (
                        <article className="cal-product-card" key={product._id}>
                          <div className="cal-product-image">
                            {product.images?.[0] ? (
                              <img
                                src={imageUrl(product.images[0])}
                                alt={product.name}
                              />
                            ) : (
                              <span>No image</span>
                            )}
                          </div>
                          <strong>{product.name}</strong>
                          <span>{money(product.price)}</span>
                          <small>Stock: {product.stock}</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="cal-empty">
                      Your products will appear here.
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === "products" && (
              <div className="cal-content-grid">
                <form className="cal-panel cal-product-form" onSubmit={save}>
                  <div className="cal-panel-heading">
                    <div>
                      <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
                      <p>Enter your footwear product details</p>
                    </div>
                  </div>

                  <label>
                    Product Name
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g. Classic Leather Sneakers"
                    />
                  </label>

                  <div className="cal-form-row">
                    <label>
                      Category
                      <select
                        value={form.category}
                        onChange={(e) =>
                          updateField("category", e.target.value)
                        }
                      >
                        <option>Men</option>
                        <option>Women</option>
                        <option>Unisex</option>
                      </select>
                    </label>

                    <label>
                      Collection
                      <input
                        value={form.collection}
                        onChange={(e) =>
                          updateField("collection", e.target.value)
                        }
                        placeholder="New Arrivals"
                      />
                    </label>
                  </div>

                  <div className="cal-form-row">
                    <label>
                      Price (₹)
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => updateField("price", e.target.value)}
                      />
                    </label>

                    <label>
                      Compare-at Price (₹)
                      <input
                        type="number"
                        min="0"
                        value={form.compareAtPrice}
                        onChange={(e) =>
                          updateField("compareAtPrice", e.target.value)
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Stock Quantity
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => updateField("stock", e.target.value)}
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      rows="4"
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Describe the product..."
                    />
                  </label>

                  <label>
                    Image URLs (comma separated)
                    <input
                      value={(form.images || []).join(", ")}
                      onChange={(e) =>
                        updateField(
                          "images",
                          e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="https://example.com/shoe.jpg"
                    />
                  </label>

                  <label className="cal-upload">
                    Upload Product Images
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={upload}
                    />
                    <small>JPG, PNG or WEBP · Maximum 5 MB each</small>
                  </label>

                  {form.images?.length > 0 && (
                    <div className="cal-upload-preview">
                      {form.images.map((src, index) => (
                        <div key={`${src}-${index}`}>
                          <img
                            src={imageUrl(src)}
                            alt={`Product ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                "images",
                                form.images.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="cal-upload">
  Upload Product Video
  <input
    type="file"
    accept="video/mp4"
    onChange={uploadVideo}
  />
  <small>MP4 video · Maximum 50 MB · One video per shoe</small>
</label>

{form.video && (
  <div className="cal-upload-preview">
    <video
      src={imageUrl(form.video)}
      controls
      playsInline
      preload="metadata"
      style={{ width: "100%", maxWidth: "320px", borderRadius: "12px" }}
    />
    <button
      type="button"
      onClick={() => updateField("video", "")}
    >
      Remove Video
    </button>
  </div>
)}

                  <label>
                    Sizes (comma separated)
                    <input
                      value={(form.sizes || []).join(", ")}
                      onChange={(e) =>
                        updateField(
                          "sizes",
                          e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>

                  <label>
                    Colors (comma separated)
                    <input
                      value={(form.colors || []).join(", ")}
                      onChange={(e) =>
                        updateField(
                          "colors",
                          e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </label>

                  <div className="cal-checkbox-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                          updateField("featured", e.target.checked)
                        }
                      />
                      Featured product
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) =>
                          updateField("active", e.target.checked)
                        }
                      />
                      Published
                    </label>
                  </div>

                  <div className="cal-form-actions">
                    <button className="cal-primary-button" type="submit">
                      {editing ? "Update Product" : "Add Product"}
                    </button>
                    {editing && (
                      <button
                        className="cal-secondary-button"
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setForm(blank);
                          setMsg("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <section className="cal-panel cal-catalogue">
                  <div className="cal-panel-heading">
                    <div>
                      <h3>Product Catalogue</h3>
                      <p>{products.length} products</p>
                    </div>
                  </div>

                  {products.map((product) => (
                    <div className="cal-catalogue-row" key={product._id}>
                      {product.images?.[0] ? (
                        <img
                          src={imageUrl(product.images[0])}
                          alt={product.name}
                        />
                      ) : (
                        <div className="cal-no-image">—</div>
                      )}

                      <div className="cal-catalogue-info">
                        <strong>{product.name}</strong>
                        <span>
                          {product.category} · {money(product.price)}
                        </span>
                        <small>Stock: {product.stock}</small>
                      </div>

                      <button onClick={() => edit(product)}>Edit</button>
                      <button
                        className="cal-delete-button"
                        onClick={() => removeProduct(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {!products.length && (
                    <div className="cal-empty">
                      No products yet. Add your first product.
                    </div>
                  )}
                </section>
              </div>
            )}

                        {tab === "orders" && (
              <section className="cal-panel cal-orders-panel">
                <div className="cal-panel-heading">
                  <div>
                    <h3>Customer Orders</h3>
                    <p>{orders.length} orders received</p>
                  </div>
                  <button
                    className="cal-secondary-button"
                    onClick={refresh}
                  >
                    Refresh Orders
                  </button>
                </div>

                {orders.length ? (
                  <div className="cal-order-list">
                    {orders.map((order) => {
                      const address = order.shippingAddress || {};

                      return (
                        <article className="cal-order-row" key={order._id}>
                          <div className="cal-order-info">
                            <strong>
                              Order #{order._id.slice(-7).toUpperCase()}
                            </strong>
                            <span>
                              {address.name || order.user?.name || "Customer"}
                            </span>
                            <small>
                              {order.user?.email || "No email"}
                            </small>
                            <small>
                              Phone: {address.phone || "Not available"}
                            </small>
                          </div>

                          <div className="cal-order-info">
                            <strong>Delivery Address</strong>
                            <span>{address.line1 || "Address not available"}</span>
                            {address.line2 && <span>{address.line2}</span>}
                            <small>
                              {[address.city, address.state, address.pincode]
                                .filter(Boolean)
                                .join(", ") || "Location not available"}
                            </small>
                          </div>

                          <div className="cal-order-info">
                            <strong>Products</strong>
                            {(order.items || []).map((item, index) => (
                              <span key={index}>
                                {item.name} · Size: {item.size || "—"} · Qty: {item.quantity}
                              </span>
                            ))}
                            <strong>{money(order.total)}</strong>
                            <small>
                              {order.paymentMethod?.toUpperCase()} ·{" "}
                              {order.paymentStatus}
                            </small>
                          </div>

                          <div className="cal-order-actions">
                            <select
                              value={order.orderStatus || "Placed"}
                              onChange={(e) =>
                                updateStatus(order._id, e.target.value)
                              }
                            >
                              {[
                                "Placed",
                                "Confirmed",
                                "Packed",
                                "Shipped",
                                "Delivered",
                                "Cancelled",
                              ].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <button
                              className="cal-primary-button"
                              onClick={() => printOrder(order)}
                            >
                              Print Order
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="cal-empty">No customer orders yet.</div>
                )}
              </section>
            )}
            {tab === "users" && isSuperAdmin && (
              <section className="cal-panel cal-orders-panel">
                <div className="cal-panel-heading">
                  <div>
                    <h3>Customer & Admin Management</h3>
                    <p>Manage registered Calzare accounts</p>
                  </div>
                  <button
                    className="cal-secondary-button"
                    onClick={loadUsers}
                  >
                    Refresh
                  </button>
                </div>

                {usersLoading ? (
                  <div className="cal-loading">Loading users...</div>
                ) : users.length ? (
                  <div className="cal-order-list">
                    {users.map((account) => (
                      <article className="cal-order-row" key={account._id}>
                        <div className="cal-order-info">
                          <strong>{account.name}</strong>
                          <span>{account.email}</span>
                          <small>Role: {account.role}</small>
                        </div>

                        <select
                          value={account.role}
                          disabled={account.role === "superadmin"}
                          onChange={(e) =>
                            changeUserRole(account._id, e.target.value)
                          }
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          className="cal-delete-button"
                          disabled={account.role === "superadmin"}
                          onClick={() => removeUser(account._id)}
                        >
                          Delete
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="cal-empty">No registered users found.</div>
                )}
              </section>
            )}
                        {/* HOMEPAGE CONTENT EDITOR */}
            {tab === "homepage" && (
              <ContentEditor section="homepage" />
            )}

            {/* OUR STORY CONTENT EDITOR */}
            {tab === "story" && (
              <ContentEditor section="story" />
            )}
          </>
        )}
      </section>
    </main>
  );
}
