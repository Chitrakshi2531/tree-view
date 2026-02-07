
"use client"

import React, { useState } from 'react';
import { TreeNode } from '@/types/tree';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OrgNodeProps {
  node: TreeNode;
  onAdd: (parentId: string, name: string) => void;
  deleteNode: (nodeId: string) => void;
  isLast?: boolean;
}

export const OrgNode: React.FC<OrgNodeProps> = ({ node, onAdd, deleteNode, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: node.id,
    disabled: node.depth === 0 // Root node is not draggable
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleAdd = () => {
    if (newName) {
      onAdd(node.id, newName);
      setNewName('');
      setIsAddDialogOpen(false);
      setIsExpanded(true);
    }
  };

  const handleDeleteConfirm = () => {
    deleteNode(node.id);
    setIsDeleteDialogOpen(false);
  };

  const isPrimary = node.depth === 0;
  const isAccent = node.depth > 1;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "node-container ml-8 py-2 first:mt-0 last:mb-0 transition-opacity",
        isDragging && "opacity-30 pointer-events-none"
      )}
    >
      {/* Visual connectors */}
      {node.depth > 0 && <div className="dashed-line-v" />}
      {node.depth > 0 && <div className="dashed-line-h" />}

      <div className="flex items-center gap-4 tree-node-enter group">
        <Card className={cn(
          "w-72 shadow-md transition-all duration-300 border-2",
          isOver && !isDragging && "border-primary border-dashed bg-primary/5",
          !isOver && (isPrimary ? "bg-primary/20 border-primary" : (isAccent ? "bg-accent/20 border-accent" : "bg-white border-muted")),
          "hover:shadow-lg"
        )}>
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {node.depth > 0 && (
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="text-base font-semibold text-foreground truncate">
                {node.name}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/30"
                onClick={(e) => { e.stopPropagation(); setIsAddDialogOpen(true); }}
                title="Add direct report"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {node.depth > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
                  title="Remove person"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {node.children.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Rendering */}
      {isExpanded && node.children.length > 0 && (
        <div className="flex flex-col">
          <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {node.children.map((child, index) => (
              <OrgNode 
                key={child.id} 
                node={child} 
                onAdd={onAdd} 
                deleteNode={deleteNode}
                isLast={index === node.children.length - 1}
              />
            ))}
          </SortableContext>
        </div>
      )}

      {/* Add Person Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Direct Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Person Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Jane Doe" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Person</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{node.name}</strong> and all their direct reports from the hierarchy. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
