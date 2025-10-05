// Calculate reading time based on words, assuming 200 words/min
module.exports = function calculateReadingTime(text) {
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}
