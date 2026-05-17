import json
import time
import random
import os
from datetime import datetime


TIME_LIMIT = 30


class Quiz:
    def __init__(self):
        self.questions = []
        self.score = 0
        self.results = []

    def reset(self):
        self.score = 0
        self.results = []

    def load_questions(self, filepath):
        with open(filepath, "r") as f:
            self.questions = json.load(f)

    def clear(self):
        os.system("clear" if os.name == "posix" else "cls")

    def get_valid_answer(self):
        while True:
            answer = input("  Your answer (A/B/C/D): ").strip().upper()
            if answer in ["A", "B", "C", "D"]:
                return answer
            print("  Invalid input. Please enter A, B, C, or D.")

    def run(self):
        self.reset()
        self.clear()

        print("=" * 54)
        print("          PLACEMENT APTITUDE QUIZ")
        print("=" * 54)
        print(f"  10 questions  |  {TIME_LIMIT} seconds per question")
        print("  Topics: Quantitative, Logical, Verbal, Python")
        print("=" * 54)
        input("\n  Press Enter to start...\n")

        picked = random.sample(self.questions, min(10, len(self.questions)))

        for i, q in enumerate(picked):
            self.clear()
            print(f"  Q{i + 1}/10  |  Topic: {q['topic']}  |  Time Limit: {TIME_LIMIT}s")
            print("  " + "-" * 50)
            print(f"\n  {q['question']}\n")
            for option in q["options"]:
                print(f"    {option}")
            print()

            start = time.time()
            answer = self.get_valid_answer()
            elapsed = round(time.time() - start, 1)

            is_timeout = elapsed > TIME_LIMIT
            is_correct = (answer == q["answer"]) and not is_timeout

            print()
            if is_timeout:
                print(f"  Time up! ({elapsed}s)  |  Correct answer: {q['answer']}")
            elif is_correct:
                self.score += 1
                print(f"  Correct! ({elapsed}s)")
            else:
                print(f"  Wrong. Correct answer: {q['answer']}")

            print(f"  Tip: {q['explanation']}")

            self.results.append({
                "topic": q["topic"],
                "correct": is_correct,
                "timeout": is_timeout,
                "time_taken": elapsed
            })

            input("\n  Press Enter for next question...")

        self.show_result()
        self.save_result()

    def show_result(self):
        self.clear()
        percentage = self.score * 10

        print("=" * 54)
        print("              YOUR RESULTS")
        print("=" * 54)
        print(f"\n  Score      :  {self.score} / 10")
        print(f"  Percentage :  {percentage}%")

        if percentage >= 80:
            status = "Excellent — Placement Ready!"
        elif percentage >= 60:
            status = "Good — Keep practicing"
        elif percentage >= 40:
            status = "Average — Focus on weak topics"
        else:
            status = "Needs improvement — Don't give up!"

        print(f"  Status     :  {status}")

        topic_stats = {}
        for r in self.results:
            t = r["topic"]
            if t not in topic_stats:
                topic_stats[t] = {"correct": 0, "total": 0}
            topic_stats[t]["total"] += 1
            if r["correct"]:
                topic_stats[t]["correct"] += 1

        print("\n  Topic-wise Performance:")
        print("  " + "-" * 44)

        weak_topics = []
        for topic, stat in topic_stats.items():
            accuracy = round(stat["correct"] / stat["total"] * 100)
            filled = "#" * stat["correct"]
            empty = "-" * (stat["total"] - stat["correct"])
            print(f"  {topic:<16} [{filled}{empty}]  {stat['correct']}/{stat['total']}  ({accuracy}%)")
            if accuracy < 50:
                weak_topics.append(topic)

        if weak_topics:
            print(f"\n  Weak Topics  :  {', '.join(weak_topics)}")
            print("  Revise these topics before your placement interviews!")

        timeouts = sum(1 for r in self.results if r["timeout"])
        avg_time = round(sum(r["time_taken"] for r in self.results) / len(self.results), 1)

        print(f"\n  Avg time/question  :  {avg_time}s")
        if timeouts > 0:
            print(f"  Timed out          :  {timeouts} question(s) — work on your speed!")

        print()

    def save_result(self):
        entry = {
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "score": self.score,
            "percentage": self.score * 10,
            "details": self.results
        }

        script_dir = os.path.dirname(os.path.abspath(__file__))
        results_path = os.path.join(script_dir, "results.json")

        history = []
        if os.path.exists(results_path):
            with open(results_path, "r") as f:
                history = json.load(f)

        history.append(entry)

        with open(results_path, "w") as f:
            json.dump(history, f, indent=4)

        if len(history) > 1:
            print("  Your Progress (last 3 attempts):")
            last_three = history[-3:]
            for idx, h in enumerate(last_three):
                attempt_num = len(history) - len(last_three) + idx + 1
                print(f"  Attempt {attempt_num}:  {h['score']}/10  ({h['percentage']}%)  on  {h['date']}")
            print()


if __name__ == "__main__":
    quiz = Quiz()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    questions_path = os.path.join(script_dir, "questions.json")
    quiz.load_questions(questions_path)

    while True:
        quiz.run()
        print("  Play again? (y/n): ", end="")
        choice = input().strip().lower()
        if choice != "y":
            print("\n  Good luck with your placements!\n")
            break
