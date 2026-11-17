import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { imageUrl,money } from "../services/api";
export default function ProductCard({product}){const {toggleWishlist,wishlist}=useStore();const saved=wishlist.some(p=>p._id===product._id);
return <article className="product-card"><div className="product-image-wrap"><Link to={`/product/${product.slug}`}><img src={imageUrl(product.images?.[0])} alt={product.name}/></Link><button className={`wishlist-btn ${saved?"saved":""}`} onClick={()=>toggleWishlist(product)} aria-label="Toggle wishlist"><Heart size={18} fill={saved?"currentColor":"none"}/></button>{product.compareAtPrice>product.price&&<span className="sale-tag">SALE</span>}</div><div className="product-meta"><span>{product.category}</span><span>{product.collection}</span></div><Link className="product-name" to={`/product/${product.slug}`}>{product.name}</Link><div className="price">{money(product.price)} {product.compareAtPrice>product.price&&<del>{money(product.compareAtPrice)}</del>}</div></article>}
