# Security assumptions

Orvex is defense in depth.

- It is not a mathematical guarantee of agent safety.
- Prompt-injection detection is heuristic.
- Fallback enforcement is weaker than OS-level isolation.
- Network enforcement depends on the selected backend.
- An agent running outside Orvex cannot be protected by Orvex.
