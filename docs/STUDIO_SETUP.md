# Studio orders, tracking and Razorpay

The website now uses a Node server and a persistent SQLite database. Checkout requests are saved on the server, not only in the customer's browser. The studio controls fulfilment status; Razorpay controls verified online payment status.

## Start locally

Use Node 24.15 or newer. Run `npm run dev` and open `http://localhost:5173/studio`.

On the first visit, create your own studio username and a password of at least 12 characters. This local first-time setup is restricted to a direct loopback connection. There are no default administrator credentials. Subsequent visits require sign-in. Sessions expire after eight hours.

## Everyday order workflow

1. Website checkout saves an order and creates an ALN reference and a private tracking link. PVC and printing enquiries have an explicit **Save enquiry & get tracking link** step.
2. In **Orders**, open a request, check its selected options and agree artwork / originals with the customer.
3. Update **Order status**, the customer-visible note, the expected date, courier name, AWB and HTTPS courier tracking link. Save the update.
4. The customer's tracking page reads the server and refreshes every 15 seconds while visible. It works by private tracking link or by reference plus the checkout mobile number. Phone numbers are submitted in the request body rather than in the URL. Internal studio notes and the full delivery address are excluded from customer tracking responses.
5. For WhatsApp or walk-in work, use **Add an order** and share its tracking link. Leave the final total empty until a quote is agreed. Set the final amount, including delivery, before inviting online payment.

Status choices: received, confirmed, design approved, printing & making, ready for collection / dispatch, dispatched, delivered / collected, cancelled. Updates have timestamps. Courier status is supplied through the carrier link; this version does not automatically import carrier scans.

Preview images and personalisation are saved with checkout orders. Original high-resolution print files still need to be supplied to the studio, as stated in checkout and enquiry copy. Automated SMS, email delivery, courier booking and tax-invoice generation are not part of this implementation.

## Connect Razorpay

In the authenticated panel, open **Payments**. Enter your **Test Mode Key ID**, **Key Secret**, a separate webhook secret and your studio password. Enable test checkout and save.

When enabling checkout, the server first makes a read-only Razorpay API request to verify the credentials. Incorrect keys do not enable the payment option.

Keys are write-only in the panel. Secrets are encrypted in the private database using the server's `master.key`. They are not returned by the settings API, placed in localStorage or embedded in the website bundle. Do not use `VITE_` environment variables for payment secrets.

The integration uses Razorpay Standard Checkout. The server calculates the amount from known catalogue options, creates a Razorpay order, verifies the checkout signature against the stored Razorpay order ID, fetches the payment, and checks its amount, currency and captured status. An authorised / pending payment is not marked paid. Test payments are labelled **Test payment verified · No real money received**.

For unknown catalogue items, checkout saves a quote request and disables online payment until the studio sets the final total. Client-submitted prices and discount percentages are not charged. The existing WELCOME10 / BARAKAH15 codes and delivery calculations are applied server-side.

Add the webhook URL shown in the panel to Razorpay Dashboard with the same webhook secret. Subscribe to `payment.captured`, `payment.failed`, `payment.refunded` and `refund.processed`. The server checks the raw-body HMAC, deduplicates events and fetches the current payment state, including refunds. If the checkout callback is missed, **Recheck payment** on the tracking page can reconcile it. Webhook delivery needs a public URL; localhost cannot receive Razorpay webhooks directly.

After you test successful, failed, closed and retried checkout, switch to **Live Mode**, enter the matching Live Key ID and Secret, configure the live webhook and confirm the test-completion checkbox. Live checkout requires a public HTTPS origin and a webhook secret of at least 16 characters. Cancelling an order does not issue a refund; refunds are managed in Razorpay Dashboard and reflected by verification/webhooks.

Changing the payment account while an order has a pending gateway attempt does not create a second payment order. Verify the earlier attempt with the studio first. Amounts are locked once a gateway attempt exists or payment has been recorded.

## Publish the connected website

This is now a server-backed application. Uploading only `dist/` to static hosting will not provide orders, tracking or payment verification.

Use a Node 24 host (tested with 24.15) with a persistent private disk and a public HTTPS domain:

1. Run `npm run build`.
2. Configure environment values from `.env.example`, especially `PUBLIC_ORIGIN`, `DATA_DIR`, `PORT` and a long random `STUDIO_BOOTSTRAP_TOKEN` for first-time production setup.
3. Run `npm start`. The Node server serves both the built website and its API. By default it binds to 127.0.0.1 behind a TLS reverse proxy.
4. Allow API request bodies up to 8 MB. The reverse proxy must preserve the API paths and overwrite `X-Real-IP` with the actual client IP. Set `TRUST_PROXY=1` only for that trusted local proxy. Otherwise the server uses the connection IP for rate limiting.
5. Create the production studio login using its deployment setup code, or migrate the existing private database and matching encryption key securely. There is no public first-user takeover flow in production.
6. Set the real HTTPS origin, configure the production webhook and test the complete flow before enabling Live Mode.

Use a single running Node instance for this SQLite deployment. Horizontal replicas need a shared transactional database and coordination rather than separate local copies. HTTP API responses are not cached; keep `/api/` out of any CDN cache.

## Keep the data safe

The private `.studio-data/` folder contains `studio.sqlite` and `master.key`; it is excluded from source control and Vite file serving. Keep it outside public hosting roots. Protect the host and its backups. Keep the database and the **original matching master.key together**. The app refuses to create a replacement key for an existing database.

Back up with SQLite's online-backup mechanism, or stop the application before copying the entire private directory. A live database can have WAL sidecar files; copying only `studio.sqlite` during writes is not a reliable backup. Test restoration before accepting customer orders. The folder must survive host restarts and deployments.

## Verification

`npm run test:studio` checks real HTTP endpoints against temporary isolated data and a stub Razorpay API: authentication, order persistence, idempotency, server pricing, public/private fields, optimistic update conflicts, tracking, signature verification, captured/test/refund states, webhook deduplication and amount locking. It never transfers money or sends a customer message.

Official references: [Razorpay integration steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps), [Razorpay webhook validation](https://razorpay.com/docs/webhooks/validate-test).

## Search visibility and production pages

Keep `SITE_INDEXABLE=false` on staging and during launch checks. Once the final HTTPS domain and merchant policies are approved, set `SITE_INDEXABLE=true` and restart. The production server then publishes `/robots.txt` and `/sitemap.xml`, canonical page URLs and social title/description metadata. Studio, tracking and missing pages remain `noindex`; unknown products return HTTP 404. The development server is always marked noindex.

`npm run build` must run before production/static HTTP tests. `node --test server/tests/*.test.mjs` checks both order APIs and production page serving using isolated data.
