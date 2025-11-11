export type Game = {
    id: number
    title: string
    fen: string
}

type GamesDisplayProps = {
    games: Game[]
    setFen: (fen: string) => void
    onDelete?: (id: number) => void
}

export const GamesDisplay = ({ games, setFen, onDelete }: GamesDisplayProps) => {
    return (
        <ul>
            {games.map((g) => (
                <li
                    key={g.id}
                    onClick={() => setFen(g.fen)}
                    className="relative px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700"
                >
                    {onDelete && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onDelete(g.id); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete(g.id);
                                }
                            }}
                            className="absolute right-1 top-1 text-gray-500 hover:text-red-400 text-[20px] leading-none select-none
               w-3 h-3 flex items-center justify-center cursor-pointer
               bg-transparent p-0 m-0"
                            style={{ background: "transparent", boxShadow: "none" }}
                            title="Delete"
                        >
                            ×
                        </span>
                    )}

                    <p className="text-yellow-300 font-semibold">{g.title}</p>
                    <p className="text-xs text-gray-400 break-words">{g.fen}</p>
                </li>
            ))}
        </ul>
    )
}
