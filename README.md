# AL-NOOR Studio

Order panel: `/studio`. Customer tracking: `/track-order`.

Run `npm run dev` locally. For production, build with `npm run build` and run the Node server with `npm start`. The connected order/payment API requires persistent private storage; static hosting alone is insufficient.

See [Studio setup and Razorpay guide](docs/STUDIO_SETUP.md) for first-time access, payment keys, webhooks, deployment and backup requirements. Run `npm run test:studio` to validate the order/payment service without making real payments.

## Frontend foundation

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
