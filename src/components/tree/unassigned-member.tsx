
"use client"

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnassignedMemberProps {
  id: string;
  name: string;
}

export const UnassignedMember: React.FC<UnassignedMemberProps> = ({ id, name }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "mb-2 touch-none",
        isDragging && "opacity-50 z-50"
      )}
    >
      <Card className="hover:border-primary/50 transition-colors shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium truncate">{name}</span>
        </CardContent>
      </Card>
    </div>
  );
};
