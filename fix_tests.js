const fs = require('fs')
const path = require('path')

const files = [
  'auth.test.ts',
  'listings.test.ts',
  'orders.test.ts',
  'pay.test.ts',
  'search.test.ts',
  'vazi.test.ts'
]

for (const file of files) {
  const filePath = path.join(__dirname, 'src/modules', file)
  let content = fs.readFileSync(filePath, 'utf8')
  
  // replace expect(apiClient.get).toHaveBeenCalledWith('/path', arg) -> expect(apiClient.get).toHaveBeenCalledWith('/path', arg, undefined)
  // replace expect(apiClient.get).toHaveBeenCalledWith('/path') -> expect(apiClient.get).toHaveBeenCalledWith('/path', undefined, undefined)
  // wait, get takes path, params, options. post takes path, body, options.
  
  // a simpler approach: mock APIClient so we don't worry about arguments exactly, or just append undefined
  
  content = content.replace(/expect\(apiClient\.([a-z]+)\)\.toHaveBeenCalledWith\(([^)]+)\)/g, (match, method, args) => {
    // If it has 1 arg: '/path' -> '/path', undefined, undefined
    // If it has 2 args: '/path', params -> '/path', params, undefined
    const argsSplit = args.split(',').map(s => s.trim())
    if (argsSplit.length === 1) {
      return `expect(apiClient.${method}).toHaveBeenCalledWith(${args}, undefined, undefined)`
    } else if (argsSplit.length === 2) {
      return `expect(apiClient.${method}).toHaveBeenCalledWith(${args}, undefined)`
    }
    return match
  })
  
  fs.writeFileSync(filePath, content)
}
console.log('Fixed tests')
