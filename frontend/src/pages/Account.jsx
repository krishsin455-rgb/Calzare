import { useEffect,useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { api,money } from "../services/api";
import { useStore } from "../context/StoreContext";
export default function Account(){const {user,logout}=useStore();const [orders,setOrders]=useState([]);const nav=useNavigate();useEffect(()=>{api("/orders/mine").then(d=>setOrders(d.orders)).catch(console.error)},[]);
return <main className="page-shell"><div className="page-heading"><p className="eyebrow">YOUR CALZARE</p><h1>Hello, {user?.name}</h1><p>{user?.email}</p><button className="text-link" onClick={()=>{logout();nav("/")}}>SIGN OUT</button></div><h2>Your orders</h2>{orders.length?orders.map(o=><div className="order-card" key={o._id}><div><b>Order #{o._id.slice(-7).toUpperCase()}</b><span>{new Date(o.createdAt).toLocaleDateString("en-IN")}</span></div><div><b>{money(o.total)}</b><span>{o.orderStatus} · {o.paymentStatus}</span></div></div>):<div className="empty-state"><p>You haven't placed an order yet.</p><Link to="/shop" className="btn btn-dark">SHOP NOW</Link></div>}</main>}
