# Custom Agents for Development Workflow

The `agents` directory contains custom GitHub Copilot agents that provide a structured workflow for software development projects.

## Overview

The custom agents implement a four-phase development methodology:

1. **Solution Architect** - Understand and define the solution
2. **Task Planner** - Create detailed implementation plans
3. **Implementer** - Execute the plan and make code changes
4. **Cleaner** - Review and ensure best practices

Each agent has specific responsibilities, tools, and automatically hands off to the next agent in the workflow.

## Available Agents

### 🎯 Solution Architect (`@SolutionArchitect`)

**Purpose**: Apply Heidegger's hermeneutic circle to deeply understand and define solutions.

**Tools**: Read-only (search, fetch, usages, githubRepo)

**Use when**:
- Starting a new feature or task
- Need to understand requirements
- Exploring solution approaches
- Clarifying user needs

**Behavior**:
- Engages in iterative dialogue to understand the whole from the parts
- Asks clarifying questions
- Outputs complete solution in every response
- Stays in this mode until user acknowledges understanding
- Automatically hands off to Task Planner when ready

**Example Usage**:
```
@SolutionArchitect I need to add user authentication to the app
```

---

### 📋 Task Planner (`@TaskPlanner`)

**Purpose**: Apply teleological planning to create detailed, actionable implementation plans.

**Tools**: Read-only (search, fetch, usages, githubRepo)

**Use when**:
- Solution is clear and you need a plan
- Want to break down work into steps
- Need to identify dependencies and risks
- Want to estimate complexity

**Behavior**:
- Creates comprehensive implementation plans
- Researches codebase for context
- Identifies affected files and components
- Outputs full plan in every response
- Does NOT make code changes
- Automatically hands off to Implementer when approved

**Example Usage**:
```
@TaskPlanner (or use handoff button from Solution Architect)
```

---

### ⚙️ Implementer (`@Implementer`)

**Purpose**: Execute the approved plan and make code changes.

**Tools**: All tools (full editing capabilities)

**Use when**:
- Plan is approved and ready to implement
- Need to make code changes
- Ready to execute tasks

**Behavior**:
- Follows the approved plan precisely
- Makes incremental, logical changes
- Reports progress as work proceeds
- Tests changes when possible
- Makes actual code modifications
- Automatically hands off to Cleaner when complete

**Example Usage**:
```
@Implementer (or use handoff button from Task Planner)
```

---

### 🧹 Cleaner (`@Cleaner`)

**Purpose**: Review changes holistically and ensure they follow best practices.

**Tools**: All tools (read + edit to fix issues)

**Use when**:
- Implementation is complete
- Need code review
- Want to ensure quality and best practices
- Ready to verify production-readiness

**Behavior**:
- Comprehensive code review (quality, security, performance)
- Checks consistency and adherence to standards
- Fixes issues found during review
- Can make improvements and optimizations
- Automatically hands off back to Solution Architect when done

**Example Usage**:
```
@Cleaner (or use handoff button from Implementer)
```

## Workflow Cycle

The agents form a complete development cycle:

```
┌─────────────────────┐
│  Solution Architect │ ─┐
│  (Understand)       │  │
└─────────────────────┘  │
          ↓              │
┌─────────────────────┐  │
│   Task Planner      │  │
│   (Plan)            │  │  Complete
└─────────────────────┘  │  Development
          ↓              │  Cycle
┌─────────────────────┐  │
│   Implementer       │  │
│   (Build)           │  │
└─────────────────────┘  │
          ↓              │
┌─────────────────────┐  │
│   Cleaner           │  │
│   (Review & Fix)    │ ─┘
└─────────────────────┘
```

## Using the Agents

### Starting a New Task

1. Switch to `@SolutionArchitect` and describe your task
2. Engage in dialogue until the solution is clear
3. Click the **"Create Implementation Plan"** handoff button
4. Review and refine the plan with `@TaskPlanner`
5. Click the **"Start Implementation"** handoff button
6. Let `@Implementer` execute the plan
7. Automatically transitions to `@Cleaner` for review
8. Cycle repeats for next task

### Manual Mode Switching

You can also switch agents manually:

```
@SolutionArchitect how should we handle user sessions?
@TaskPlanner create a plan for implementing session management
@Implementer execute the session management plan
@Cleaner review the session management implementation
```

### Mode Headers

Each agent prints an explicit mode header at the start of responses:

- `# Mode: SOLUTION`
- `# Mode: PLAN`
- `# Mode: ACT`
- `# Mode: CLEAN`

This makes it clear which agent is responding.

## Supporting Resources

### Custom Instructions

The agents reference custom instructions in `.github/instructions/`:

- **memory-bank.md**: System for maintaining project context
- **seo-documentation.md**: Best practices for documentation

### Memory Bank Integration

All agents work with the Memory Bank system to maintain context:

- Solution Architect reads Memory Bank for context
- Task Planner updates activeContext.md with plans
- Implementer documents patterns discovered
- Cleaner verifies implementation matches documented patterns

See [Memory Bank documentation](../instructions/memory-bank.md) for details.

## Agent Handoffs

Handoffs are configured with `send: true`, meaning they automatically submit when you click the button. This creates a seamless workflow where you:

1. Work with one agent until its task is complete
2. Click the handoff button
3. Next agent automatically takes over with context

## Best Practices

### When to Use Each Agent

**Use Solution Architect when**:
- Requirements are unclear
- Multiple approaches possible
- Need to explore options
- Starting from scratch

**Use Task Planner when**:
- Solution is defined but needs structure
- Want to break down complex work
- Need to identify dependencies
- Want to estimate work

**Use Implementer when**:
- Plan is approved
- Ready to make changes
- Need to execute specific tasks
- Clear what to build

**Use Cleaner when**:
- Implementation complete
- Need quality check
- Want to ensure best practices
- Ready for production

### Tips for Effective Use

1. **Don't skip phases**: Each agent has a purpose
2. **Trust the handoffs**: Let the workflow guide you
3. **Be explicit with Solution Architect**: Clear requirements = better plans
4. **Review plans carefully**: Catch issues before implementation
5. **Let Cleaner fix issues**: It has editing capabilities
6. **Update Memory Bank**: Keep context current

## Troubleshooting

### Agent not available?

Ensure `.agent.md` files are in `.github/agents/` directory.

### Handoff button not appearing?

Check that the target agent exists and handoff configuration is correct.

### Agent not following instructions?

Verify the agent definition file has correct YAML frontmatter and instructions.

### Need to switch agents manually?

Use `@AgentName` syntax in chat to switch without handoffs.

## Converting from Cursor Rules

These agents replace the previous Cursor rules system:

| Cursor Rule | Custom Agent | Status |
|-------------|--------------|--------|
| `core.mdc` (SOLUTION mode) | `solution-architect.agent.md` | ✅ Converted |
| `core.mdc` (PLAN mode) | `task-planner.agent.md` | ✅ Converted |
| `core.mdc` (ACT mode) | `implementer.agent.md` | ✅ Converted |
| `core.mdc` (CLEAN mode) | `cleaner.agent.md` | ✅ Converted |
| `memory-bank.mdc` | `../instructions/memory-bank.md` | ✅ Converted |
| `seo-docs.mdc` | `../instructions/seo-documentation.md` | ✅ Converted |
| `cursor-rules.mdc` | (Dropped - VS Code handles precedence) | ✅ Removed |

## Additional Resources

- [VS Code Custom Agents Documentation](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [GitHub Copilot Chat Documentation](https://docs.github.com/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- [Custom Instructions Documentation](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)

---

**Last Updated**: December 8, 2025  
**Version**: 1.0.0  
**Migration from**: Cursor rules (`.cursor/rules/`)
