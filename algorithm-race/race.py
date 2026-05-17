import time
import random
import os


def bubble_sort(arr):
    a = arr.copy()
    n = len(a)
    steps = 0
    history = [a.copy()]

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            steps += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if swapped:
            history.append(a.copy())
        if not swapped:
            break

    return a, steps, history


def merge_sort(arr):
    steps = [0]
    history = []

    def merge(left, right):
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            steps[0] += 1
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result

    def sort(a):
        if len(a) <= 1:
            return a
        mid = len(a) // 2
        left = sort(a[:mid])
        right = sort(a[mid:])
        merged = merge(left, right)
        history.append(merged.copy())
        return merged

    sorted_arr = sort(arr.copy())
    return sorted_arr, steps[0], history


def quick_sort(arr):
    steps = [0]
    history = []

    def sort(a):
        if len(a) <= 1:
            return a
        pivot = a[len(a) // 2]
        left = [x for x in a if x < pivot]
        middle = [x for x in a if x == pivot]
        right = [x for x in a if x > pivot]
        steps[0] += len(a)
        result = sort(left) + middle + sort(right)
        history.append(result.copy())
        return result

    sorted_arr = sort(arr.copy())
    return sorted_arr, steps[0], history


def show_array(arr):
    return "[" + ", ".join(str(x) for x in arr) + "]"


def run_race(numbers):
    os.system("clear" if os.name == "posix" else "cls")
    show_steps = len(numbers) <= 10

    print("=" * 58)
    print("              ALGORITHM RACE")
    print("=" * 58)
    print(f"\n  Input : {show_array(numbers)}")
    print(f"  Size  : {len(numbers)} elements\n")

    results = {}

    # Bubble Sort
    print("  " + "-" * 54)
    print("  BUBBLE SORT")
    print("  " + "-" * 54)
    start = time.perf_counter()
    sorted_arr, steps, history = bubble_sort(numbers)
    elapsed = time.perf_counter() - start

    if show_steps:
        print(f"  Start  : {show_array(numbers)}")
        for i, state in enumerate(history[1:], 1):
            print(f"  Pass {i}  : {show_array(state)}")
    print(f"  Result : Steps = {steps}  |  Time = {elapsed:.6f}s\n")
    results["Bubble Sort"] = {"steps": steps, "time": elapsed}

    # Merge Sort
    print("  " + "-" * 54)
    print("  MERGE SORT")
    print("  " + "-" * 54)
    start = time.perf_counter()
    sorted_arr, steps, history = merge_sort(numbers)
    elapsed = time.perf_counter() - start

    if show_steps:
        print(f"  Start   : {show_array(numbers)}")
        for i, state in enumerate(history, 1):
            print(f"  Merge {i} : {show_array(state)}")
    print(f"  Result  : Steps = {steps}  |  Time = {elapsed:.6f}s\n")
    results["Merge Sort"] = {"steps": steps, "time": elapsed}

    # Quick Sort
    print("  " + "-" * 54)
    print("  QUICK SORT")
    print("  " + "-" * 54)
    start = time.perf_counter()
    sorted_arr, steps, history = quick_sort(numbers)
    elapsed = time.perf_counter() - start

    if show_steps:
        print(f"  Start   : {show_array(numbers)}")
        for i, state in enumerate(history, 1):
            print(f"  Part {i}  : {show_array(state)}")
    print(f"  Result  : Steps = {steps}  |  Time = {elapsed:.6f}s\n")
    results["Quick Sort"] = {"steps": steps, "time": elapsed}

    # Final comparison table
    ranked = sorted(results.items(), key=lambda x: x[1]["steps"])

    print("=" * 58)
    print("  RACE RESULTS")
    print("=" * 58)
    print(f"  {'Algorithm':<16} {'Steps':>8}  {'Time':>12}  Rank")
    print("  " + "-" * 50)

    rank_label = {0: "1st  <-- WINNER", 1: "2nd", 2: "3rd"}
    for rank, (name, data) in enumerate(ranked):
        print(f"  {name:<16} {data['steps']:>8}  {data['time']:>10.6f}s  {rank_label[rank]}")

    print(f"\n  Sorted : {show_array(sorted_arr)}")
    print()


def get_numbers():
    print("=" * 58)
    print("              ALGORITHM RACE")
    print("=" * 58)
    print("\n  Enter integers separated by spaces")
    print("  Press Enter to race with 10 random numbers\n")

    user_input = input("  Numbers: ").strip()

    if user_input == "":
        numbers = random.sample(range(1, 100), 10)
        print(f"  Generated: {numbers}")
        input("  Press Enter to start the race...")
        return numbers

    try:
        numbers = [int(x) for x in user_input.split()]
        if len(numbers) < 2:
            print("  Enter at least 2 numbers.")
            return None
        return numbers
    except ValueError:
        print("  Only integers allowed.")
        return None


if __name__ == "__main__":
    while True:
        os.system("clear" if os.name == "posix" else "cls")
        numbers = get_numbers()

        if numbers:
            run_race(numbers)

        print("  Race again? (y/n): ", end="")
        if input().strip().lower() != "y":
            print("\n  Happy Coding!\n")
            break
