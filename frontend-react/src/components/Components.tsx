
export type Game = {
  id: number
  title: string
  fen: string
}

type GamesDisplayProps = {
  games: Game[];              
  setFen: (fen: string) => void;  
};

export const GamesDisplay = ({ games, setFen} : GamesDisplayProps) => {
    return (
        <ul>
            {games.map((g) => (
                <li
                    key={g.id}
                    onClick={() => setFen(g.fen)}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700"
                >
                    <p className="text-yellow-300 font-semibold">{g.title}</p>
                    <p className="text-xs text-gray-400 break-words">{g.fen}</p>
                </li>
            ))}
        </ul>
    )
}
