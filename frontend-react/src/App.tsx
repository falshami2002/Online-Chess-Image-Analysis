import { useState, useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import { GamesDisplay } from "./components/Components"
import type { Game } from "./components/Components"
import { AuthModals } from "./components/AuthComponents"
import { ToastContainer, toast } from 'react-toastify';

export default function App() {
  const [view, setView] = useState<"list" | "upload">("list")
  const [games, setGames] = useState<Game[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [fen, setFen] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  
  const { isAuthed, loading: _authLoading, saveGame, getGames } = useAuth();

  const needSignUp = () => toast("Please sign up or log in to save games!");

  // Load games when authed
  useEffect(() => {
    (async () => {
      if (!isAuthed) {
        setGames([]);
        return;
      }
      try {
        const list = await getGames(); 
        const mapped: Game[] = list.map((g: any, i: number) => ({
          id: g._id ?? String(i),
          title: g.title,
          fen: g.fen,
        }));
        setGames(mapped);
      } catch (e: any) {
        toast(e.message || "Failed to load games");
      }
    })();
  }, [isAuthed]);

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

  function handleAnalyze() {
    if (!fen) return
    const encodedFEN = encodeURIComponent(fen.trim())
    window.open(`https://lichess.org/editor?fen=${encodedFEN}`, "_blank")
  }

  async function handleSaveGame() {
    if (!fen) return;
    if (!isAuthed) return needSignUp();

    const title = `Game ${games.length + 1}`;
    try {
      const saved = await saveGame(fen, title); 
      const newItem: Game = { id: saved._id ?? String(games.length + 1), title: saved.title, fen: saved.fen };
      setGames((prev) => [newItem, ...prev]);
      setFen("");
      setFile(null);
      setView("list");
      toast("Position saved!");
    } catch (e: any) {
      toast(e.message || "Failed to save game");
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="flex items-center justify-center px-4 py-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-yellow-400 p-0 m-0">Games</h1> <button
            onClick={() => setView("upload")}
            className="bg-yellow-400 text-black rounded-full mx-4 mt-2 w-8 h-8 flex items-center justify-center font-bold hover:bg-yellow-300"
          >
            +
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isAuthed ? games.length === 0 ? (
            <p className="text-gray-400 text-center mt-6">No games yet</p>
          ) : (<GamesDisplay games={games} setFen={setFen} />) : <AuthModals />}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {view === "upload" ? (
          <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-yellow-400">
              Upload New Game
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
                <p className="text-white text-xs sm:text-sm font-mono break-words mb-4 text-center">
                  {fen}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                  <button
                    onClick={handleCopy}
                    className="px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 
                 focus:outline-none transition"
                  >
                    {copied ? "Copied!" : "Copy FEN"}
                  </button>

                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-2 bg-blue-500 text-black font-semibold rounded-lg hover:bg-blue-400 
                 focus:outline-none transition"
                  >
                    Analyze on Lichess
                  </button>

                  {isAuthed ? <button
                    onClick={handleSaveGame}
                    className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition"
                  >
                    Save Game
                  </button> : 
                  <button
                    onClick={needSignUp}
                    className="px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition"
                  >
                    Save Game
                  </button>}
                  <ToastContainer/>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl text-yellow-400 font-bold mb-3">Welcome to Online Chess Analysis</h1>
            <p className="text-gray-400">Select a game from the left or click “+” to add a new one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
