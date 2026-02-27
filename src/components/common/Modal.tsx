import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"


interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const Modal = ({ isOpen, onClose, title, description, children, className }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={cn("relative w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]", className)}>
                {/* ── Fixed header ── */}
                <div className="flex-shrink-0 px-6 pt-6 pb-0">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-black-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-700"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                            <span className="sr-only">Close</span>
                        </button>
                    )}
                    {(title || description) && (
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                            {title && <h2 className="text-lg font-semibold leading-none tracking-tight text-white">{title}</h2>}
                            {description && <p className="text-sm text-gray-400">{description}</p>}
                        </div>
                    )}
                </div>
                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export { Modal }
