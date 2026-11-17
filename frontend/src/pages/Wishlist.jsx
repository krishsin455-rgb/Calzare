import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
export default function Wishlist(){
  const {wishlist}=useStore();
  return <main className="page-shell">
    <div className="page-heading"><p className="eyebrow">THE PAIRS YOU LOVE</p><h1>Your wishlist</h1><p>Keep your favourite Calzare pairs close.</p></div>
    {wishlist.length ? <div className="product-grid">{wishlist.map(p=><ProductCard key={p._id} product={p}/>)}</div> :
      <div className="empty-state"><h2>No saved pairs just yet.</h2><p>Tap the heart on a product to save it here.</p><Link className="btn btn-dark" to="/shop">EXPLORE FOOTWEAR</Link></div>}
  </main>;
}
