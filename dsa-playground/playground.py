import os


# Linked List

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def insert_end(self, data):
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
        print(f"  {data} inserted at end.")

    def insert_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
        print(f"  {data} inserted at beginning.")

    def delete(self, data):
        if self.head is None:
            print("  List is empty.")
            return
        if self.head.data == data:
            self.head = self.head.next
            print(f"  {data} deleted.")
            return
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                print(f"  {data} deleted.")
                return
            current = current.next
        print(f"  {data} not found in list.")

    def search(self, data):
        current = self.head
        position = 1
        while current:
            if current.data == data:
                print(f"  Found {data} at position {position}.")
                return
            current = current.next
            position += 1
        print(f"  {data} not found.")

    def display(self):
        if self.head is None:
            print("  List is empty.")
            return
        current = self.head
        elements = []
        while current:
            elements.append(str(current.data))
            current = current.next
        print("  " + " -> ".join(elements) + " -> None")


# Stack

class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)
        print(f"  {item} pushed onto stack.")

    def pop(self):
        if not self.items:
            print("  Stack is empty. Nothing to pop.")
            return
        removed = self.items.pop()
        print(f"  {removed} popped from stack.")

    def peek(self):
        if not self.items:
            print("  Stack is empty.")
            return
        print(f"  Top element: {self.items[-1]}")

    def display(self):
        if not self.items:
            print("  Stack is empty.")
            return
        print("  TOP")
        for item in reversed(self.items):
            print(f"  | {item} |")
        print("  -----")


# Queue

class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)
        print(f"  {item} added to queue.")

    def dequeue(self):
        if not self.items:
            print("  Queue is empty. Nothing to dequeue.")
            return
        removed = self.items.pop(0)
        print(f"  {removed} removed from front of queue.")

    def display(self):
        if not self.items:
            print("  Queue is empty.")
            return
        print("  Front -> " + " -> ".join(str(x) for x in self.items) + " <- Rear")


# Binary Search Tree

class BSTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None

    def insert(self, data):
        if self.root is None:
            self.root = BSTNode(data)
            print(f"  {data} inserted as root.")
            return
        current = self.root
        while True:
            if data < current.data:
                if current.left is None:
                    current.left = BSTNode(data)
                    print(f"  {data} inserted.")
                    return
                current = current.left
            elif data > current.data:
                if current.right is None:
                    current.right = BSTNode(data)
                    print(f"  {data} inserted.")
                    return
                current = current.right
            else:
                print(f"  {data} already exists in tree.")
                return

    def search(self, data):
        current = self.root
        steps = 0
        while current:
            steps += 1
            if data == current.data:
                print(f"  Found {data} in {steps} step(s).")
                return
            elif data < current.data:
                current = current.left
            else:
                current = current.right
        print(f"  {data} not found in tree.")

    def inorder_traverse(self, node, result):
        if node:
            self.inorder_traverse(node.left, result)
            result.append(node.data)
            self.inorder_traverse(node.right, result)

    def display(self):
        if self.root is None:
            print("  Tree is empty.")
            return
        result = []
        self.inorder_traverse(self.root, result)
        print(f"  Inorder (sorted): {result}")


# Menus

def clear():
    os.system("clear" if os.name == "posix" else "cls")


def linked_list_menu():
    ll = LinkedList()
    while True:
        print("\n  ── LINKED LIST ──────────────────────")
        print("  1. Insert at end")
        print("  2. Insert at beginning")
        print("  3. Delete a value")
        print("  4. Search a value")
        print("  5. Display list")
        print("  0. Back to main menu")
        choice = input("\n  Choice: ").strip()

        if choice == "1":
            val = input("  Value: ").strip()
            ll.insert_end(val)
        elif choice == "2":
            val = input("  Value: ").strip()
            ll.insert_beginning(val)
        elif choice == "3":
            val = input("  Value to delete: ").strip()
            ll.delete(val)
        elif choice == "4":
            val = input("  Value to search: ").strip()
            ll.search(val)
        elif choice == "5":
            ll.display()
        elif choice == "0":
            break
        else:
            print("  Invalid choice. Enter 0-5.")


def stack_menu():
    stack = Stack()
    while True:
        print("\n  ── STACK ────────────────────────────")
        print("  1. Push")
        print("  2. Pop")
        print("  3. Peek")
        print("  4. Display stack")
        print("  0. Back to main menu")
        choice = input("\n  Choice: ").strip()

        if choice == "1":
            val = input("  Value: ").strip()
            stack.push(val)
        elif choice == "2":
            stack.pop()
        elif choice == "3":
            stack.peek()
        elif choice == "4":
            stack.display()
        elif choice == "0":
            break
        else:
            print("  Invalid choice. Enter 0-4.")


def queue_menu():
    queue = Queue()
    while True:
        print("\n  ── QUEUE ────────────────────────────")
        print("  1. Enqueue")
        print("  2. Dequeue")
        print("  3. Display queue")
        print("  0. Back to main menu")
        choice = input("\n  Choice: ").strip()

        if choice == "1":
            val = input("  Value: ").strip()
            queue.enqueue(val)
        elif choice == "2":
            queue.dequeue()
        elif choice == "3":
            queue.display()
        elif choice == "0":
            break
        else:
            print("  Invalid choice. Enter 0-3.")


def bst_menu():
    bst = BST()
    while True:
        print("\n  ── BINARY SEARCH TREE ───────────────")
        print("  1. Insert")
        print("  2. Search")
        print("  3. Display inorder")
        print("  0. Back to main menu")
        choice = input("\n  Choice: ").strip()

        if choice == "1":
            try:
                val = int(input("  Value (integer): ").strip())
                bst.insert(val)
            except ValueError:
                print("  BST only accepts integers.")
        elif choice == "2":
            try:
                val = int(input("  Value to search: ").strip())
                bst.search(val)
            except ValueError:
                print("  BST only accepts integers.")
        elif choice == "3":
            bst.display()
        elif choice == "0":
            break
        else:
            print("  Invalid choice. Enter 0-3.")


def main():
    while True:
        clear()
        print("=" * 46)
        print("           DSA PLAYGROUND")
        print("=" * 46)
        print("\n  Choose a Data Structure:\n")
        print("  1. Linked List")
        print("  2. Stack")
        print("  3. Queue")
        print("  4. Binary Search Tree")
        print("  0. Exit")

        choice = input("\n  Choice: ").strip()

        if choice == "1":
            linked_list_menu()
        elif choice == "2":
            stack_menu()
        elif choice == "3":
            queue_menu()
        elif choice == "4":
            bst_menu()
        elif choice == "0":
            print("\n  Good luck with your placements!\n")
            break
        else:
            print("  Invalid choice.")
            input("  Press Enter to continue...")


if __name__ == "__main__":
    main()
