"use client"

import React, { useState } from 'react';
import { TreeNode } from '@/types/tree';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrgNodeProps {
  node: TreeNode;
  onAdd: (parentId: string, name: string, role: string) => void;
  onDelete: (nodeId: string) => void;
  isLast?: boolean;
}

export const OrgNode: React.FC<OrgNodeProps> = ({ node, onAdd, onDelete, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAdd = () => {
    if (newName && newRole) {
      onAdd(node.id, newName, newRole);
      setNewName('');
      setNewRole('');
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
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{node.role}</span>
              <span className="text-base font-semibold text-foreground">{node.name}</span>
            </div>

            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               {/* Controls will show on hover if we wrap in group, but for better UX let's keep them accessible */}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-primary/30"
                  onClick={() => setIsDialogOpen(true)}
                  title="Add child node"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {node.depth > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                    onClick={() => onDelete(node.id)}
                    title="Delete node"
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

      {/* Add Node Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Jane Doe" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role / Department</Label>
              <Input 
                id="role" 
                placeholder="e.g. Senior Developer" 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
