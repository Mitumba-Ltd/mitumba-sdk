import { MitumbaClient } from '../src'

async function runPlayground() {
  // 1. Initialize client with debug and retries enabled
  const client = new MitumbaClient({
    baseUrl: 'https://api.mitumba.stanl.ink',
    debug: true,       // Logs all HTTP requests and latency
    maxRetries: 3      // Retries 5xx errors up to 3 times with exponential backoff
  })

  // 2. Demonstration: Aborting a request
  console.log('\n--- Request Cancellation Example ---')
  const controller = new AbortController()
  
  // Start a fetch request but immediately abort it
  const fetchPromise = client.search.search(
    { q: 'vintage shoes' }, 
    { signal: controller.signal }
  )
  
  controller.abort() // Trigger cancellation
  
  try {
    await fetchPromise
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('✅ Request successfully aborted via AbortSignal!')
    } else {
      console.error('Unexpected error:', error)
    }
  }

  // 3. Demonstration: Fetching real data
  console.log('\n--- Normal Fetch Example ---')
  try {
    // Because debug: true is set, you will see "[Mitumba SDK] GET ..." logs in your console
    const trending = await client.search.getTrending()
    console.log('Trending terms:', trending.terms.map(t => t.term).join(', '))
  } catch (error) {
    console.error('Failed to fetch trending terms:', error)
  }
}

// Execute the playground
runPlayground()
