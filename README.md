# siva-sarvesh-crackers
siva-sarvesh-crackers

# Siva Sarvesh Crackers – ordering website

Next.js (Pages Router) + MySQL/MariaDB website for **Siva Sarvesh Crackers, Sivakasi**.
Customers pick crackers from the 2026 price list, verify their email with an OTP and send the order.
The owner manages orders from a password-protected admin panel, and every step sends an email.

> Crackers cannot be sold online under the 2018 Supreme Court order. The site works as an
> **order enquiry**: the team confirms each order by phone and takes payment after that call.

---

## Contents

1. [Features](#features)
2. [Tech stack and design decisions](#tech-stack-and-design-decisions)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Environment variables](#environment-variables)
6. [Database setup](#database-setup)
7. [Admin creation](#admin-creation)
8. [Development and production](#development-and-production)
9. [SMTP and Gmail App Password](#smtp-and-gmail-app-password)
10. [Product management](#product-management)
11. [Promotion codes](#promotion-codes)
12. [Deployment on AWS EC2](#deployment-on-aws-ec2)
13. [Security notes](#security-notes)
14. [Tests](#tests)
15. [Project structure](#project-structure)
16. [Price list items to verify](#price-list-items-to-verify)

---

## Features

**Public site**: Home, About, Products (price list), Safety Tips, Contact Us, Order, Order Confirmation, 404.

- 202 products in 20 categories from the 2026 price list, stored in MySQL.
- Price list shows S.No, image, code, English and Tamil name, unit, actual price, discount, rate, quantity and a read-only amount.
- Search by name, code or Tamil name, filter by category, sort by list order, name, price or category.
- Desktop: category tables with a sticky order summary. Mobile: product cards with large +/- buttons and a fixed bottom total bar.
- Live totals: sub total, promotion discount, packing charges, round off and overall amount.
- ₹3,000 minimum order enforced in the browser (error popup) **and** on the server.
- Order form: State (Tamil Nadu), City (from `constants/locations.js`), Name, Indian mobile, Email, Address.
- Email OTP flow: Submit → OTP emailed → verify → **Confirm & Place Order** → order saved in a transaction → emails to customer and admin.
- Promotion codes validated and calculated on the server only.
- Contact form that emails the admin.
- SEO: per-page title, description, canonical, Open Graph and Twitter tags, `sitemap.xml`, `robots.txt`, favicon.

**Admin** (`/admin/login`):

- bcrypt passwords, signed session in an HttpOnly, SameSite=Strict cookie, middleware protection for every `/admin` page and `requireAdmin` in every admin API.
- Dashboard: total, pending, picked up, delivered and rejected counts plus the latest orders.
- Orders list: filter by order number, name, mobile, email, status, city and date range; sort newest, oldest, highest or lowest amount; pagination (15 per page).
- Order details: customer, order, product and price details, status history.
- Status change (Pending, Picked Up, Delivered, Rejected) with an optional note, a confirmation step, a history record and an email to the customer.

## Tech stack and design decisions

| Area | Choice |
| --- | --- |
| Framework | Next.js 15, **Pages Router**, JavaScript |
| Database | MySQL 8 or MariaDB 10.6+ through `mysql2` with parameterised queries |
| Email | Nodemailer (SMTP) |
| Auth | `bcryptjs` + `jose` (HS256 session token) |
| Icons | Font Awesome (`@fortawesome/react-fontawesome`) |
| Styling | Global CSS variables (`styles/globals.css`) + CSS Modules |
| Tests | Node's built-in test runner (`node --test`) |

Deviations from the original brief, and why:

- **`mysql2` instead of Prisma.** The brief mentions both parameterised queries and Prisma. `mysql2` works the same on MySQL and MariaDB, keeps the server small on a single EC2 instance, and needs no generate/migrate step. Every query uses `?` placeholders. There is therefore no `prisma/` folder; `database/schema.sql` is the schema.
- **Pages Router.** The brief asks for the Page Router, so API routes live in `pages/api/*` instead of `app/api/*/route.js`. Each page is `pages/<route>/index.jsx` and each component is `components/Name/Name.jsx` with an `index.js` re-export.
- **Email is required** on the order form because OTP verification needs it (as noted in section 45 of the brief).

## Requirements

- Node.js **20.6 or newer** (the npm scripts use `--env-file`)
- MySQL 8.0+ or MariaDB 10.6+
- An SMTP account (Gmail with an App Password works)

## Installation

```bash
npm install
cp .env.example .env.local     # then edit .env.local
```

## Environment variables

All secrets live in `.env.local`, which is git-ignored. Only variables starting with `NEXT_PUBLIC_` reach the browser.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/siva_sarvesh_crackers` |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used in SEO tags, the sitemap and email links |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP server (`smtp.gmail.com`, `587`, `false`) |
| `SMTP_USER`, `SMTP_PASS` | SMTP login. `SMTP_PASS` is only read in `lib/email` on the server |
| `EMAIL_FROM` | Sender address |
| `ADMIN_EMAIL` | Receives new-order and contact-form emails (default `vallarasu4102000@gmail.com`) |
| `AUTH_SECRET` | 32+ character random string that signs admin sessions |
| `OTP_SECRET` | Random string used to hash OTPs and verification tokens |
| `ADMIN_SEED_NAME`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` | Optional, only for `npm run seed:admin` |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Database setup

`database/schema.sql` creates the database, all tables (admins, categories, products, promotion_codes,
email_verifications, order_sequences, orders, order_items, order_status_history), indexes, foreign keys
and the seed data for all 202 products. It is safe to run more than once.

**Option A, with npm** (uses `DATABASE_URL`; the user needs CREATE rights the first time):

```bash
npm run db:setup
```

**Option B, with the MySQL client:**

```bash
mysql -u root -p < database/schema.sql
```

Create a dedicated database user for the app:

```sql
CREATE USER 'ssc_app'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON siva_sarvesh_crackers.* TO 'ssc_app'@'localhost';
FLUSH PRIVILEGES;
```

### Seed

The catalogue's single source of truth is `database/seedData.js`.

```bash
npm run seed              # upserts categories and products into the database
npm run db:generate-sql   # rewrites database/schema.sql from seedData.js
```

## Admin creation

Admin credentials are never stored in the source code.

```bash
npm run seed:admin
```

It prompts for name, email and password (at least 10 characters), hashes the password with bcrypt and
saves the admin. For non-interactive servers, set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in
`.env.local`, run the command, then delete those two lines. Running it again with the same email resets
that admin's password.

## Development and production

```bash
npm run dev      # http://localhost:3000
npm run build
npm start
npm test
```

## SMTP and Gmail App Password

1. Turn on 2-Step Verification for the Gmail account (Google Account → Security).
2. Open **Security → 2-Step Verification → App passwords**.
3. Create an app password named "Siva Sarvesh Website" and copy the 16 character code.
4. Put it in `.env.local` as `SMTP_PASS` (no spaces). Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.
5. Restart the app.

Gmail allows about 500 emails a day. For more, use a transactional provider (Amazon SES, Brevo, Zoho ZeptoMail) and change only the SMTP variables.

Email templates live in `emails/`: `otpEmail.js`, `orderPlacedEmail.js`, `adminNewOrderEmail.js`,
`orderStatusUpdatedEmail.js` and `contactMessageEmail.js`, sharing `layout.js`. Social links in emails come
from `constants/socialLinks.js` and are drawn as coloured buttons because icon fonts do not load in most email clients.

For local testing without sending real mail you can set `OTP_DEV_LOG=true` (development only) to print the OTP in the server console.

## Product management

Products are read from the database on every request, so changes show immediately.

```sql
USE siva_sarvesh_crackers;

-- Change a price (keep selling_price in line with the discount)
UPDATE products SET original_price = 130, selling_price = 26 WHERE product_code = 'SSC003';

-- Hide a product that is out of stock
UPDATE products SET is_active = 0 WHERE product_code = 'SSC068';

-- Add a product
INSERT INTO products (product_code, product_name, tamil_name, category_id, unit, original_price, discount_percentage, selling_price, display_order)
VALUES ('SSC203', 'Sky Lantern', 'ஸ்கை லான்டர்ன்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 500, 80, 100, 203);

-- Add a product photo (put the file in public/images/products/)
UPDATE products SET image_url = '/images/products/ssc003.jpg' WHERE product_code = 'SSC003';

-- Hide a whole category
UPDATE categories SET is_active = 0 WHERE slug = 'paper-shots';
```

Past orders are not affected: `order_items` keeps a snapshot of name, Tamil name, unit and price.

Business rules (minimum order, packing percentage, default discount, OTP timings, admin page size) are in
`constants/config.js`. Contact details and address are in `BUSINESS` in the same file. Social links are in
`constants/socialLinks.js`. Cities are in `constants/locations.js`.

## Promotion codes

The discount is always calculated on the server; the browser only sends the code.

```sql
-- 5% off above ₹5,000, capped at ₹1,000 (included in schema.sql, inactive by default)
UPDATE promotion_codes SET is_active = 1 WHERE code = 'DIWALI5';

-- Flat ₹200 off above ₹4,000, first 100 orders, until 31 Oct 2026
INSERT INTO promotion_codes (code, description, discount_type, discount_value, min_order_amount, usage_limit, valid_until)
VALUES ('FIRST200', 'Flat 200 off', 'FLAT', 200, 4000, 100, '2026-10-31 23:59:59');
```

## Deployment on AWS EC2

A `t4g.small` (2 GB RAM, ARM) in Mumbai (`ap-south-1`) with 20 GB gp3 comfortably runs Next.js, MariaDB and Nginx together.

```bash
# 1. System packages (Ubuntu 24.04)
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mariadb-server git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Swap (helps `next build` on 2 GB)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. Database
sudo mysql_secure_installation
sudo mysql < database/schema.sql      # then create the ssc_app user (see above)

# 4. App
git clone <your-repo> /var/www/ssc && cd /var/www/ssc
npm ci
cp .env.example .env.local && nano .env.local
npm run seed:admin
npm run build
pm2 start npm --name ssc -- start
pm2 save && pm2 startup
```

Nginx (`/etc/nginx/sites-available/ssc`):

```nginx
server {
    server_name sivasarveshcrackers.com www.sivasarveshcrackers.com;
    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ssc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sivasarveshcrackers.com -d www.sivasarveshcrackers.com
```

Security group: open 80 and 443 to everyone, 22 only to your IP, and keep 3306 and 3000 closed.
Update `public/robots.txt` if the domain changes. To deploy updates: `git pull && npm ci && npm run build && pm2 restart ssc`.

Back up the database daily, for example with a cron job:

```bash
0 2 * * * mysqldump siva_sarvesh_crackers | gzip > /var/backups/ssc-$(date +\%F).sql.gz
```

## Security notes

- SQL injection: every query is parameterised; sort columns come from fixed allow-lists.
- XSS: React escapes output; user text in emails goes through `escapeHtml`.
- CSRF: admin cookie is `SameSite=Strict`, and every POST/PATCH is rejected unless the `Origin` matches the host.
- Sessions: signed JWT in an `HttpOnly` cookie (`Secure` in production), 12 hour expiry, admin re-checked in the database on every API call.
- Passwords: bcrypt with 12 rounds; constant-time style check for unknown emails.
- OTP: 6 digits from `crypto.randomInt`, HMAC-hashed, 5 minute expiry, 5 attempts, 60 second resend cooldown, 5 sends per 30 minutes per email, single use, never returned by the API or logged in production.
- Order verification: OTP success returns a single-use token (stored hashed, 30 minutes) that is consumed inside the order transaction.
- Rate limits (in-memory, per IP) on OTP, login, promotion, order and contact endpoints. If you run more than one server, move these to Redis.
- Server-side pricing: the server ignores any price or total sent by the browser, re-reads prices from the database, applies the promotion, checks the minimum order and writes `orders`, `order_items` and `order_status_history` in one transaction.
- Security headers in `next.config.mjs`; admin pages are `noindex`.

## Tests

```bash
npm test
```

| File | Covers |
| --- | --- |
| `tests/calculations.test.js` | price × quantity, totals, packing, round off, promotions, ₹3,000 minimum |
| `tests/otp.test.js` | valid, expired, incorrect, reused OTPs and attempt limits |
| `tests/order.test.js` | no products, invalid quantity, invalid product, customer validation, promotion rules |
| `tests/status.test.js` | the four statuses and the initial status |
| `tests/auth.test.js` | valid and invalid credentials, redirect of unauthenticated admins, token tampering |

## Project structure

```text
components/          Reusable UI (Button, Input, Select, Dropdown, DatePicker, Modal, SuccessPopup,
                     ErrorPopup, ConfirmationModal, LoadingSpinner, Header, Footer, SocialIcons,
                     ProductCard, ProductTable, QuantityInput, OrderSummary, Breadcrumb, Pagination,
                     AdminSidebar, AdminLayout, OtpDialog, StatusChangeDialog, ...)
constants/           config.js, socialLinks.js, locations.js
context/             CartContext (quantities only), useOrderTotals
database/            schema.base.sql, schema.sql (generated), seedData.js
emails/              Email templates + shared layout
lib/                 api, auth, calculations, db, email, format, orders, otp, products, promotions,
                     security, validation
middleware.js        Protects /admin pages
pages/               Public pages, admin pages and pages/api routes
public/              favicon, og-image, robots.txt
scripts/             setupDb.js, seed.js, seedAdmin.js, generateSchemaSql.js
styles/              globals.css (design tokens) + page CSS modules
tests/               node:test unit tests
```

## Price list items to verify

The seed data copies the PDF exactly. These entries look like typos in the PDF; check them before going live
and correct them in `database/seedData.js` (then `npm run seed`) or directly with SQL:

- **SSC012 Ground Chakkar Big**: the Tamil name says சிறியது (small).
- **SSC026 Flower Pot Giant (10 Pcs)**: ₹100, cheaper than the Small pot (₹200).
- **SSC027 Colour Koti (10 Pcs)**: ₹100, while Colour Koti Special is ₹1,250.
- **SSC064 600 Chain**: ₹100, cheaper than the 100 Chain (₹175).
- **15 cm and 30 cm sparklers** have the same price (₹250).
- The WhatsApp ads say "75% + 5% = 80%". Applied one after the other that is 76.25%, not 80%. The site uses a flat 80%.
