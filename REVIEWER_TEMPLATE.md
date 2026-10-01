# Reviewer JSON Template

Use this guide when authoring a reviewer question bank. Copy the JSON structure into a file under `reviewers/year-X/SUBJECT_CODE/` and replace every example value.

The website accepts schema version `1` and these question types only:

- `multiple-choice`
- `multiple-answer`
- `true-false`
- `fill-blank`

## Minimal reviewer structure

```json
{
  "schemaVersion": 1,
  "id": "cs0000-midterm",
  "subject": {
    "code": "CS0000",
    "name": "Example Subject",
    "yearLevel": 1
  },
  "reviewer": {
    "title": "Midterm Reviewer",
    "description": "Questions covering the listed modules.",
    "coverage": ["Module 1", "Module 2"],
    "shuffleQuestions": true,
    "shuffleChoices": true
  },
  "questions": []
}
```

`questions` must contain at least one valid question. Every question requires:

```json
{
  "id": "q001",
  "type": "...",
  "topic": "Topic name",
  "question": "Question text",
  "explanation": "Why the answer is correct.",
  "source": { "module": "Module 1", "page": 4 }
}
```

## Question examples

### Multiple choice

```json
{
  "id": "q001",
  "type": "multiple-choice",
  "topic": "OSI Model",
  "question": "Which layer handles routing?",
  "choices": ["Physical", "Data Link", "Network", "Transport"],
  "correctAnswer": "Network",
  "explanation": "The Network layer handles logical addressing and routing.",
  "source": { "module": "Module 2", "page": 14 }
}
```

### Multiple answer

Use `correctAnswers` for the complete correct set. Additional selected choices are incorrect.

```json
{
  "id": "q002",
  "type": "multiple-answer",
  "topic": "Transport Layer",
  "question": "Which protocols operate at the transport layer?",
  "choices": ["TCP", "UDP", "IP", "Ethernet"],
  "correctAnswers": ["TCP", "UDP"],
  "explanation": "TCP and UDP are transport-layer protocols.",
  "source": { "module": "Module 2", "page": 20 }
}
```

### True or false

```json
{
  "id": "q003",
  "type": "true-false",
  "topic": "TCP",
  "question": "TCP is connection-oriented.",
  "correctAnswer": true,
  "explanation": "TCP establishes a connection before exchanging data.",
  "source": { "module": "Module 3", "page": 8 }
}
```

### Fill in the blank

Accepted answers are explicit. Matching trims whitespace and ignores capitalization; it does not use fuzzy matching.

```json
{
  "id": "q004",
  "type": "fill-blank",
  "topic": "DHCP",
  "question": "The protocol used to automatically assign IP addresses is _____.",
  "acceptedAnswers": ["DHCP", "Dynamic Host Configuration Protocol"],
  "explanation": "DHCP provides automatic IP configuration.",
  "source": { "module": "Module 3", "page": 16 }
}
```

## Author checklist

- [ ] IDs are unique.
- [ ] Every question has a useful explanation.
- [ ] Every question includes source metadata.
- [ ] Correct answers exist in the provided choices.
- [ ] Multiple-answer sets contain no duplicates.
- [ ] Fill-blank `acceptedAnswers` is not empty.
- [ ] The reviewer has at least one question.
- [ ] `npm test`, `npm run lint`, and `npm run build` pass.
