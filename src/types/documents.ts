/** What a private document is for. Each purpose belongs to one kind of subject. */
export const DOCUMENT_PURPOSES = ['dispute_evidence', 'identity_document', 'wholesale_verification'] as const
export type DocumentPurpose = typeof DOCUMENT_PURPOSES[number]

/**
 * Uploading a private document.
 *
 * - `dispute_evidence`: `subjectId` is the order id; photos only.
 * - `identity_document`: `subjectId` is the retail store id; a photo or a PDF.
 * - `wholesale_verification`: `subjectId` is the wholesale store id; photos only.
 *
 * Photos (JPEG, PNG, WebP, HEIC) are stored re-encoded as WebP. Up to 10 MB.
 */
export interface UploadDocumentInput {
  file: Blob
  purpose: DocumentPurpose
  subjectId: string
}

/** A stored private document. It is read with `documents.get`; it has no public URL. */
export interface PrivateDocument {
  /** `doc_…`. Pass it where a document is referred to by id. */
  id: string
  purpose: DocumentPurpose
  content_type: 'image/webp' | 'application/pdf'
  size_bytes: number
  created_at: string
}
