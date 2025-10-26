import { useState } from "react"

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [fen, setFen] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError("")
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch("https://node-backend-8ubs.onrender.com/predict", {
        method: "POST",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Prediction failed")
      setFen(data.fen)
    } catch (err: any) {
      setError(err.message)
      setFen("")
    } finally {
      setLoading(false)
    }
  }

  function handleAnalyze() {
    if (!fen) return
    const encodedFEN = encodeURIComponent(fen.trim())
    window.open(`https://lichess.org/editor?fen=${encodedFEN}`, "_blank")
  }

  async function handleCopy() {
    if (!fen) return
    try {
      await navigator.clipboard.writeText(fen)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert("Failed to copy FEN.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-yellow-400">
          Online Chess Analysis
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mb-6 text-center">
          Upload a chessboard image to generate its FEN notation
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col sm:flex-row items-center gap-4"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-yellow-400 file:text-black
                       w-full sm:w-auto flex-1 text-sm bg-gray-700 text-gray-300 rounded-md px-2 py-2"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Get FEN"}
          </button>
        </form>

        {error && (
          <div className="mt-4 w-full bg-red-900/40 text-red-300 text-sm text-center rounded-md py-2">
            {error}
          </div>
        )}

        {fen && (
          <div className="mt-8 w-full bg-gray-700 rounded-xl p-4 sm:p-6 flex flex-col items-center">
            <h2 className="text-yellow-400 font-semibold mb-2 text-sm sm:text-base">
              FEN Output
            </h2>
            <p className="text-white text-xs sm:text-sm font-mono break-words mb-4 text-center">{fen}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
              <button
                onClick={handleCopy}
                className="px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 
             focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none active:outline-none transition"
              >
                {copied ? "Copied!" : "Copy FEN"}
              </button>

              <button
                onClick={handleAnalyze}
                className="px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 
             focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none active:outline-none transition"
              >
                Analyze on Lichess
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
