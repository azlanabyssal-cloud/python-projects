# my calculator program
# i made this using python
# it can do plus minus multiply and divide


print("   Welcome to My Calculator ")


# i used while True so it keeps running until the user says stop
while True:

    print("")
    print("What do you want to do?")
    print("1. Addition       (+)")
    print("2. Subtraction    (-)")
    print("3. Multiply       (*)")
    print("4. Divide         (/)")
    print("5. Quit")
    print("")

    choice = input("Pick a number (1/2/3/4/5): ")

    # if they pick 5 then stop the program
    if choice == "5":
        print("")
        print("Thanks for using my calculator!")
        print("Goodbye :)")
        break

    # i have to make sure they picked a valid option first
    if choice != "1" and choice != "2" and choice != "3" and choice != "4":
        print("thats not a valid choice, please pick 1 to 5")
        continue

    # now i ask for the two numbers
    try:
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))
    except ValueError:
        print("please enter valid numbers only")
        continue

    # addition
    if choice == "1":
        answer = num1 + num2
        print("Result:", num1, "+", num2, "=", answer)

    # subtraction
    elif choice == "2":
        answer = num1 - num2
        print("Result:", num1, "-", num2, "=", answer)

    # multiply
    elif choice == "3":
        answer = num1 * num2
        print("Result:", num1, "*", num2, "=", answer)

    # divide
    elif choice == "4":

        if num2 == 0:
            print("Error! you cant divide by zero")
        else:
            answer = num1 / num2
            print("Result:", num1, "/", num2, "=", answer)

    print("")
    