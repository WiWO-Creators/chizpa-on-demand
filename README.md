# Chizpa.com

Catálogo on-demand con SMARTactics y pago por Stripe. Pensado para publicarse en Vercel.

## Vercel

1. Importa `WiWO-Creators/chizpa-on-demand`.
2. Preset: **Next.js**. Build: `next build`. Output: default (`.next`).
3. Variables de entorno:

| Key | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `rk_test_…` o `sk_test_…` (live: `sk_live_…`) |
| `XAI_API_KEY` | clave de xAI para SMARTactics |
| `APP_BASE_URL` | URL pública, ej. `https://chizpa.vercel.app` |

Opcional: `STRIPE_WEBHOOK_SECRET` cuando conectes el webhook a `/api/webhooks/stripe`.

Tarjeta de prueba: `ACCT-000015`, fecha futura, cualquier CVC.
