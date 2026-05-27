name: Bug Report
description: Create a report to help us improve the SDK
title: "[BUG] "
labels: ["bug"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: bug-description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is.
      placeholder: When I call `mitumba.auth.login()`, it throws an unexpected TypeError...
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to reproduce
      description: Steps to reproduce the behavior. Provide a code snippet if possible.
      placeholder: |
        1. Initialize client with...
        2. Call method...
        3. See error...
    validations:
      required: true
  - type: input
    id: environment
    attributes:
      label: Environment
      description: Where is the SDK running? (e.g., Next.js 15 Edge Runtime, Node.js 20, React Native)
    validations:
      required: true
