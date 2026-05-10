# to-do list project
# i used json to save tasks so they dont disappear when you close the app
# that was the hardest part to figure out honestly

import json
import os

# all tasks get saved in this file
SAVE_FILE = "tasks.json"


# this loads the tasks from the json file when the program starts
def load_tasks():
    if not os.path.exists(SAVE_FILE):
        return []
    f = open(SAVE_FILE, "r")
    tasks = json.load(f)
    f.close()
    return tasks


# this saves everything back to the file after any change
def save_tasks(tasks):
    f = open(SAVE_FILE, "w")
    json.dump(tasks, f, indent=4)
    f.close()


# i need each task to have a unique id so i can delete the right one
def make_id(tasks):
    if len(tasks) == 0:
        return 1
    biggest = 0
    for t in tasks:
        if t["id"] > biggest:
            biggest = t["id"]
    return biggest + 1


def add_task(tasks):
    name = input("Task name: ")
    if name == "":
        print("task name cant be empty")
        return

    due = input("Due date? (example: 2025-06-01) or press enter to skip: ")

    task = {
        "id": make_id(tasks),
        "name": name,
        "done": False,
        "due": due
    }

    tasks.append(task)
    save_tasks(tasks)
    print("task added!")


def delete_task(tasks):
    if len(tasks) == 0:
        print("no tasks to delete")
        return

    show_tasks(tasks, "all")

    try:
        task_id = int(input("enter task ID to delete: "))
    except:
        print("thats not a valid id")
        return

    found = False
    for t in tasks:
        if t["id"] == task_id:
            tasks.remove(t)
            found = True
            break

    if found:
        save_tasks(tasks)
        print("task deleted!")
    else:
        print("couldnt find a task with that id")


def complete_task(tasks):
    if len(tasks) == 0:
        print("no tasks yet")
        return

    show_tasks(tasks, "pending")

    try:
        task_id = int(input("enter task ID to mark as done: "))
    except:
        print("thats not a valid id")
        return

    found = False
    for t in tasks:
        if t["id"] == task_id:
            if t["done"] == True:
                print("that task is already done")
            else:
                t["done"] = True
                save_tasks(tasks)
                print("nice! marked as done")
            found = True
            break

    if not found:
        print("couldnt find that task")


def show_tasks(tasks, filter_by):
    print("")

    if len(tasks) == 0:
        print("  no tasks saved yet")
        print("")
        return

    count = 0
    for t in tasks:
        # skip tasks that dont match the filter
        if filter_by == "pending" and t["done"] == True:
            continue
        if filter_by == "done" and t["done"] == False:
            continue

        if t["done"]:
            status = "[done]"
        else:
            status = "[    ]"

        # show due date only if the user set one
        if t["due"] != "":
            due_part = "  due: " + t["due"]
        else:
            due_part = ""

        print("  " + str(t["id"]) + ". " + status + " " + t["name"] + due_part)
        count += 1

    if count == 0:
        print("  nothing here")

    print("")


# ---------- program starts here ----------

tasks = load_tasks()

print("==================================")
print("      My To-Do List (CLI)         ")
print("==================================")
print("tasks are saved automatically :)")

while True:
    print("\n--- MENU ---")
    print("1. add task")
    print("2. delete task")
    print("3. mark task as done")
    print("4. show all tasks")
    print("5. show pending only")
    print("6. show completed only")
    print("7. quit")

    choice = input("\nchoose (1-7): ")

    if choice == "1":
        add_task(tasks)

    elif choice == "2":
        delete_task(tasks)

    elif choice == "3":
        complete_task(tasks)

    elif choice == "4":
        show_tasks(tasks, "all")

    elif choice == "5":
        show_tasks(tasks, "pending")

    elif choice == "6":
        show_tasks(tasks, "done")

    elif choice == "7":
        print("see you later!")
        break

    else:
        print("pick a number from 1 to 7")
