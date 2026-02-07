"use client"

import { useState, useEffect, useCallback } from 'react';
import { TreeNode } from '@/types/tree';

const STORAGE_KEY = 'orgview_tree_data';

const INITIAL_DATA: TreeNode = {
  id: 'root',
  name: 'Organization Root',
  depth: 0,
  children: [
    {
      id: '1',
      name: 'Engineering',
      depth: 1,
      children: []
    },
    {
      id: '2',
      name: 'Marketing',
      depth: 1,
      children: []
    }
  ]
};

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTree(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tree data", e);
        setTree(INITIAL_DATA);
      }
    } else {
      setTree(INITIAL_DATA);
    }
  }, []);

  // Save to local storage whenever tree changes
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
      if (!prev || prev.id === nodeId) return prev; // Cannot delete root easily in this simple model

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

  const resetTree = useCallback(() => {
    setTree(INITIAL_DATA);
  }, []);

  return { tree, addNode, deleteNode, resetTree };
}
