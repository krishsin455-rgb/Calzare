import { useEffect, useState } from "react";
import { api } from "../services/api";

export function Story() {
  const [content, setContent] = useState({
    eyebrow: "A NOTE FROM CALZARE",
    headingLine1: "Style that feels",
    headingLine2: "like you.",
    description:
      "We believe the best footwear earns its place in your everyday life.",
    paragraphs: [
      "Calzare is built around thoughtful design, versatile silhouettes and the small details that make getting dressed feel effortless.",
      "We believe great footwear should bring together comfort, quality and timeless style.",
    ],
    image:
    "",
    buttonText: "EXPLORE COLLECTION",
    buttonLink: "/shop",
  });

  useEffect(() => {
    let active = true;

    api("/content")
      .then((data) => {
        if (active && data.story) {
          setContent((current) => ({
            ...current,
            ...data.story,
          }));
        }
      })
      .catch((error) => {
        console.error("Could not load story content:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-shell story-page">
      <p className="eyebrow">{content.eyebrow}</p>

      <h1>
        {content.headingLine1}
        <br />
        <em>{content.headingLine2}</em>
      </h1>

      <p>{content.description}</p>

      {(content.paragraphs || []).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}

      {content.image && (
        <img
          src={content.image}
          alt="Footwear and everyday style"
        />
      )}

      <a className="btn btn-dark" href={content.buttonLink || "/shop"}>
        {content.buttonText}
      </a>
    </main>
  );
}

export function Contact(){const [form,setForm]=useState({name:"",email:"",message:""});const [msg,setMsg]=useState("");const submit=async e=>{e.preventDefault();try{const d=await api("/contact",{method:"POST",body:JSON.stringify(form)});setMsg(d.message);setForm({name:"",email:"",message:""})}catch(e){setMsg(e.message)}};
return <main className="page-shell contact-page"><div><p className="eyebrow">WE’RE HERE TO HELP</p><h1>Let’s talk.</h1><p>Questions about a pair, an order or anything else? Send us a note.</p></div><form className="contact-form" onSubmit={submit}><input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><textarea required rows="6" placeholder="How can we help?" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><button className="btn btn-dark">SEND MESSAGE</button>{msg&&<p className="notice">{msg}</p>}</form></main>}
export function Wishlist(){const { } = {};return <main className="page-shell empty-state"><h1>Your saved pairs</h1><p>Open the heart on a product to save it to your wishlist.</p></main>}
export function OrderSuccess(){return <main className="page-shell empty-state"><p className="eyebrow">THANK YOU</p><h1>Your order is in.</h1><p>We’ve received your order. You can review its status in your account.</p><a className="btn btn-dark" href="/account">VIEW MY ORDERS</a></main>}
