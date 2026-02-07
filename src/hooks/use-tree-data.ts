"use client"

import { useState, useEffect, useCallback } from 'react';
import { TreeNode } from '@/types/tree';

const STORAGE_KEY = 'orgview_data_v1';

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

export function useTreeData() {
  const [tree, setTree] = useState<TreeNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTree(JSON.parse(saved));
      } catch (e) {
        setTree(INITIAL_TREE);
      }
    } else {
      setTree(INITIAL_TREE);
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

  const updateNodeName = useCallback((nodeId: string, newName: string) => {
    setTree((prev) => {
      if (!prev) return null;

      const updateName = (node: TreeNode): TreeNode => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        }
        return {
          ...node,
          children: node.children.map(updateName)
        };
      };

      return updateName(prev);
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
    if (activeId === overId) return;

    setTree((prev) => {
      if (!prev) return null;

      const newTree = JSON.parse(JSON.stringify(prev));
      let nodeToMove: TreeNode | null = null;

      if (activeId === newTree.id) return prev;
      
      const findAndRemove = (current: TreeNode): boolean => {
        const index = current.children.findIndex(c => c.id === activeId);
        if (index !== -1) {
          nodeToMove = current.children.splice(index, 1)[0];
          return true;
        }
        return current.children.some(findAndRemove);
      };

      findAndRemove(newTree);
      if (!nodeToMove) return prev;

      const isSubtree = (current: TreeNode, targetId: string): boolean => {
        if (current.id === targetId) return true;
        return current.children.some(c => isSubtree(c, targetId));
      };
      if (isSubtree(nodeToMove, overId)) return prev;

      const insertNodeAsChild = (current: TreeNode): boolean => {
        if (current.id === overId) {
          current.children.push(nodeToMove!);
          return true;
        }
        return current.children.some(insertNodeAsChild);
      };

      insertNodeAsChild(newTree);

      const updateDepths = (node: TreeNode, depth: number) => {
        node.depth = depth;
        node.children.forEach(c => updateDepths(c, depth + 1));
      };
      updateDepths(newTree, 0);

      return newTree;
    });
  }, []);

  const resetTree = useCallback(() => {
    setTree(INITIAL_TREE);
  }, []);

  return { tree, addNode, updateNodeName, deleteNode, moveNode, resetTree };
}
