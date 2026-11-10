---
"@mitumba/sdk": minor
---

- Add `orders.getDocument(orderId)`. It returns an order's invoice or receipt as a PDF: `{ kind: 'invoice' | 'receipt', filename, blob }`. It reads `GET /orders/:id/document`, and errors with `document_not_found` (404) when the order has no document.
- Add `APIClient.getFile(path, params?, options?)`, a GET whose body is a file. It returns `{ blob, contentType, headers }`, with the same authentication, token refresh, retries and error decoding as every other request.
- New types: `OrderDocument`, `OrderDocumentKind` and `FileResponse`.
