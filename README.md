# Zarf Pearl — Website

A static, GitHub Pages–ready storefront for **Zarf Pearl** (sea & cultivated pearls imported from Japan and China).

## What's included
- `index.html` — homepage (hero, featured pieces, brand story, contact)
- `shop.html` — full product catalog with filters
- `cart.html` — shopping cart (saved in the browser via localStorage)
- `checkout.html` — shipping form + payment method selection (bKash / Nagad / Card)
- `css/style.css` — all styling
- `js/main.js` — product data, cart logic, checkout logic

No build tools needed — it's plain HTML/CSS/JS, so it runs directly on GitHub Pages.

## 1. Put it on GitHub (free hosting, today)
1. Create a new repository on GitHub, e.g. `zarf-pearl`.
2. Upload all files in this folder to the repository (keep the `css/` and `js/` folders as-is).
3. Go to **Settings → Pages** in the repository.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch: `main`, folder: `/root`.
5. Save. GitHub will give you a live URL like:
   `https://yourusername.github.io/zarf-pearl/`
6. Share that link — it's fully public and free.

## 2. Edit your products
Open `js/main.js` and find the `PRODUCTS` array near the top. Each product looks like:
```js
{ id:"hanadi-akoya-strand", name:"Hanadi Akoya Strand", type:"Sea Pearl", origin:"Japan · Akoya",
  price:45000, desc:"...", tone:["#FBF7F0","#E7D8C9"], tag:"Bestseller" }
```
- `price` is in BDT (৳).
- `tone` is two hex colors used to generate the pearl illustration (light, deep shade) — change these per pearl color.
- `tag` is optional ("Bestseller", "New", "Limited") — remove the line to hide it.
- Add or remove products by adding/removing objects in this array — the shop and homepage update automatically.

To use real product photos instead of the generated pearl icon, replace the `pearlSVG(p.tone)` call inside `renderProductGrid()` in `js/main.js` with an `<img src="images/your-photo.jpg">` tag, and add an `image` field to each product.

## 3. Move to a paid domain + hosting later
When you're ready:
1. Buy a domain (e.g. `zarfpearl.com` or `.com.bd`) from a registrar like Namecheap, GoDaddy, or a local Bangladeshi registrar.
2. Either:
   - Point the domain at GitHub Pages (free hosting, just a custom address) — add a `CNAME` file with your domain name, and set an A record with your registrar to GitHub's IPs, **or**
   - Move hosting to a provider with server support (e.g. Vercel, Netlify, or a Bangladeshi host) if you want the payment backend below.
3. Update the `<title>` and meta description tags in each HTML file if your branding changes.

## 4. Connecting real payments (bKash / Nagad / Card)
Right now, the payment step on `checkout.html` is a **working UI mockup**: it collects the shipping details and selected payment method, generates an order ID, and stores the order in the browser (`localStorage`) — but it does not move real money. This is intentional, since GitHub Pages only serves static files and can't run the secure server-side code payments require.

When you're ready to accept real payments:
1. Register as a merchant with **bKash Merchant/PGW**, **Nagad**, and a card gateway that supports Bangladesh (e.g. **SSLCommerz**, which bundles bKash/Nagad/cards in one integration).
2. Stand up a small backend (Node.js, PHP, etc.) on your new paid hosting to hold your merchant API keys securely — API keys must never live in frontend code.
3. In `js/main.js`, find the `mockProcessPayment(order)` function and replace it with a real API call to your backend, e.g.:
   ```js
   function mockProcessPayment(order){
     return fetch('/api/pay', { method:'POST', body: JSON.stringify(order) })
       .then(res => res.json());
   }
   ```
4. Everything else — the cart, catalog, checkout form, and order confirmation screen — can stay exactly as it is.

## 5. Nice-to-haves for later
- Swap generated pearl icons for real product photography.
- Add a proper order database (e.g. Airtable, Google Sheets via API, or a small database) instead of localStorage.
- Add English/Bangla language toggle for the local market.
- Add customer accounts and order history once you have a backend.
