---
"@mitumba/sdk": minor
---

`sdk.documents` uploads and reads private documents: `upload({ file, purpose, subjectId })` returns a `PrivateDocument` with an id (`doc_…`), and `get(documentId)` returns the file. `sdk.admin.getDocument(documentId)` reads one as an operator. `isDocumentId(value)` tells a document id from a URL. `RaiseDisputeInput` and `RespondDisputeInput` gain `evidence_documents`; `SaveWholesaleStoreInput` and `AdminWholesalePendingStore` gain `verification_photos`. New types: `DocumentPurpose`, `UploadDocumentInput`, `PrivateDocument`, and the `DOCUMENT_PURPOSES` constant.
