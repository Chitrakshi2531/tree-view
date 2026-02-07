
"use client"

import React, { useState, useEffect } from 'react';
import { useTreeData } from '@/hooks/use-tree-data';
import { OrgNode } from '@/components/tree/org-node';
import { UnassignedMember } from '@/components/tree/unassigned-member';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Share2, Download, Users, UserPlus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function Home() {
  const { tree, unassigned, addNode, deleteNode, moveNode, resetTree } = useTreeData();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      moveNode(active.id.toString(), over.id.toString());
    }
  };

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading Organization Hierarchy...</p>
      </div>
    );
  }

  const activePerson = activeId 
    ? unassigned.find(p => p.id === activeId) || { name: 'Moving...' }
    : null;

  return (
    <SidebarProvider>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <Users className="h-6 w-6" />
              OrgView
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Talent Pool
                </span>
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unassigned.length}
                </span>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <p className="text-[11px] text-muted-foreground mb-4 px-2 italic">
                  Drag people from here into the hierarchy to assign them.
                </p>
                {unassigned.map((person) => (
                  <UnassignedMember key={person.id} id={person.id} name={person.name} />
                ))}
                {unassigned.length === 0 && (
                  <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">All members assigned!</p>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-background">
          <div className="min-h-screen font-body p-8 sm:p-12 lg:p-16">
            <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-headline">
                  Organization Tree
                </h1>
                <p className="text-lg text-muted-foreground">
                  Visualizing {tree.name}'s Reporting Structure
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={resetTree} className="gap-2 text-muted-foreground hover:text-foreground">
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80">
                  <Share2 className="h-4 w-4" />
                  Share
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

            <footer className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-md border-t p-4 text-center ml-[var(--sidebar-width)] transition-[margin] duration-200">
              <p className="text-xs text-muted-foreground">
                OrgView &copy; {currentYear || '2025'} — Manage your team structure effortlessly.
              </p>
            </footer>
          </div>
        </SidebarInset>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="w-64 p-3 bg-white border-2 border-primary rounded-lg shadow-2xl cursor-grabbing flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-foreground truncate">
                {activePerson?.name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </SidebarProvider>
  );
}
