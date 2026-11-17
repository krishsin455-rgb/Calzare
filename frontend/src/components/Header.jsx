import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X, UserRound } from "lucide-react";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
export default function Header(){
 const [open,setOpen]=useState(false); const {cart,wishlist,user}=useStore();
 const links=[["Home","/"],["Men","/shop?category=Men"],["Women","/shop?category=Women"],["New Arrivals","/shop?collection=New%20Arrivals"],["Our Story","/story"],["Contact","/contact"]];
 return <><div className="announcement">A LITTLE LUXURY, EVERY DAY <span>— FREE SHIPPING ON ORDERS ABOVE ₹999</span></div>
 <header className="header"><button className="icon-btn mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
 <Link className="logo" to="/">CALZARE<span>WALK YOUR OWN WAY.</span></Link>
 <nav className={open?"nav nav-open":"nav"}>{links.map(([t,u])=><NavLink key={t} to={u} onClick={()=>setOpen(false)}>{t}</NavLink>)}</nav>
 <div className="header-actions"><Link className="icon-btn" to="/wishlist" aria-label="Wishlist"><Heart/><i>{wishlist.length}</i></Link><Link className="icon-btn" to={user?"/account":"/login"} aria-label="Account"><UserRound/></Link><Link className="icon-btn" to="/cart" aria-label="Cart"><ShoppingBag/><i>{cart.reduce((s,i)=>s+i.quantity,0)}</i></Link></div></header></>;
}
