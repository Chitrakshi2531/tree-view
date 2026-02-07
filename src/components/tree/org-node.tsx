"use client"

import React, { useState } from 'react';
import { TreeNode } from '@/types/tree';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrgNodeProps {
  node: TreeNode;
  onAdd: (parentId: string, name: string) => void;
  onDelete: (nodeId: string) => void;
  isLast?: boolean;
}

export const OrgNode: React.FC<OrgNodeProps> = ({ node, onAdd, onDelete, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName) {
      onAdd(node.id, newName);
      setNewName('');
      setIsDialogOpen(false);
      setIsExpanded(true);
    }
  };

  const isPrimary = node.depth === 0;
  const isAccent = node.depth > 1;

  return (
    <div className="node-container ml-8 py-2 first:mt-0 last:mb-0">
      {/* Visual connectors */}
      {node.depth > 0 && <div className="dashed-line-v" />}
      {node.depth > 0 && <div className="dashed-line-h" />}

      <div className="flex items-center gap-4 tree-node-enter">
        <Card className={cn(
          "w-64 shadow-md transition-all duration-300 hover:shadow-lg border-2",
          isPrimary ? "bg-primary/20 border-primary" : (isAccent ? "bg-accent/20 border-accent" : "bg-white border-muted")
        )}>
          <CardContent className="p-4 relative">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">{node.name}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-primary/30"
                  onClick={() => setIsDialogOpen(true)}
                  title="Add direct report"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {node.depth > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                    onClick={() => onDelete(node.id)}
                    title="Remove person"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {node.children.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsExpanded(!isExpanded)}
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
          {node.children.map((child, index) => (
            <OrgNode 
              key={child.id} 
              node={child} 
              onAdd={onAdd} 
              onDelete={onDelete}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}

      {/* Add Person Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Person</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
