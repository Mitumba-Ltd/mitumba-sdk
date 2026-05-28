import { APIClient } from '../client'
import type {
  Category,
  City,
  CreateListingInput,
  Listing,
  ListingStatus,
  ListingsFeedParams,
  PaginatedResponse,
  PresignImageResponse,
  SellerStorefront,
  UpdateListingInput,
} from '../types'

export class ListingsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Browse the marketplace feed with optional filters.
   */
  async getFeed(params?: ListingsFeedParams): Promise<PaginatedResponse<Listing>> {
    // APIClient handles converting params to string|number|boolean properly
    return this.client.get<PaginatedResponse<Listing>>('/listings/feed', params as unknown as Record<string, string | number | boolean | undefined>)
  }

  /**
   * Get full details of a single listing, including its images.
   */
  async getById(id: string): Promise<Listing> {
    return this.client.get<Listing>(`/listings/${id}`)
  }

  /**
   * Create a new listing (requires seller role).
   */
  async create(input: CreateListingInput): Promise<Listing> {
    return this.client.post<Listing>('/listings', input)
  }

  /**
   * Update an existing listing.
   */
  async update(id: string, input: UpdateListingInput): Promise<Listing> {
    return this.client.put<Listing>(`/listings/${id}`, input)
  }

  /**
   * Change the status of a listing.
   */
  async updateStatus(id: string, status: ListingStatus): Promise<Listing> {
    return this.client.patch<Listing>(`/listings/${id}/status`, { status })
  }

  /**
   * Soft delete a listing (sets status to 'removed').
   */
  async delete(id: string): Promise<{ ok: boolean }> {
    return this.client.delete<{ ok: boolean }>(`/listings/${id}`)
  }

  /**
   * Get a seller's public storefront.
   */
  async getSellerStorefront(
    sellerId: string,
    params?: { page?: number; page_size?: number }
  ): Promise<SellerStorefront> {
    return this.client.get<SellerStorefront>(`/listings/seller/${sellerId}`, params as unknown as Record<string, string | number | boolean | undefined>)
  }

  /**
   * List all supported categories.
   */
  async getCategories(): Promise<Category[]> {
    return this.client.get<Category[]>('/listings/categories')
  }

  /**
   * List all supported cities.
   */
  async getCities(): Promise<City[]> {
    return this.client.get<City[]>('/listings/cities')
  }

  /**
   * Get a presigned upload URL for a listing image.
   * Index should be between 0 and 9.
   */
  async presignImage(listingId: string, index: number): Promise<PresignImageResponse> {
    return this.client.post<PresignImageResponse>(`/listings/${listingId}/images/presign`, { index })
  }
}
