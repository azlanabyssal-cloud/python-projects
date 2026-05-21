# dsa patterns for leetcode
# teaches you how to think — not just what to code
# the 7 patterns that cover 80% of placement problems

import os
from collections import deque


def clear():
    os.system("clear" if os.name == "posix" else "cls")


def pause():
    input("\n  press enter to continue...")


# ── how to approach any problem ────────────────────────────────────────────────

def approach_guide():
    clear()
    print("=== How to Think About a DSA Problem ===\n")
    print("  most students read a problem and immediately start coding.")
    print("  that is exactly why they get stuck.\n")
    print("  the real skill is pattern recognition, not memorizing code.\n")
    print("  before you write a single line, spend 2 minutes here:\n")
    print("  1. what is the input? what is the output?")
    print("     write one example by hand. trace through it.\n")
    print("  2. look for pattern clues in the problem statement:\n")
    print("     sorted array or string        ->  two pointers / binary search")
    print("     subarray or substring         ->  sliding window")
    print("     unsorted, pairs, duplicates   ->  hashmap")
    print("     brackets, most recent item    ->  stack")
    print("     tree, grid, connected nodes   ->  bfs or dfs")
    print("     count ways, min/max cost      ->  dynamic programming")
    print("     multiple range sum queries    ->  prefix sum\n")
    print("  3. think brute force first. say it out loud.")
    print("     then ask: am i repeating any work? can i skip it?\n")
    print("  4. code the pattern. edge cases last, not first.\n")
    print("  the gap between students who crack placements and those who don't")
    print("  is almost always step 2. practice recognizing patterns, not syntax.")
    pause()


# ── pattern 1: two pointers ────────────────────────────────────────────────────

def two_pointers():
    clear()
    print("=== Pattern 1: Two Pointers ===\n")
    print("  when to use:")
    print("    - array or string is sorted")
    print("    - looking for a pair that meets a condition")
    print("    - palindrome check")
    print("    - remove duplicates in place\n")
    print("  keywords: sorted, pair, sum to target, palindrome, two numbers")
    pause()

    clear()
    print("=== Two Pointers — Problem ===\n")
    print("  sorted array. find two numbers that add to target.")
    print("  return their 1-based indices. (LeetCode 167)\n")
    print("  arr = [2, 7, 11, 15]   target = 9\n")
    print("  thinking:")
    print("  - sorted + find pair = two pointers, always")
    print("  - left starts at 0, right starts at the end")
    print("  - sum = arr[left] + arr[right]")
    print("  - if sum > target: right moves left (smaller values)")
    print("  - if sum < target: left moves right (larger values)")
    print("  - this is O(n) vs O(n²) brute force")
    pause()

    clear()
    print("=== Two Pointers — Code ===\n")
    print('''  def two_sum_sorted(arr, target):
      left = 0
      right = len(arr) - 1

      while left < right:
          s = arr[left] + arr[right]
          if s == target:
              return [left + 1, right + 1]
          elif s > target:
              right -= 1    # too big, bring right in
          else:
              left += 1     # too small, push left out

      return []
    ''')
    pause()

    clear()
    print("=== Two Pointers — Output ===\n")

    def two_sum_sorted(arr, target):
        left, right = 0, len(arr) - 1
        while left < right:
            s = arr[left] + arr[right]
            if s == target:
                return [left + 1, right + 1]
            elif s > target:
                right -= 1
            else:
                left += 1
        return []

    tests = [
        ([2, 7, 11, 15], 9),
        ([1, 3, 4, 5, 7, 11], 9),
        ([1, 2, 3, 4], 10),
    ]
    for arr, target in tests:
        result = two_sum_sorted(arr, target)
        print(f"  arr={arr}  target={target}")
        if result:
            i, j = result[0] - 1, result[1] - 1
            print(f"  -> {result}   ({arr[i]} + {arr[j]} = {target})")
        else:
            print(f"  -> no pair found")
        print()
    pause()


# ── pattern 2: sliding window ──────────────────────────────────────────────────

def sliding_window():
    clear()
    print("=== Pattern 2: Sliding Window ===\n")
    print("  when to use:")
    print("    - subarray or substring problems")
    print("    - max/min sum of exactly k elements")
    print("    - longest substring with some condition")
    print("    - contiguous section of an array\n")
    print("  keywords: subarray, substring, window, k elements, contiguous, longest")
    pause()

    clear()
    print("=== Sliding Window — Problem ===\n")
    print("  given an array and k, find the max sum of any subarray of size k.")
    print("  (a classic sliding window warm-up)\n")
    print("  arr = [2, 1, 5, 1, 3, 2]   k = 3\n")
    print("  thinking:")
    print("  - brute force: check every window -> O(n*k)")
    print("  - notice: when window shifts right by 1, only 2 things change:")
    print("    one element enters from the right")
    print("    one element leaves from the left")
    print("  - so just update the sum instead of recalculating it from scratch")
    print("  - window_sum = window_sum + arr[right] - arr[right - k]")
    print("  - track the max as you slide -> O(n)")
    pause()

    clear()
    print("=== Sliding Window — Code ===\n")
    print('''  def max_sum_subarray(arr, k):
      if len(arr) < k:
          return None

      window_sum = sum(arr[:k])    # compute first window
      max_sum = window_sum

      for i in range(k, len(arr)):
          window_sum += arr[i]         # new element enters
          window_sum -= arr[i - k]     # old element leaves
          max_sum = max(max_sum, window_sum)

      return max_sum
    ''')
    pause()

    clear()
    print("=== Sliding Window — Output ===\n")

    def max_sum_subarray(arr, k):
        if len(arr) < k:
            return None
        window_sum = sum(arr[:k])
        max_sum = window_sum
        for i in range(k, len(arr)):
            window_sum += arr[i]
            window_sum -= arr[i - k]
            max_sum = max(max_sum, window_sum)
        return max_sum

    tests = [
        ([2, 1, 5, 1, 3, 2], 3),
        ([1, 4, 2, 10, 23, 3, 1, 0, 20], 4),
        ([5, 5, 5, 5], 2),
    ]
    for arr, k in tests:
        result = max_sum_subarray(arr, k)
        print(f"  arr={arr}  k={k}")
        print(f"  -> max sum = {result}")
        print()
    pause()


# ── pattern 3: binary search ───────────────────────────────────────────────────

def binary_search():
    clear()
    print("=== Pattern 3: Binary Search ===\n")
    print("  when to use:")
    print("    - array is sorted")
    print("    - find a value, or first/last occurrence of it")
    print("    - the answer is a number and you can check if it works")
    print("      (called 'binary search on answer')\n")
    print("  keywords: sorted, search, find index, minimum possible, maximum possible")
    pause()

    clear()
    print("=== Binary Search — Problem ===\n")
    print("  sorted array. find the index of target. return -1 if not found.")
    print("  (LeetCode 704)\n")
    print("  arr = [1, 3, 5, 7, 9, 11]   target = 7\n")
    print("  thinking:")
    print("  - sorted + search = binary search, always")
    print("  - look at the middle element")
    print("  - if it's the target: done")
    print("  - if target is smaller: search left half (throw right half away)")
    print("  - if target is bigger: search right half (throw left half away)")
    print("  - each step cuts the search space in half -> O(log n)")
    pause()

    clear()
    print("=== Binary Search — Code ===\n")
    print('''  def binary_search(arr, target):
      left = 0
      right = len(arr) - 1

      while left <= right:
          mid = (left + right) // 2

          if arr[mid] == target:
              return mid
          elif arr[mid] < target:
              left = mid + 1    # target in right half
          else:
              right = mid - 1   # target in left half

      return -1
    ''')
    pause()

    clear()
    print("=== Binary Search — Output ===\n")

    def binary_search(arr, target):
        left, right = 0, len(arr) - 1
        while left <= right:
            mid = (left + right) // 2
            if arr[mid] == target:
                return mid
            elif arr[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1

    arr = [1, 3, 5, 7, 9, 11]
    print(f"  arr = {arr}\n")
    for target in [7, 1, 11, 4, 9]:
        result = binary_search(arr, target)
        if result != -1:
            print(f"  target={target}  -> found at index {result}")
        else:
            print(f"  target={target}  -> not found")
    print()
    pause()


# ── pattern 4: hashmap ─────────────────────────────────────────────────────────

def hashmap_pattern():
    clear()
    print("=== Pattern 4: HashMap / Frequency Count ===\n")
    print("  when to use:")
    print("    - check if something was seen before")
    print("    - count frequency of each element")
    print("    - find duplicates, anagrams")
    print("    - two sum on an unsorted array\n")
    print("  keywords: count, frequency, duplicate, anagram, seen before, complement")
    pause()

    clear()
    print("=== HashMap — Problem ===\n")
    print("  given an array and a target,")
    print("  find two numbers that add to target. return their indices.")
    print("  array is NOT sorted. (LeetCode 1)\n")
    print("  arr = [2, 7, 11, 15]   target = 9\n")
    print("  thinking:")
    print("  - can't use two pointers — not sorted")
    print("  - for each number x, you need target - x to also exist")
    print("  - brute force: for each element, scan the whole array -> O(n²)")
    print("  - hashmap: store what you've seen so far {value -> index}")
    print("  - for each element, check if its complement is already in the map")
    print("  - one pass through the array -> O(n)")
    pause()

    clear()
    print("=== HashMap — Code ===\n")
    print('''  def two_sum(arr, target):
      seen = {}    # value -> index

      for i, num in enumerate(arr):
          complement = target - num

          if complement in seen:
              return [seen[complement], i]

          seen[num] = i    # haven't found the pair yet, store it

      return []
    ''')
    pause()

    clear()
    print("=== HashMap — Output ===\n")

    def two_sum(arr, target):
        seen = {}
        for i, num in enumerate(arr):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []

    tests = [
        ([2, 7, 11, 15], 9),
        ([3, 2, 4], 6),
        ([1, 5, 3, 7], 8),
        ([1, 2, 3], 10),
    ]
    for arr, target in tests:
        result = two_sum(arr, target)
        print(f"  arr={arr}  target={target}")
        if result:
            i, j = result
            print(f"  -> indices {result}   ({arr[i]} + {arr[j]} = {target})")
        else:
            print(f"  -> no pair found")
        print()
    pause()


# ── pattern 5: stack ───────────────────────────────────────────────────────────

def stack_pattern():
    clear()
    print("=== Pattern 5: Stack ===\n")
    print("  when to use:")
    print("    - matching brackets / parentheses")
    print("    - next greater element")
    print("    - anything where you need the most recent unmatched item")
    print("    - undo/history type problems\n")
    print("  keywords: valid, balanced, brackets, next greater, most recent, undo")
    pause()

    clear()
    print("=== Stack — Problem ===\n")
    print("  given a string of brackets, return True if it is valid.")
    print("  every opening bracket must be closed in the right order.")
    print("  (LeetCode 20)\n")
    print("  '({[]})' -> True")
    print("  '({[})' -> False\n")
    print("  thinking:")
    print("  - you need to match each closing bracket with its most recent opener")
    print("  - 'most recent' = top of a stack")
    print("  - opening bracket -> push onto stack")
    print("  - closing bracket -> check if top of stack is the matching opener")
    print("  - if not -> invalid immediately")
    print("  - at the end, stack must be empty (all opened brackets were closed)")
    pause()

    clear()
    print("=== Stack — Code ===\n")
    print('''  def is_valid(s):
      stack = []
      matching = {")": "(", "}": "{", "]": "["}

      for ch in s:
          if ch in "({[":
              stack.append(ch)
          elif ch in ")}]":
              if not stack or stack[-1] != matching[ch]:
                  return False
              stack.pop()

      return len(stack) == 0    # must be empty at the end
    ''')
    pause()

    clear()
    print("=== Stack — Output ===\n")

    def is_valid(s):
        stack = []
        matching = {")": "(", "}": "{", "]": "["}
        for ch in s:
            if ch in "({[":
                stack.append(ch)
            elif ch in ")}]":
                if not stack or stack[-1] != matching[ch]:
                    return False
                stack.pop()
        return len(stack) == 0

    tests = ["({[]})", "()", "()[]{}", "(]", "([)]", "{[]}", "(((" ]
    for s in tests:
        print(f"  '{s}'  ->  {is_valid(s)}")
    print()
    pause()


# ── pattern 6: bfs on a grid ───────────────────────────────────────────────────

def bfs_grid():
    clear()
    print("=== Pattern 6: BFS on a Grid ===\n")
    print("  when to use:")
    print("    - 2D grid problems (islands, rooms, paths)")
    print("    - shortest path in a grid")
    print("    - flood fill")
    print("    - count connected components\n")
    print("  keywords: grid, matrix, island, connected, rooms, shortest path in 2D")
    pause()

    clear()
    print("=== BFS Grid — Problem ===\n")
    print("  given a grid of 1s (land) and 0s (water),")
    print("  count the number of islands.")
    print("  an island is a group of 1s connected up/down/left/right.")
    print("  (LeetCode 200)\n")
    print("  grid:")
    print("    1 1 0 0 0")
    print("    1 1 0 0 0")
    print("    0 0 1 0 0")
    print("    0 0 0 1 1")
    print("  answer: 3 islands\n")
    print("  thinking:")
    print("  - scan every cell. when you find a 1 that hasn't been visited:")
    print("    it's a new island. count it.")
    print("    then use BFS to mark all cells of that island as visited")
    print("    so you don't count them again")
    print("  - BFS: use a queue, explore all 4 directions from each cell")
    pause()

    clear()
    print("=== BFS Grid — Code ===\n")
    print('''  def count_islands(grid):
      if not grid:
          return 0

      rows = len(grid)
      cols = len(grid[0])
      visited = [[False] * cols for _ in range(rows)]
      count = 0

      def bfs(r, c):
          queue = deque([(r, c)])
          visited[r][c] = True
          while queue:
              row, col = queue.popleft()
              for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < rows and 0 <= nc < cols:
                      if not visited[nr][nc] and grid[nr][nc] == 1:
                          visited[nr][nc] = True
                          queue.append((nr, nc))

      for r in range(rows):
          for c in range(cols):
              if grid[r][c] == 1 and not visited[r][c]:
                  bfs(r, c)
                  count += 1

      return count
    ''')
    pause()

    clear()
    print("=== BFS Grid — Output ===\n")

    def count_islands(grid):
        if not grid:
            return 0
        rows = len(grid)
        cols = len(grid[0])
        visited = [[False] * cols for _ in range(rows)]
        count = 0

        def bfs(r, c):
            queue = deque([(r, c)])
            visited[r][c] = True
            while queue:
                row, col = queue.popleft()
                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nr, nc = row + dr, col + dc
                    if 0 <= nr < rows and 0 <= nc < cols:
                        if not visited[nr][nc] and grid[nr][nc] == 1:
                            visited[nr][nc] = True
                            queue.append((nr, nc))

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1 and not visited[r][c]:
                    bfs(r, c)
                    count += 1

        return count

    grids = [
        ([[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], 3),
        ([[1,1,1],[0,1,0],[1,1,1]], 1),
        ([[1,0,0],[0,0,0],[0,0,1]], 2),
        ([[0,0,0],[0,0,0]], 0),
    ]
    for grid, expected in grids:
        result = count_islands(grid)
        for row in grid:
            print("    " + " ".join(str(x) for x in row))
        print(f"  -> {result} island(s)  (expected {expected})\n")
    pause()


# ── pattern 7: dynamic programming ────────────────────────────────────────────

def dp_pattern():
    clear()
    print("=== Pattern 7: Dynamic Programming ===\n")
    print("  when to use:")
    print("    - problem can be broken into smaller overlapping subproblems")
    print("    - recursive solution recalculates the same thing many times")
    print("    - 'count ways to do X', 'minimum cost to reach Y'\n")
    print("  keywords: minimum, maximum, count ways, how many paths, can you reach")
    pause()

    clear()
    print("=== DP — Problem ===\n")
    print("  you are climbing stairs. each step you can take 1 or 2 steps.")
    print("  how many distinct ways to reach step n?")
    print("  (LeetCode 70)\n")
    print("  n = 5  ->  8 ways\n")
    print("  thinking:")
    print("  - to reach step n, you came from step n-1 (took 1 step)")
    print("    or from step n-2 (took 2 steps)")
    print("  - so: ways(n) = ways(n-1) + ways(n-2)")
    print("  - this looks like fibonacci")
    print("  - if you use plain recursion, you recalculate ways(3), ways(4) many times")
    print("  - dp[i] = answer for step i, computed once and stored")
    print("  - fill it bottom up from dp[1] to dp[n]")
    pause()

    clear()
    print("=== DP — Code ===\n")
    print('''  def climb_stairs(n):
      if n <= 2:
          return n

      dp = [0] * (n + 1)
      dp[1] = 1    # one way to reach step 1
      dp[2] = 2    # two ways to reach step 2: (1+1) or (2)

      for i in range(3, n + 1):
          dp[i] = dp[i - 1] + dp[i - 2]    # came from i-1 or i-2

      return dp[n]
    ''')
    pause()

    clear()
    print("=== DP — Output ===\n")

    def climb_stairs(n):
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]

    for n in range(1, 9):
        print(f"  n={n}  ->  {climb_stairs(n)} ways")
    print()
    pause()


# ── pattern recognition quiz ──────────────────────────────────────────────────

QUIZ = [
    {
        "problem": "given a sorted array, find if there is a pair that sums to a target.",
        "options": ["A. sliding window", "B. two pointers", "C. hashmap", "D. stack"],
        "answer": "B",
        "reason": "sorted array + find pair = two pointers. left and right pointers moving inward."
    },
    {
        "problem": "given an array, find the longest subarray where all elements are the same.",
        "options": ["A. two pointers", "B. binary search", "C. sliding window", "D. prefix sum"],
        "answer": "C",
        "reason": "longest subarray with a condition on a contiguous section = sliding window."
    },
    {
        "problem": "given an unsorted array, check if any value appears more than once.",
        "options": ["A. stack", "B. two pointers", "C. hashmap", "D. bfs"],
        "answer": "C",
        "reason": "checking if something was seen before = hashmap. store elements as you go."
    },
    {
        "problem": "given a sorted array of 1 million elements, find if a target exists.",
        "options": ["A. linear scan", "B. sliding window", "C. bfs", "D. binary search"],
        "answer": "D",
        "reason": "sorted array + search = binary search. O(log n) vs O(n) for linear scan."
    },
    {
        "problem": "given a 2D grid of 0s and 1s, find the size of the largest group of 1s.",
        "options": ["A. dp", "B. bfs on grid", "C. binary search", "D. prefix sum"],
        "answer": "B",
        "reason": "connected components in a grid = bfs or dfs. scan for unvisited 1s and flood fill."
    },
    {
        "problem": "given a string, find the minimum number of brackets to add to make it valid.",
        "options": ["A. two pointers", "B. hashmap", "C. stack", "D. sliding window"],
        "answer": "C",
        "reason": "bracket matching, tracking unmatched openers = stack."
    },
]


def pattern_quiz():
    clear()
    print("=== Pattern Recognition Quiz ===\n")
    print("  the real skill is looking at a problem and knowing which pattern fits.")
    print("  that is what this quiz trains.\n")
    input("  press enter to start...")

    score = 0

    for i, q in enumerate(QUIZ):
        clear()
        print(f"=== Question {i + 1} of {len(QUIZ)} ===\n")
        print(f"  {q['problem']}\n")
        for opt in q["options"]:
            print(f"    {opt}")
        print()

        answer = input("  your answer (A/B/C/D): ").strip().upper()
        while answer not in ["A", "B", "C", "D"]:
            answer = input("  enter A, B, C or D: ").strip().upper()

        print()
        if answer == q["answer"]:
            score += 1
            print(f"  correct.")
        else:
            print(f"  wrong. answer was {q['answer']}.")

        print(f"  why: {q['reason']}")
        pause()

    clear()
    print("=== Quiz Done ===\n")
    percentage = round(score / len(QUIZ) * 100)
    print(f"  score: {score}/{len(QUIZ)}  ({percentage}%)\n")

    if percentage == 100:
        print("  perfect. your pattern recognition is sharp.")
    elif percentage >= 66:
        print("  good. go back and review the ones you got wrong.")
    else:
        print("  study the patterns again. recognition comes with repetition.")
    pause()


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    while True:
        clear()
        print("=== DSA Patterns for LeetCode ===\n")
        print("  start here:")
        print("  0. How to think about any problem\n")
        print("  patterns:")
        print("  1. Two Pointers")
        print("  2. Sliding Window")
        print("  3. Binary Search")
        print("  4. HashMap / Frequency Count")
        print("  5. Stack")
        print("  6. BFS on a Grid")
        print("  7. Dynamic Programming\n")
        print("  q. Pattern recognition quiz")
        print("  x. Exit\n")

        choice = input("  Choice: ").strip().lower()

        if choice == "0":
            approach_guide()
        elif choice == "1":
            two_pointers()
        elif choice == "2":
            sliding_window()
        elif choice == "3":
            binary_search()
        elif choice == "4":
            hashmap_pattern()
        elif choice == "5":
            stack_pattern()
        elif choice == "6":
            bfs_grid()
        elif choice == "7":
            dp_pattern()
        elif choice == "q":
            pattern_quiz()
        elif choice == "x":
            print("\n  Happy Coding!\n")
            break
        else:
            print("  invalid choice.")
            input("  press enter...")


if __name__ == "__main__":
    main()
