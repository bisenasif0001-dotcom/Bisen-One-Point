# AL-NOOR — live se pehle review

Reviewed: **5 November 2026**. Local website: **http://localhost:5173**.

**Decision: abhi public launch hold karein.** Main customer flows ka local build aur automated checks pass hain. Neeche diye gaye business/setup decisions aur deployed website ki final testing ke baad launch karein. Aapne confirm kiya hai ki domain/hosting abhi nahi liya hai; Razorpay account ka KYC approved hai.

| Priority | Abhi kya baaki hai | Launch se pehle kya karna hai |
|---|---|---|
| P0 | Domain aur hosting nahi hai | Final domain, HTTPS aur permanent private data storage wali Node hosting set karein. Tested runtime Node 24.15; package supported Node 24 version specify karta hai. Sirf `dist/` ko static hosting par upload karne se order, payment verification aur tracking APIs nahi chalengi. |
| P0 | Privacy, Terms, Returns aur Shipping links Contact par ja rahe hain | Asli policy pages publish karein. Cancellation/refund, personalised goods, damaged delivery, delivery charges/timing, photo retention/deletion aur customer support ke rules confirm karne hain. Merchant decisions ke bina policies invent nahi ki gayi hain. |
| P0 for online payments | Online payment abhi disabled hai | Studio panel mein Test Mode connect karein; actual hosted checkout success, failure, cancellation/retry aur webhook delivery check karein. Phir final HTTPS domain par Live Mode keys/webhook configure karke controlled real payment/refund verify karein. API secrets chat mein share na karein. |
| P1 | Product availability aur marketing copy ki final approval | Itra, gift sets, legacy greeting cards, materials, paper stock, foil/packaging claims aur product photographs approve karein. Kuch imagery illustrative stock photography hai. Jo items actual stock/service mein nahi hain, unhe launch se pehle revise ya unlist karein. |
| P1 | Price, delivery aur discount rules ki approval | Catalogue prices, ₹99 delivery, ₹999 item-subtotal free-delivery threshold, ₹149 express request aur WELCOME10/BARAKAH15 coupons currently coded hain. Inhe approve/revise karein; serviceable PIN codes, invoice/tax details aur express availability bhi settle karein. |
| P1 | Original print files ka handover | Server abhi previews/personalisation save karta hai. High-resolution originals customer ko studio ke saath separately share karne hain; checkout is baat ko batata hai. Manual handover process final karein, ya permanent private original-file upload add karein. Preview thumbnail se production print na banayein. |
| P1 | Backups aur operational readiness | Production database aur matching encryption key ka protected backup, restore test, process restart, HTTPS renewal aur availability monitoring set karein. Studio login ban chuka hai; owner ko order/status/payment update workflow rehearse karna hai. |

P0 = launch blocker. P1 = customer orders accept karne se pehle close karne wali operational/content items.

**Is review mein jo fix kiya gaya:**

- Pages, checkout aur search ab zaroorat par load hote hain. Initial main JavaScript **1,012.88 KB se 427.04 KB** hua, lagbhag **58% kam**; gzip **273.77 KB se 131.06 KB** hua. Ye build size comparison hai, live internet speed score nahi.
- Vite **8.3.2 → 8.3.6** security patch. Full installed-dependency audit ab **0 known vulnerabilities** dikhata hai. Initial audit ka report bhi evidence folder mein hai. [Vite security advisory](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw).
- Mobile photo-print preview par **138px unwanted offset** se blank space aur control overlap ho raha tha. Header offset ko sticky previews tak sahi tarah apply kiya; frame, print, birthday aur gallery previews ko 360/768/1440px par dobara check kiya.
- Search ab actual seven frame finishes/current catalogue kholta hai. Keyboard selection correct frame preselect karta hai. Search close karne par scroll/focus restore hota hai; keyboard focus dialog ke andar rehta hai.
- Invalid product/occasion URLs ab 404 hain. Purane valid frame links current customizer kholte hain. Fake review counts/testimonial block aur placeholder social profile link hata diye gaye hain.
- Itra listing/detail/server ek catalogue use karte hain. **25 listed size prices** server par verify hote hain. Gift sets apna actual set size dikhate hain; unavailable 3ml sample offer hata diya gaya.
- Bag ke hardcoded, incomplete gift add-ons ki jagah actual frame/photo/card builders ke links hain. Customer pehle apni photo/message/options configure karta hai.
- Damaged/corrupt browser cart data se storefront crash hone ki protection add ki. Cart quantity merge ab existing state ko mutate nahi karta.
- Contact form ke labels/mobile layout/phone validation refine kiye. WhatsApp handoff ka message sach batata hai; popup fail hone par dobara open karne ka link hai. Unconfirmed instant-response/insured-delivery/replacement promises primary touched areas se remove kiye.
- Page titles, canonical URLs, social title/description aur production search controls add kiye. Unknown routes ko HTTP 404, studio/tracking ko noindex, static assets ko caching/compression aur basic security headers milte hain. Staging default noindex hai. [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- Keyboard skip link aur ek main page landmark rakha; duplicate main landmarks remove kiye. Page load fail hone par recovery message/reload action hai.

**Verification evidence:**

| Check | Result / practical limit |
|---|---|
| Production build | Pass, Vite 8.3.6 |
| Feature validations | **15 / 15 pass**: frames, photo prints, birthday cards, Dua, Islamic art, gallery walls, PVC, printing, homepage, bag/tracking and new prelaunch regressions |
| Server tests | **5 / 5 groups pass**: authentication, persistence, privacy, authoritative pricing, payment signatures/captured/test/refund states, webhook deduplication, production HTTP serving and staging indexing |
| Public page render/asset/link audit | **81 pages**, no missing referenced local image assets, no invalid internal page links, no render errors in the checked initial states |
| Search/route destinations | **88** checked known destinations |
| Browser checks | Core pages at **360px and 390px mobile widths**, **1440px desktop**; four preview layouts additionally at **768px**. No horizontal page overflow in the measured states. Physical iPhone/Android and Safari checks remain pending. |
| Customer UI journey | Test birthday card configured → bag ₹199 + delivery ₹99 = ₹298 → checkout review. Razorpay correctly disabled. No order submitted, no money transferred; preview-only bag item removed. |
| Public access boundaries | Unauthenticated studio orders API **401**; private master key **403** in development. A temporary non-secret `.env.*` probe was denied **403** and removed. Production private-path tests return 404. Actual secrets were not read. |
| Owner/payment availability | Owner setup already complete; online payments off, Test Mode reported by public configuration. Owner credentials were not used or changed. |
| Dependency audit | **0** currently reported vulnerabilities, including development dependencies |
| Lint | Command passes; **115 existing warnings** remain, mainly unused code and older render/effect patterns. Cleanup is still recommended. |

Payment tests above use an isolated database and simulated Razorpay responses. Genuine customer orders were not changed. Real Razorpay checkout/webhook verification and public HTTPS checks remain pending. Razorpay's documented integration requires server-side order/signature verification; the deployed integration should be tested before enabling live payments. [Razorpay Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).

Evidence files are in `output/prelaunch-review/`: `check-results.json`, `server-tests.log`, `public-pages.json`, `summary.json`, `browser-checks.json`, `preview-layout-checks.json`, `dependency-audit.json`, `build.log`, `lint.log`, and screenshots. The corrected mobile print preview is `mobile-photo-prints.png`.

**Further improvements after the blocking items:**

- Some original frame detail photos are around 2–2.7 MB each. Optimise their delivery without changing the real frame/aperture geometry; test on a slow mobile connection after deployment.
- Add a branded favicon and approved social-share image. Route metadata is in place; final domain/search indexing and share thumbnails still need deployed verification.
- Replace remaining illustrative product photography and confirm older card/gift/Asma product options. Some custom/legacy items intentionally become a studio quote until the final amount is confirmed.
- Complete a production backup restore drill, owner account recovery plan, and a private code/version backup. Load testing and a fuller accessibility/security review have not been completed by these checks.

**Practical launch sequence:**

1. Approve policies, real products/prices, delivery/coupons and original-photo handover.
2. Buy/connect domain and suitable Node hosting with a persistent private disk; deploy with HTTPS and `SITE_INDEXABLE=false`.
3. Follow `docs/STUDIO_SETUP.md`: set final origin, private data directory, owner access, protected backups and Razorpay Test Mode/webhook.
4. Rehearse an order on a second device: create request, open private tracking, change status in studio, confirm update appears, add courier details, and check payment success/failure/retry/refund.
5. Verify physical mobile devices, public URLs/deep links, customer support links and order retention after a server restart. Enable Live Mode only after payment checks pass.
6. Set `SITE_INDEXABLE=true` for the approved public domain, restart and verify `/robots.txt` and `/sitemap.xml`. Keep studio/tracking private. Launch with monitoring active.
