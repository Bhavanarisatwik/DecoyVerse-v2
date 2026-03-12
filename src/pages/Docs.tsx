import { ExternalLink, BookOpen } from "lucide-react"
import { Button } from "../components/common/Button"
import { Breadcrumb } from "../components/common/Breadcrumb"

const DOCS_URL = "https://decoyverse-docs.vercel.app/"

export default function Docs() {
    return (
        <div className="flex flex-col h-full space-y-4">
            <Breadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-themed-primary font-heading flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-accent" />
                        Documentation
                    </h1>
                    <p className="text-themed-muted">Full platform guide — setup, agents, decoys, and API reference.</p>
                </div>
                <Button
                    variant="outline"
                    className="border-themed rounded-xl hover:bg-themed-elevated"
                    onClick={() => window.open(DOCS_URL, "_blank", "noopener,noreferrer")}
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                </Button>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[600px]">
                <iframe
                    src={DOCS_URL}
                    title="DecoyVerse Documentation"
                    className="w-full h-full"
                    style={{ minHeight: "600px" }}
                    allow="fullscreen"
                />
            </div>
        </div>
    )
}
