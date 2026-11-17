import { useEffect,useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
export default function Shop(){const [params]=useSearchParams();const [products,setProducts]=useState([]);const [loading,setLoading]=useState(true);const category=params.get("category");const collection=params.get("collection");
useEffect(()=>{setLoading(true);const q=new URLSearchParams();if(category)q.set("category",category);if(collection)q.set("collection",collection);api(`/products?${q}`).then(d=>setProducts(d.products)).catch(console.error).finally(()=>setLoading(false))},[category,collection]);
return <main className="page-shell"><div className="page-heading"><p className="eyebrow">THE CALZARE COLLECTION</p><h1>{category?`${category}'s footwear`:collection||"Shop all"}</h1><p>Find your next favourite pair.</p></div>{loading?<p>Loading collection…</p>:products.length?<div className="product-grid">{products.map(p=><ProductCard key={p._id} product={p}/>)}</div>:<div className="empty-state"><h2>New favourites are on their way.</h2><p>There are no products in this collection yet.</p></div>}</main>}
