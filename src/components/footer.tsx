import { Github } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 py-12 md:h-32 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by{" "}
                        <Link
                            href="https://x.com/draculapresley"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:text-blue-400 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(96,165,250,1)]"
                        >
                            Dracula Presley
                        </Link>
                        .{" "}
                        <Link
                            href="https://t.me/GMSONICBREAKFASTCLUB"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:text-blue-400 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(96,165,250,1)]"
                        >
                            Join the Rope Haus
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://www.youtube.com/watch?v=tYzMYcUty6s"
                        target="_blank"
                        rel="noreferrer"
                        className="transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(96,165,250,1)]"
                    >
                        <Github className="h-5 w-5 text-muted-foreground hover:text-blue-400 hover:scale-110 transition-all duration-300" />
                    </Link>
                </div>
            </div>
        </footer>
    )
}
