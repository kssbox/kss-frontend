/** A single document reference returned from the backend finish event */
export interface DocReference {
  /** Data ID (file_data_id or web_data_id) */
  dataId?: string
  /** Data type: 1=webdata, 2=filedata, 3=online_search */
  dataType?: number
  /** Display name of the data source */
  dataName?: string
  /** URL for online search results (dataType===3) */
  url?: string
  /** Position ID of the document (citation number) */
  docPositionId?: number
  /** Map of chunk_id -> chunk content */
  chunkData?: Record<string, string>
}

/** Parsed citation found in text content */
export interface ParsedCitation {
  /** Full match string, e.g. 【ID: 1<abc>】 */
  fullMatch: string
  /** doc_position_id (citation number) */
  docPositionId: number
  /** chunk_id within the document */
  chunkId: string
}
