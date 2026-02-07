export interface TreeNode {
  id: string;
  name: string;
  role: string;
  children: TreeNode[];
  depth: number;
}
