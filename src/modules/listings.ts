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
  RequestOptions,
} from '../types'

export class ListingsModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Browse the marketplace feed with optional filters.
   */
  async getFeed(params?: ListingsFeedParams, options?: RequestOptions): Promise<PaginatedResponse<Listing>> {
    // APIClient handles converting params to string|number|boolean properly
    return this.client.get<PaginatedResponse<Listing>>(
      '/listings/feed', 
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * Get full details of a single listing, including its images.
   */
  async getById(id: string, options?: RequestOptions): Promise<Listing> {
    return this.client.get<Listing>(`/listings/${id}`, undefined, options)
  }

  /**
   * Create a new listing (requires seller role).
   */
  async create(input: CreateListingInput, options?: RequestOptions): Promise<Listing> {
    return this.client.post<Listing>('/listings', input, options)
  }

  /**
   * Update an existing listing.
   */
  async update(id: string, input: UpdateListingInput, options?: RequestOptions): Promise<Listing> {
    return this.client.put<Listing>(`/listings/${id}`, input, options)
  }

  /**
   * Change the status of a listing.
   */
  async updateStatus(id: string, status: ListingStatus, options?: RequestOptions): Promise<Listing> {
    return this.client.patch<Listing>(`/listings/${id}/status`, { status }, options)
  }

  /**
   * Soft delete a listing (sets status to 'removed').
   */
  async delete(id: string, options?: RequestOptions): Promise<{ ok: boolean }> {
    return this.client.delete<{ ok: boolean }>(`/listings/${id}`, options)
  }

  /**
   * Get a seller's public storefront.
   */
  async getSellerStorefront(
    sellerId: string,
    params?: { page?: number; page_size?: number },
    options?: RequestOptions
  ): Promise<SellerStorefront> {
    return this.client.get<SellerStorefront>(
      `/listings/seller/${sellerId}`, 
      params as unknown as Record<string, string | number | boolean | undefined>,
      options
    )
  }

  /**
   * List all supported categories.
   */
  async getCategories(options?: RequestOptions): Promise<Category[]> {
    return this.client.get<Category[]>('/listings/categories', undefined, options)
  }

  /**
   * List all supported cities.
   */
  async getCities(options?: RequestOptions): Promise<City[]> {
    return this.client.get<City[]>('/listings/cities', undefined, options)
  }

  /**
   * Get a presigned upload URL for a listing image.
   * Index should be between 0 and 9.
   */
  async presignImage(listingId: string, index: number, options?: RequestOptions): Promise<PresignImageResponse> {
    return this.client.post<PresignImageResponse>(`/listings/${listingId}/images/presign`, { index }, options)
  }
}
