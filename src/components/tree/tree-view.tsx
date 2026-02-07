"use client"

import React, { useState, useRef, useEffect } from 'react';
import { TreeNode } from '@/types/tree';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronDown, Trash2, GripVertical, Pencil, Loader2 } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TreeViewProps {
  node: TreeNode;
  onAdd: (parentId: string, name: string) => void;
  updateNodeName: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  loadChildren?: (nodeId: string) => Promise<void>;
  loadingNodes?: Set<string>;
  isLast?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({ 
  node, 
  onAdd, 
  updateNodeName, 
  deleteNode, 
  loadChildren, 
  loadingNodes,
  isLast 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [editedName, setEditedName] = useState(node.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  const children = node.children || [];
  const isLoading = loadingNodes?.has(node.id);
  const needsLoading = !node.isLoaded;

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
    disabled: node.depth === 0 || isEditing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const toggleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    
    if (nextExpanded && needsLoading && loadChildren) {
      await loadChildren(node.id);
    }
  };

  const handleAdd = () => {
    if (newName) {
      onAdd(node.id, newName);
      setNewName('');
      setIsAddDialogOpen(false);
      setIsExpanded(true);
    }
  };

  const handleEditSubmit = () => {
    if (editedName && editedName !== node.name) {
      updateNodeName(node.id, editedName);
    }
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    deleteNode(node.id);
    setIsDeleteDialogOpen(false);
  };

  const isPrimary = node.depth === 0;
  const isAccent = node.depth > 1;

  // Show expand icon if it has loaded children OR if it's potentially a manager (root or has reports)
  const canExpand = children.length > 0 || needsLoading;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "node-container ml-8 py-2 first:mt-0 last:mb-0 transition-opacity",
        isDragging && "opacity-30 pointer-events-none"
      )}
    >
      {node.depth > 0 && <div className="dashed-line-v" />}
      {node.depth > 0 && <div className="dashed-line-h" />}

      <div className="flex items-center gap-4 tree-node-enter group">
        <Card className={cn(
          "w-80 shadow-md transition-all duration-300 border-2",
          isOver && !isDragging && "border-primary border-dashed bg-primary/5",
          !isOver && (isPrimary ? "bg-primary/20 border-primary" : (isAccent ? "bg-accent/20 border-accent" : "bg-white border-muted")),
          "hover:shadow-lg"
        )}>
          <CardContent className="p-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {node.depth > 0 && (
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              
              <div 
                className="flex-1 min-w-0 px-1"
                onDoubleClick={() => setIsEditing(true)}
              >
                {isEditing ? (
                  <Input
                    ref={editInputRef}
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleEditSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                    className="h-7 text-sm py-0 px-2 font-semibold"
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground truncate block">
                    {node.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-muted"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                title="Edit name"
              >
                <Pencil className="h-3 w-3" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary/30"
                onClick={(e) => { e.stopPropagation(); setIsAddDialogOpen(true); }}
                title="Add direct report"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {node.depth > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
                  title="Remove person"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {canExpand && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full"
                  onClick={toggleExpand}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isExpanded && (
        <div className="flex flex-col">
          {isLoading ? (
            <div className="ml-8 space-y-2 py-2">
              <Skeleton className="h-12 w-80 rounded-lg" />
              <Skeleton className="h-12 w-80 rounded-lg opacity-60" />
            </div>
          ) : children.length > 0 && (
            <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {children.map((child, index) => (
                <TreeView 
                  key={child.id} 
                  node={child} 
                  onAdd={onAdd} 
                  updateNodeName={updateNodeName}
                  deleteNode={deleteNode}
                  loadChildren={loadChildren}
                  loadingNodes={loadingNodes}
                  isLast={index === children.length - 1}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}

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
