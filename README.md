# Lien Forms Application

A modern, mobile-friendly web application for creating and managing mechanic's liens and lien releases. Built with React and Material-UI.

## Features

- Mechanic's Lien Form with all required fields
- Release of Lien Form
- Mobile-responsive design
- Conditional logic for individual/company information
- Form validation
- Clean, professional UI
- Shareable links and saved drafts (see below)

## Shareable links and external prefill

The three form pages can load data from the URL and save drafts in the browser (`localStorage`). Users can copy a **shareable link** from the **Copy shareable link** button (full state is stored in the URL hash `#d=…`, so it is not sent to the server when loading the page).

The same information is published on the site at [`prefill-urls.html`](prefill-urls.html).

**Privacy:** Query strings may appear in server logs and the `Referer` header. The hash payload stays in the browser unless you share the full URL; treat shared links like sensitive documents.

### Shallow prefill (query string)

Append parameters using the exact `name` attribute of each field, for example:

`https://<host>/demand-letter.html?client-name=Jane%20Doe&invoice-number=INV-001`

Only parameters that match a field on that page are applied. If both query parameters and `#d=` are present, query values are applied first, then the hash object (hash wins on duplicate keys).

### Full state (hash)

`https://<host>/<page>.html#d=<base64url(JSON)>`

The JSON object is UTF-8 encoded, then base64url-encoded (no `+`, `/`, or padding in the URL). Values use the same shapes as in the form: strings for text fields, booleans for checkboxes.

### Field names by page

**[`demand-letter.html`](demand-letter.html)** — `business-name`, `sender-name`, `business-address`, `business-city`, `business-state`, `business-zip`, `business-phone`, `business-email`, `client-name`, `client-address`, `client-city`, `client-state`, `client-zip`, `invoice-number`, `invoice-date`, `due-date`, `payment-deadline`, `service-description`, `service-dates`, `completion-date`, `invoice-total`, `payments-received`, `outstanding-balance`, `include-late-fees`, `include-notarial`, `payment-method`

**[`mechanics-lien.html`](mechanics-lien.html)** — `claimant-name`, `company-name`, `claimant-address`, `claimant-city`, `claimant-state`, `claimant-zip`, `owner-name`, `owner-address`, `owner-city`, `owner-state`, `owner-zip`, `property-address`, `property-city`, `property-state`, `property-zip`, `property-county`, `legal-description`, `work-description`, `work-start`, `work-end`, `unpaid-amount`, `customer-name`, `notice-date`, `contractor-name`, `contractor-address`, `contractor-city`, `contractor-state`, `contractor-zip`

**[`release-lien.html`](release-lien.html)** — `lien-reference`, `payment-date`, `claimant-name`, `company-name`, `claimant-address`, `claimant-city`, `claimant-state`, `claimant-zip`, `filing-date`, `property-description`, `owner-name`, `property-county`, `property-address`, `property-city`, `property-state`, `property-zip`

### Draft storage

Drafts are keyed as `lienToolingDraft:<form-id>` in `localStorage` (`demand-letter`, `mechanics-lien`, `release-lien`). If the URL includes any recognized query field or a non-empty `#d=` payload, the draft is not restored (the link takes precedence).

## Development

To run the development server:

```bash
npm install
npm start
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch:

```bash
npm run deploy
```

## Built With

- React
- Material-UI
- React Hook Form
- React Router
