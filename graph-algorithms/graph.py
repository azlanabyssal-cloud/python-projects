# graph algorithms in python
# adjacency list representation
# BFS, DFS, dijkstra shortest path, cycle detection

import heapq
import os


class Graph:
    def __init__(self, directed=False):
        self.adj = {}
        self.directed = directed

    def add_vertex(self, v):
        if v not in self.adj:
            self.adj[v] = []
            print(f"  vertex '{v}' added.")
        else:
            print(f"  '{v}' already exists.")

    def add_edge(self, u, v, weight=1):
        if u not in self.adj or v not in self.adj:
            print("  add both vertices first before connecting them.")
            return
        self.adj[u].append((v, weight))
        if not self.directed:
            self.adj[v].append((u, weight))
        arrow = "--" if not self.directed else "->"
        print(f"  edge {u} {arrow} {v}  weight: {weight}")

    def show(self):
        if not self.adj:
            print("  graph is empty.")
            return
        print("\n  Adjacency List:")
        for v in sorted(self.adj.keys()):
            if self.adj[v]:
                neighbors = "  ".join(f"{n}(w={w})" for n, w in sorted(self.adj[v]))
                print(f"    {v}  ->  {neighbors}")
            else:
                print(f"    {v}  ->  (isolated vertex)")
        print()

    # BFS: visits layer by layer, good for shortest path in unweighted graphs
    def bfs(self, start):
        if start not in self.adj:
            print(f"  '{start}' not in graph.")
            return

        visited = set()
        queue = [start]
        visited.add(start)
        order = []

        print(f"\n  BFS from '{start}':\n")
        level = 0
        current_level = [start]

        while current_level:
            print(f"  Level {level}: {current_level}")
            next_level = []
            for node in current_level:
                order.append(node)
                for neighbor, _ in sorted(self.adj[node]):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        next_level.append(neighbor)
            current_level = next_level
            level += 1

        print(f"\n  Visit order: {' -> '.join(str(x) for x in order)}")
        if len(visited) < len(self.adj):
            not_reached = [v for v in self.adj if v not in visited]
            print(f"  Note: {not_reached} not reachable from '{start}'")

    # DFS: goes deep before backtracking, good for cycle detection and paths
    def dfs(self, start):
        if start not in self.adj:
            print(f"  '{start}' not in graph.")
            return

        visited = set()
        order = []

        def explore(node, depth):
            visited.add(node)
            order.append(node)
            indent = "    " + "  " * depth
            print(f"{indent}-> {node}")
            for neighbor, _ in sorted(self.adj[node]):
                if neighbor not in visited:
                    explore(neighbor, depth + 1)

        print(f"\n  DFS from '{start}':\n")
        explore(start, 0)
        print(f"\n  Visit order: {' -> '.join(str(x) for x in order)}")
        if len(visited) < len(self.adj):
            not_reached = [v for v in self.adj if v not in visited]
            print(f"  Note: {not_reached} not reachable from '{start}'")

    # dijkstra: finds shortest path in weighted graph using a min-heap
    def dijkstra(self, start):
        if start not in self.adj:
            print(f"  '{start}' not in graph.")
            return

        dist = {v: float('inf') for v in self.adj}
        prev = {v: None for v in self.adj}
        dist[start] = 0
        heap = [(0, start)]

        while heap:
            cost, node = heapq.heappop(heap)
            if cost > dist[node]:
                continue
            for neighbor, weight in self.adj[node]:
                new_dist = dist[node] + weight
                if new_dist < dist[neighbor]:
                    dist[neighbor] = new_dist
                    prev[neighbor] = node
                    heapq.heappush(heap, (new_dist, neighbor))

        print(f"\n  Shortest distances from '{start}':\n")
        for v in sorted(dist.keys()):
            if v == start:
                continue
            if dist[v] == float('inf'):
                print(f"    {v}:  unreachable")
            else:
                path = []
                node = v
                while node is not None:
                    path.append(str(node))
                    node = prev[node]
                path.reverse()
                print(f"    {v}:  distance = {dist[v]}   path = {' -> '.join(path)}")
        print()

    # cycle detection using DFS
    # directed graph: checks if there's a back edge (node visited in current recursion path)
    # undirected graph: checks if a neighbor is visited but is not the parent
    def has_cycle(self):
        if not self.adj:
            print("  graph is empty.")
            return

        visited = set()

        if self.directed:
            rec_stack = set()

            def dfs_cycle(node):
                visited.add(node)
                rec_stack.add(node)
                for neighbor, _ in self.adj[node]:
                    if neighbor not in visited:
                        if dfs_cycle(neighbor):
                            return True
                    elif neighbor in rec_stack:
                        return True
                rec_stack.discard(node)
                return False

            for v in self.adj:
                if v not in visited:
                    if dfs_cycle(v):
                        print("  cycle found — this is a directed graph with a cycle.")
                        return

            print("  no cycle. this is a DAG (directed acyclic graph).")

        else:
            def dfs_cycle(node, parent):
                visited.add(node)
                for neighbor, _ in self.adj[node]:
                    if neighbor not in visited:
                        if dfs_cycle(neighbor, node):
                            return True
                    elif neighbor != parent:
                        return True
                return False

            for v in self.adj:
                if v not in visited:
                    if dfs_cycle(v, None):
                        print("  cycle found in the graph.")
                        return

            print("  no cycle found — this is a tree or forest.")


def load_sample(graph):
    # sample graph: 5 cities connected with distances
    for city in ["A", "B", "C", "D", "E"]:
        graph.add_vertex(city)
    graph.add_edge("A", "B", 4)
    graph.add_edge("A", "C", 2)
    graph.add_edge("B", "C", 1)
    graph.add_edge("B", "D", 5)
    graph.add_edge("C", "D", 8)
    graph.add_edge("C", "E", 10)
    graph.add_edge("D", "E", 2)
    print("  sample graph loaded: 5 vertices, 7 edges.")


def clear():
    os.system("clear" if os.name == "posix" else "cls")


def main():
    graph = None

    while True:
        clear()
        kind = "none"
        if graph is not None:
            kind = "directed" if graph.directed else "undirected"
            kind += f"  |  {len(graph.adj)} vertices"

        print("=== Graph Algorithms ===")
        print(f"  graph: {kind}\n")
        print("  1. New undirected graph")
        print("  2. New directed graph")
        print("  3. Add vertex")
        print("  4. Add edge")
        print("  5. Show graph")
        print("  ---")
        print("  6. BFS traversal")
        print("  7. DFS traversal")
        print("  8. Dijkstra shortest path")
        print("  9. Detect cycle")
        print("  ---")
        print("  s. Load sample graph (5 cities)")
        print("  0. Exit\n")

        choice = input("  Choice: ").strip().lower()

        if choice == "1":
            graph = Graph(directed=False)
            print("  new undirected graph created.")
            input("  press enter...")

        elif choice == "2":
            graph = Graph(directed=True)
            print("  new directed graph created.")
            input("  press enter...")

        elif choice == "3":
            if graph is None:
                print("  create a graph first (option 1 or 2).")
                input("  press enter...")
                continue
            v = input("  vertex name: ").strip()
            if v:
                graph.add_vertex(v)
            input("  press enter...")

        elif choice == "4":
            if graph is None:
                print("  create a graph first.")
                input("  press enter...")
                continue
            u = input("  from: ").strip()
            v = input("  to: ").strip()
            raw = input("  weight (enter for 1): ").strip()
            try:
                w = int(raw) if raw else 1
            except ValueError:
                w = 1
            if u and v:
                graph.add_edge(u, v, w)
            input("  press enter...")

        elif choice == "5":
            if graph is None:
                print("  no graph yet.")
            else:
                graph.show()
            input("  press enter...")

        elif choice == "6":
            if graph is None:
                print("  create a graph first.")
                input("  press enter...")
                continue
            start = input("  start vertex: ").strip()
            if start:
                graph.bfs(start)
            input("  press enter...")

        elif choice == "7":
            if graph is None:
                print("  create a graph first.")
                input("  press enter...")
                continue
            start = input("  start vertex: ").strip()
            if start:
                graph.dfs(start)
            input("  press enter...")

        elif choice == "8":
            if graph is None:
                print("  create a graph first.")
                input("  press enter...")
                continue
            start = input("  start vertex: ").strip()
            if start:
                graph.dijkstra(start)
            input("  press enter...")

        elif choice == "9":
            if graph is None:
                print("  create a graph first.")
                input("  press enter...")
                continue
            graph.has_cycle()
            input("  press enter...")

        elif choice == "s":
            if graph is None:
                graph = Graph(directed=False)
            load_sample(graph)
            input("  press enter...")

        elif choice == "0":
            print("\n  Happy Coding!\n")
            break

        else:
            print("  invalid. pick 0-9 or s.")
            input("  press enter...")


if __name__ == "__main__":
    main()
