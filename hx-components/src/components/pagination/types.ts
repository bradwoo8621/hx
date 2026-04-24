/**
 * Pagination data structure that holds pagination state information
 */
export interface HxPaginationData {
	/** Number of items per page */
	pageSize?: number;
	/** Current active page number (1-based indexing) */
	pageNumber: number;
	/** Total number of available pages */
	totalPages?: number;
	/** Total number of items across all pages */
	totalItems?: number;
}
