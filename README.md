# CALZARE — MERN E-commerce

A responsive footwear storefront built with React + Vite, Node.js + Express, and MongoDB.

## Requirements
- Node.js 20+
- npm
- MongoDB Atlas account (or local MongoDB)
- VS Code

## 1. Open the project
Unzip the folder, open VS Code, then choose **File → Open Folder → Calzare**.

## 2. Configure backend
Open `backend/.env.example`, copy it to `backend/.env`, then fill in:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: long random secret
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: initial admin credentials
- Razorpay keys (optional until online payments are enabled)

In VS Code Terminal:
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env`, then start:
```bash
npm run dev
```
The API runs at http://localhost:5000.

## 3. Configure frontend
Open a second VS Code terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

## 4. Seed demo products and create the admin
With backend running, open a third terminal:
```bash
cd backend
npm run seed
```
This creates demo products and the admin account from `.env`.
Change the admin password before deploying. Never use the demo credentials in production.

## 5. Razorpay
1. Create a Razorpay account and use its test mode first.
2. Put the Key ID and Key Secret in `backend/.env`.
3. Put the Key ID in `frontend/.env` as `VITE_RAZORPAY_KEY_ID`.
4. Restart both servers.
5. Test with Razorpay's test credentials/cards from its official documentation.
The server creates the order and verifies the payment signature. Never expose the Key Secret in frontend code.

## 6. Admin
Visit `/login`, sign in using `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then open `/admin`.
The first admin is created by `npm run seed`.

## 7. Production checklist
- Use HTTPS.
- Set a strong, unique `JWT_SECRET`.
- Use a production MongoDB database and restrict its network access.
- Set `CLIENT_URL` to your deployed frontend URL.
- Set `NODE_ENV=production`.
- Configure a secure image-storage provider (this starter stores uploads locally; local uploads are not persistent on many hosting platforms).
- Add privacy, returns, shipping and terms pages appropriate to your business.
- Configure Razorpay live keys only after account verification.
- Add email notifications, tax/shipping calculations and a proper return/refund workflow before accepting real orders.

## Notes
This is a working starter store, not a turnkey legal/tax/compliance solution. Product images use remote Unsplash image URLs as demo content; replace them with images you own or are licensed to use.
