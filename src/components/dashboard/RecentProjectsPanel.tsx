import * as React from 'react';
import { Card } from '../ui/Card';
import { Folder, MoreVertical } from 'lucide-react';

export function RecentProjectsPanel() {
  const [projects, setProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (!window.stackly) return;
      try {
        const fetched = await window.stackly.projects.list();
        // Sort by modifiedAt descending and take top 5
        const sorted = fetched.sort((a: any, b: any) => b.modifiedAt - a.modifiedAt).slice(0, 5);
        setProjects(sorted);
      } catch (err) {
        console.error("Failed to load recent projects:", err);
      }
    };
    
    fetchProjects();
    // Also set an interval to refresh
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 24 hours ago
    if (diff < 86400000 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }
    
    // Otherwise Month Day
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 pb-2 border-b border-border-soft flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-sm">Recent Projects</h3>
        <button className="text-xs font-medium text-text-muted hover:text-electric-blue transition-colors">
          View all
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {projects.length === 0 && (
             <div className="text-center p-4 text-text-muted text-sm">No recent projects</div>
          )}
          {projects.map((project, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-md hover:bg-card-elevated group transition-colors cursor-pointer" onClick={() => window.stackly?.browser.openProject(project.name)}>
              <div className="flex items-center space-x-3 overflow-hidden">
                <Folder className="w-4 h-4 text-text-muted group-hover:text-primary-blue transition-colors shrink-0" />
                <span className="text-sm text-text-primary font-medium truncate">{project.name}</span>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs text-text-muted">{formatTime(project.modifiedAt)}</span>
                <button 
                  className="text-text-muted hover:text-text-primary p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.stackly?.projects.openEditor(project.name);
                  }}
                  title="Open in VS Code"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
