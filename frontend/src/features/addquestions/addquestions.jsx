import { useState } from "react";

const API_URL = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
).replace(/\/$/, "");

function createLevel(level) {
  return {
    level,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    clue: "",
    code: "",
    location: "",
  };
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("hintgame.session") || "null");
  } catch {
    return null;
  }
}

function AddQuestions() {
  const [teamCode, setTeamCode] = useState("");
  const [levels, setLevels] = useState(() =>
    [1, 2, 3, 4].map(createLevel),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateLevel(levelIndex, field, value) {
    setLevels((current) =>
      current.map((item, index) =>
        index === levelIndex ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateOption(levelIndex, optionIndex, value) {
    setLevels((current) =>
      current.map((item, index) =>
        index === levelIndex
          ? {
              ...item,
              options: item.options.map((option, optionNumber) =>
                optionNumber === optionIndex ? value : option,
              ),
            }
          : item,
      ),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const session = readSession();
      if (!session?.token) {
        throw new Error("Please sign in again to continue.");
      }

      const response = await fetch(`${API_URL}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          teamCode: teamCode.trim().toUpperCase(),
          levels: levels.map((level) => ({
            ...level,
            correctIndex: Number(level.correctIndex),
          })),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save the team questions.");
      }

      setMessage(result.message || "All four levels were saved.");
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Can't reach the server. Check your connection and try again."
          : requestError.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#101312] px-4 py-8 text-[#f4f5f2] sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#b6f36b]">
            HINTGAME / ADMIN
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Add team questions
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#a2aaa5]">
            Enter all four levels for one team. Saving again replaces that
            team&apos;s existing level data.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-xl border border-[#3a423d] bg-[#161b18] p-5 sm:p-6">
            <label
              className="mb-2 block text-sm font-semibold"
              htmlFor="target-team-code"
            >
              Team code
            </label>
            <input
              className="w-full rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 text-white outline-none focus:border-[#b6f36b]"
              id="target-team-code"
              name="teamCode"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="Enter the registered team code"
              value={teamCode}
              onChange={(event) => setTeamCode(event.target.value.toUpperCase())}
              required
            />
          </section>

          {levels.map((level, levelIndex) => (
            <fieldset
              className="space-y-5 rounded-xl border border-[#3a423d] bg-[#161b18] p-5 sm:p-6"
              key={level.level}
            >
              <legend className="px-2 text-xl font-semibold text-[#b6f36b]">
                Level {level.level}
              </legend>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor={`question-${level.level}`}
                >
                  Question
                </label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 text-white outline-none focus:border-[#b6f36b]"
                  id={`question-${level.level}`}
                  value={level.question}
                  onChange={(event) =>
                    updateLevel(levelIndex, "question", event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Answer options</p>
                {level.options.map((option, optionIndex) => (
                  <div
                    className="flex items-center gap-3"
                    key={`level-${level.level}-option-${optionIndex}`}
                  >
                    <input
                      aria-label={`Mark option ${optionIndex + 1} as correct for level ${level.level}`}
                      checked={Number(level.correctIndex) === optionIndex}
                      className="h-4 w-4 accent-[#b6f36b]"
                      name={`correct-${level.level}`}
                      onChange={() =>
                        updateLevel(levelIndex, "correctIndex", optionIndex)
                      }
                      type="radio"
                    />
                    <input
                      className="min-w-0 flex-1 rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 text-white outline-none focus:border-[#b6f36b]"
                      aria-label={`Option ${optionIndex + 1}`}
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(event) =>
                        updateOption(levelIndex, optionIndex, event.target.value)
                      }
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-[#89938c]">
                  Select the radio button beside the correct answer.
                </p>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor={`clue-${level.level}`}
                >
                  Clue
                </label>
                <textarea
                  className="min-h-20 w-full rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 text-white outline-none focus:border-[#b6f36b]"
                  id={`clue-${level.level}`}
                  value={level.clue}
                  onChange={(event) =>
                    updateLevel(levelIndex, "clue", event.target.value)
                  }
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold"
                    htmlFor={`code-${level.level}`}
                  >
                    Secret code
                  </label>
                  <input
                    className="w-full rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 uppercase text-white outline-none focus:border-[#b6f36b]"
                    id={`code-${level.level}`}
                    value={level.code}
                    onChange={(event) =>
                      updateLevel(levelIndex, "code", event.target.value.toUpperCase())
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-semibold"
                    htmlFor={`location-${level.level}`}
                  >
                    Location (optional, admin only)
                  </label>
                  <input
                    className="w-full rounded-md border border-[#3a423d] bg-[#111613] px-3 py-3 text-white outline-none focus:border-[#b6f36b]"
                    id={`location-${level.level}`}
                    value={level.location}
                    onChange={(event) =>
                      updateLevel(levelIndex, "location", event.target.value)
                    }
                  />
                </div>
              </div>
            </fieldset>
          ))}

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-sm text-red-200" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-green-800 bg-green-950/50 p-4 text-sm text-green-200" role="status">
              {message}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-[#b6f36b] px-5 py-4 font-bold text-[#172014] transition hover:bg-[#c7ff80] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving levels..." : "Save all 4 levels"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AddQuestions;
