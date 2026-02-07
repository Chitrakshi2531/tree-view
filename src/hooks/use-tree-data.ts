
"use client"

import { useState, useEffect, useCallback } from 'react';
import { TreeNode } from '@/types/tree';

const STORAGE_KEY = 'orgview_data_v2';

interface UnassignedPerson {
  id: string;
  name: string;
}

const INITIAL_TREE: TreeNode = {
  id: 'root',
  name: 'Sarah Chen',
  depth: 0,
  children: [
    {
      id: '1',
      name: 'Marcus Rodriguez',
      depth: 1,
      children: []
    },
    {
      id: '2',
      name: 'Elena Gilbert',
      depth: 1,
      children: []
    }
  ]
};

const INITIAL_UNASSIGNED: UnassignedPerson[] = [
  { id: 'u1', name: 'Alex Rivera' },
  { id: 'u2', name: 'Jamie Lannister' },
  { id: 'u3', name: 'Brienne of Tarth' },
  { id: 'u4', name: 'Samwell Tarly' },
];

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [unassigned, setUnassigned] = useState<UnassignedPerson[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTree(parsed.tree || INITIAL_TREE);
        setUnassigned(parsed.unassigned || INITIAL_UNASSIGNED);
      } catch (e) {
        setTree(INITIAL_TREE);
        setUnassigned(INITIAL_UNASSIGNED);
      }
    } else {
      setTree(INITIAL_TREE);
      setUnassigned(INITIAL_UNASSIGNED);
    }
  }, []);

  useEffect(() => {
    if (tree) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tree, unassigned }));
    }
  }, [tree, unassigned]);

  const addNode = useCallback((parentId: string, name: string) => {
    setTree((prev) => {
      if (!prev) return null;

      const newNode: Omit<TreeNode, 'depth'> = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        children: [],
      };

      const updateChildren = (node: TreeNode): TreeNode => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...node.children, { ...newNode, depth: node.depth + 1 }]
          };
        }
        return {
          ...node,
          children: node.children.map(updateChildren)
        };
      };

      return updateChildren(prev);
    });
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    let deletedPerson: UnassignedPerson | null = null;

    setTree((prev) => {
      if (!prev || prev.id === nodeId) return prev;

      const filterChildren = (node: TreeNode): TreeNode => {
        const found = node.children.find(c => c.id === nodeId);
        if (found) {
          deletedPerson = { id: found.id, name: found.name };
        }
        return {
          ...node,
          children: node.children
            .filter((child) => child.id !== nodeId)
            .map(filterChildren)
        };
      };

      const result = filterChildren(prev);
      
      if (deletedPerson) {
        setUnassigned(u => [...u, deletedPerson!]);
      }

      return result;
    });
  }, []);

  const moveNode = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    // Check if active item is in unassigned list
    const unassignedIdx = unassigned.findIndex(p => p.id === activeId);
    
    if (unassignedIdx !== -1) {
      // Dragging FROM Talent Pool INTO Tree
      const person = unassigned[unassignedIdx];
      
      setTree(prev => {
        if (!prev) return null;
        const newTree = JSON.parse(JSON.stringify(prev));
        
        const insertNode = (current: TreeNode): boolean => {
          if (current.id === overId) {
            current.children.push({ ...person, depth: current.depth + 1, children: [] });
            return true;
          }
          const overIndex = current.children.findIndex(c => c.id === overId);
          if (overIndex !== -1) {
            current.children.splice(overIndex, 0, { ...person, depth: current.depth + 1, children: [] });
            return true;
          }
          return current.children.some(insertNode);
        };

        if (insertNode(newTree)) {
          setUnassigned(u => u.filter(p => p.id !== activeId));
          // Recalculate depths
          const updateDepths = (node: TreeNode, depth: number) => {
            node.depth = depth;
            node.children.forEach(c => updateDepths(c, depth + 1));
          };
          updateDepths(newTree, 0);
          return newTree;
        }
        return prev;
      });
    } else {
      // Standard Tree -> Tree move
      setTree((prev) => {
        if (!prev) return null;
        const newTree = JSON.parse(JSON.stringify(prev));
        let nodeToMove: TreeNode | null = null;

        const findAndRemove = (current: TreeNode): boolean => {
          const index = current.children.findIndex(c => c.id === activeId);
          if (index !== -1) {
            nodeToMove = current.children.splice(index, 1)[0];
            return true;
          }
          return current.children.some(findAndRemove);
        };

        if (activeId === newTree.id) return prev;
        
        const isSubtree = (current: TreeNode, targetId: string): boolean => {
          if (current.id === targetId) return true;
          return current.children.some(c => isSubtree(c, targetId));
        };

        const findNode = (current: TreeNode, id: string): TreeNode | null => {
          if (current.id === id) return current;
          for (const child of current.children) {
            const found = findNode(child, id);
            if (found) return found;
          }
          return null;
        };

        const sourceNode = findNode(newTree, activeId);
        if (sourceNode && isSubtree(sourceNode, overId)) return prev;

        findAndRemove(newTree);
        if (!nodeToMove) return prev;

        const insertNode = (current: TreeNode): boolean => {
          if (current.id === overId) {
            current.children.push(nodeToMove!);
            return true;
          }
          const overIndex = current.children.findIndex(c => c.id === overId);
          if (overIndex !== -1) {
            current.children.splice(overIndex, 0, nodeToMove!);
            return true;
          }
          return current.children.some(insertNode);
        };

        insertNode(newTree);

        const updateDepths = (node: TreeNode, depth: number) => {
          node.depth = depth;
          node.children.forEach(c => updateDepths(c, depth + 1));
        };
        updateDepths(newTree, 0);

        return newTree;
      });
    }
  }, [unassigned]);

  const resetTree = useCallback(() => {
    setTree(INITIAL_TREE);
    setUnassigned(INITIAL_UNASSIGNED);
  }, []);

  return { tree, unassigned, addNode, deleteNode, moveNode, resetTree };
}
