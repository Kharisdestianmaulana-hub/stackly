import * as React from 'react';
import { Search, Moon, Minus, Square, X } from 'lucide-react';

export function TopBar() {
  const handleMinimize = () => window.stackly?.window.minimize();
  const handleMaximize = () => window.stackly?.window.maximize();
  const handleClose = () => window.stackly?.window.close();

  return (
    <header className="h-[64px] bg-topbar border-b border-border-soft flex items-center justify-between px-6 select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search (Ctrl + K)" 
            className="h-10 w-64 bg-input border border-border-soft rounded-sm pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-colors placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-sm hover:bg-card-elevated">
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
