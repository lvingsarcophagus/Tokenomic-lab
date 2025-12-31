import type { TokenData } from '@/lib/types/token-data'

const GOPLUS_CACHE = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Try fetching GoPlus token security data with caching and retries. Falls back to null.
 */
export async function tryGoPlusWithFallback(
  tokenAddress: string,
  chainId: string,
  maxRetries: number = 2
): Promise<any | null> {
  const cacheKey = `${chainId}:${tokenAddress.toLowerCase()}`

  // Check cache first
  const cached = GOPLUS_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[GoPlus] Cache hit')
    return cached.data
  }

  // Attempt fetching with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(
        `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`,
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      // Handle rate limiting
      if (response.status === 429) {
        console.warn(`[GoPlus] Rate limited, attempt ${attempt + 1}/${maxRetries}`)
        await sleep(1000 * Math.pow(2, attempt))
        continue
      }

      if (!response.ok) {
        console.warn(`[GoPlus] HTTP ${response.status}, attempt ${attempt + 1}/${maxRetries}`)
        continue
      }

      const json = await response.json()
      const lower = tokenAddress.toLowerCase()
      const data = json.result?.[lower]

      if (!data) {
        console.warn('[GoPlus] No data in response')
        continue
      }

      // Cache the RAW GoPlus data (wrapped in token address key)
      const rawData = { [lower]: data }
      
      console.log(`[GoPlus] Raw data for ${tokenAddress}: holder_count=${data.holder_count}, owner_address=${data.owner_address}`)

      GOPLUS_CACHE.set(cacheKey, { data: rawData, timestamp: Date.now() })
      console.log('[GoPlus] Success - RAW data cached with holder_count')
      return rawData
    } catch (error: any) {
      console.error(`[GoPlus] Attempt ${attempt + 1} failed:`, error?.message || String(error))
      if (attempt < maxRetries - 1) {
        await sleep(500 * Math.pow(2, attempt))
      }
    }
  }

  // All attempts failed
  console.warn('[GoPlus] All attempts failed - using fallback scoring')
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}


