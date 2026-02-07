"use client"

import React, { useState, useEffect } from 'react';
import { useTreeData } from '@/hooks/use-tree-data';
import { OrgNode } from '@/components/tree/org-node';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Share2, Download } from 'lucide-react';

export default function Home() {
  const { tree, addNode, deleteNode, resetTree } = useTreeData();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading Organization Hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body p-8 sm:p-12 lg:p-20">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-headline">
            OrgView
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and visualize your organization's hierarchy with ease.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={resetTree} className="gap-2 text-muted-foreground hover:text-foreground">
            <RefreshCcw className="h-4 w-4" />
            Reset Tree
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
            <Share2 className="h-4 w-4" />
            Share View
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="overflow-x-auto pb-20">
          <div className="inline-block min-w-full">
            <OrgNode 
              node={tree} 
              onAdd={addNode} 
              deleteNode={deleteNode}
              isLast={true}
            />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-md border-t p-4 text-center">
        <p className="text-xs text-muted-foreground">
          OrgView &copy; {currentYear || '2025'} — Changes are automatically saved to your browser.
        </p>
      </footer>
    </div>
  );
}