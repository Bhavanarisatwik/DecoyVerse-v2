import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const pathNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'nodes': 'Nodes',
    'decoys': 'Decoys',
    'honeytokens': 'Honeytokens',
    'logs': 'Logs',
    'alerts': 'Alerts',
    'ai-insights': 'AI Insights',
    'grafana': 'Grafana',
    'settings': 'Settings',
    'configuration': 'Configuration',
}

export function Breadcrumb() {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center gap-2 text-sm mb-6">
            <Link 
                to="/dashboard" 
                className="flex items-center gap-1 text-themed-muted hover:text-themed-primary transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            
            {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;
                const name = pathNames[segment] || segment;

                return (
                    <div key={path} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-themed-dimmed" />
                        {isLast ? (
                            <span className="text-themed-primary font-medium">{name}</span>
                        ) : (
                            <Link 
                                to={path}
                                className="text-themed-muted hover:text-themed-primary transition-colors"
                            >
                                {name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    )
}
