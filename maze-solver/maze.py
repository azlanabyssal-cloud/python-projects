# maze generator and solver
# generates a random maze using recursive backtracking
# solves it with bfs (shortest path) and dfs (first path found)

import random
import os
from collections import deque


class Maze:
    def __init__(self, rows=9, cols=19):
        self.rows = rows
        self.cols = cols
        # actual grid is (2*rows+1) x (2*cols+1)
        # each cell gets a spot, walls go between them
        self.h = 2 * rows + 1
        self.w = 2 * cols + 1
        self.grid = [['#'] * self.w for _ in range(self.h)]
        self.start = (1, 1)
        self.end = (self.h - 2, self.w - 2)
        self._generate()
        self._add_shortcuts(8)
        self.grid[1][1] = 'S'
        self.grid[self.h - 2][self.w - 2] = 'E'

    def _generate(self):
        # iterative version of recursive backtracking
        # carves passages by knocking down walls between unvisited cells
        visited = [[False] * self.cols for _ in range(self.rows)]
        visited[0][0] = True
        self.grid[1][1] = ' '
        stack = [(0, 0)]

        while stack:
            r, c = stack[-1]
            dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
            random.shuffle(dirs)
            moved = False
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols and not visited[nr][nc]:
                    visited[nr][nc] = True
                    # knock down the wall between current cell and next
                    self.grid[2 * r + 1 + dr][2 * c + 1 + dc] = ' '
                    self.grid[2 * nr + 1][2 * nc + 1] = ' '
                    stack.append((nr, nc))
                    moved = True
                    break
            if not moved:
                stack.pop()

    def _add_shortcuts(self, count=5):
        # punch extra holes in the maze so there are multiple paths
        # this is what makes bfs vs dfs comparison actually interesting
        # wall positions are: (even row, odd col) or (odd row, even col)
        walls = []
        for r in range(1, self.h - 1):
            for c in range(1, self.w - 1):
                if self.grid[r][c] == '#':
                    is_horiz_wall = (r % 2 == 1 and c % 2 == 0)
                    is_vert_wall = (r % 2 == 0 and c % 2 == 1)
                    if is_horiz_wall or is_vert_wall:
                        walls.append((r, c))
        random.shuffle(walls)
        for i in range(min(count, len(walls))):
            r, c = walls[i]
            self.grid[r][c] = ' '

    def show(self, path=None):
        grid_copy = [row[:] for row in self.grid]
        if path:
            for r, c in path:
                if grid_copy[r][c] == ' ':
                    grid_copy[r][c] = '.'
        for row in grid_copy:
            print('  ' + ''.join(row))
        print()

    def bfs(self):
        # bfs guarantees shortest path - explores level by level
        queue = deque([self.start])
        came_from = {self.start: None}

        while queue:
            r, c = queue.popleft()
            if (r, c) == self.end:
                break
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < self.h and 0 <= nc < self.w:
                    if (nr, nc) not in came_from and self.grid[nr][nc] != '#':
                        came_from[(nr, nc)] = (r, c)
                        queue.append((nr, nc))

        if self.end not in came_from:
            return None

        path = []
        node = self.end
        while node is not None:
            path.append(node)
            node = came_from[node]
        path.reverse()
        return path

    def dfs(self):
        # dfs finds a path but not necessarily the shortest
        stack = [self.start]
        came_from = {self.start: None}

        while stack:
            r, c = stack.pop()
            if (r, c) == self.end:
                break
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < self.h and 0 <= nc < self.w:
                    if (nr, nc) not in came_from and self.grid[nr][nc] != '#':
                        came_from[(nr, nc)] = (r, c)
                        stack.append((nr, nc))

        if self.end not in came_from:
            return None

        path = []
        node = self.end
        while node is not None:
            path.append(node)
            node = came_from[node]
        path.reverse()
        return path


def clear():
    os.system("clear" if os.name == "posix" else "cls")


def main():
    maze = Maze()

    while True:
        clear()
        print("=== Maze Solver ===\n")
        print("  1. Generate new maze (default size)")
        print("  2. Generate new maze (custom size)")
        print("  3. Show maze")
        print("  4. Solve with BFS")
        print("  5. Solve with DFS")
        print("  6. BFS vs DFS comparison")
        print("  0. Exit\n")

        choice = input("  Choice: ").strip()

        if choice == "1":
            maze = Maze()
            print("  new maze generated.")
            input("  press enter...")

        elif choice == "2":
            try:
                r = int(input("  rows (5-15): ").strip())
                c = int(input("  cols (5-25): ").strip())
                r = max(5, min(15, r))
                c = max(5, min(25, c))
                maze = Maze(r, c)
                print(f"  {r}x{c} maze generated.")
            except ValueError:
                print("  invalid size. using default.")
                maze = Maze()
            input("  press enter...")

        elif choice == "3":
            clear()
            print("=== Maze ===\n")
            maze.show()
            input("  press enter...")

        elif choice == "4":
            clear()
            print("=== BFS - Shortest Path ===\n")
            path = maze.bfs()
            if path:
                maze.show(path)
                print(f"  path found in {len(path)} steps.")
            else:
                print("  no path found.")
            input("  press enter...")

        elif choice == "5":
            clear()
            print("=== DFS - First Path Found ===\n")
            path = maze.dfs()
            if path:
                maze.show(path)
                print(f"  path found in {len(path)} steps.")
            else:
                print("  no path found.")
            input("  press enter...")

        elif choice == "6":
            clear()
            print("=== BFS vs DFS ===\n")
            bfs_path = maze.bfs()
            dfs_path = maze.dfs()

            if bfs_path and dfs_path:
                print("  BFS (shortest path):\n")
                maze.show(bfs_path)
                print(f"  bfs: {len(bfs_path)} steps")
                print()

                print("  DFS (first path found):\n")
                maze.show(dfs_path)
                print(f"  dfs: {len(dfs_path)} steps")
                print()

                diff = len(dfs_path) - len(bfs_path)
                if diff > 0:
                    print(f"  bfs found a shorter path by {diff} steps.")
                elif diff == 0:
                    print("  both found the same length path this time.")
                else:
                    print(f"  dfs happened to find a shorter path by {abs(diff)} steps.")
            else:
                print("  could not solve maze.")

            input("  press enter...")

        elif choice == "0":
            print("\n  Happy Coding!\n")
            break

        else:
            print("  invalid choice.")
            input("  press enter...")


if __name__ == "__main__":
    main()
