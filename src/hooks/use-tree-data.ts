
"use client"

import { useState, useEffect, useCallback } from 'react';
import { TreeNode } from '@/types/tree';

const STORAGE_KEY = 'orgview_tree_data';

const INITIAL_DATA: TreeNode = {
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

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTree(JSON.parse(saved));
      } catch (e) {
        setTree(INITIAL_DATA);
      }
    } else {
      setTree(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    if (tree) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
    }
  }, [tree]);

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
    setTree((prev) => {
      if (!prev || prev.id === nodeId) return prev;

      const filterChildren = (node: TreeNode): TreeNode => {
        return {
          ...node,
          children: node.children
            .filter((child) => child.id !== nodeId)
            .map(filterChildren)
        };
      };

      return filterChildren(prev);
    });
  }, []);

  const moveNode = useCallback((activeId: string, overId: string) => {
    setTree((prev) => {
      if (!prev || activeId === overId) return prev;

      // Deep copy to mutate
      const newTree = JSON.parse(JSON.stringify(prev));
      let nodeToMove: TreeNode | null = null;

      // Helper to find and remove node from its current parent
      const findAndRemove = (current: TreeNode): boolean => {
        const index = current.children.findIndex(c => c.id === activeId);
        if (index !== -1) {
          nodeToMove = current.children.splice(index, 1)[0];
          return true;
        }
        return current.children.some(findAndRemove);
      };

      // Hierarchy integrity check: can't move root, or move a node into its own subtree
      if (activeId === newTree.id) return prev;
      
      const isSubtree = (current: TreeNode, targetId: string): boolean => {
        if (current.id === targetId) return true;
        return current.children.some(c => isSubtree(c, targetId));
      };

      // We need to find the node in the original tree to check subtree
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

      // Perform the move
      findAndRemove(newTree);
      if (!nodeToMove) return prev;

      // Helper to insert into new parent or next to sibling
      const insertNode = (current: TreeNode): boolean => {
        if (current.id === overId) {
          // Drop on a node to make it a child
          current.children.push(nodeToMove!);
          return true;
        }
        
        // Try to find if overId is a sibling to reorder
        const overIndex = current.children.findIndex(c => c.id === overId);
        if (overIndex !== -1) {
          current.children.splice(overIndex, 0, nodeToMove!);
          return true;
        }

        return current.children.some(insertNode);
      };

      insertNode(newTree);

      // Recalculate depths
      const updateDepths = (node: TreeNode, depth: number) => {
        node.depth = depth;
        node.children.forEach(c => updateDepths(c, depth + 1));
      };
      updateDepths(newTree, 0);

      return newTree;
    });
  }, []);

  const resetTree = useCallback(() => {
    setTree(INITIAL_DATA);
  }, []);

  return { tree, addNode, deleteNode, moveNode, resetTree };
}
