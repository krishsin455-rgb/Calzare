
const API =
  import.meta.env.VITE_API_URL || "http://localhost:5003/api";

export const imageUrl = (src) => {
  if (!src) return "";

  if (src.startsWith("/uploads")) {
    return `${API.replace(/\/api$/, "")}${src}`;
  }

  return src;
};

export async function api(path, options = {}) {
  const token = localStorage.getItem("calzare_token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
