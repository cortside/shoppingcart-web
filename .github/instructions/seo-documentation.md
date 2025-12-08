---
description: SEO and content best practices for documentation
applyTo: '**/*.md'
---

# SEO and Content Best Practices for Documentation

These rules ensure documentation is clear, discoverable, and valuable to readers.

## Content Structure

### Titles and Headings

**Must:**
- Include descriptive, specific titles that reflect the page's main topic
- Use first-level heading (`#`) that matches or complements the title
- Create clear heading hierarchy (don't skip levels: h1 → h2 → h3)
- Make headings descriptive of the content that follows

**Example:**
```markdown
# Memory Bank System

## Why Use the Memory Bank?

### Core Files (Required)

#### 1. projectbrief.md
```

### Introduction and Summary

**Should:**
- Include a brief summary or introduction at the start
- Capture the primary value of the page in the first paragraph
- Answer "why should I read this?" within the first few lines
- Use the introduction to set context

**Example:**
```markdown
# Custom Agents

GitHub Copilot custom agents enable you to configure AI for specific development 
roles and tasks. This guide explains how to create and use custom agents to 
improve your development workflow.
```

## Scannability

### Short Paragraphs

**Must:**
- Keep paragraphs short (2-4 sentences ideal)
- One idea per paragraph
- Use line breaks between paragraphs for visual separation

**Bad:**
```markdown
The Memory Bank is a system for maintaining context. It uses multiple files 
that build on each other. You should update it regularly. It helps with 
onboarding and ensures consistency. The files are stored in markdown format.
```

**Good:**
```markdown
The Memory Bank is a system for maintaining project context across sessions.

It uses multiple markdown files that build on each other in a clear hierarchy. 
Each file serves a specific purpose.

Update the Memory Bank regularly as you work to ensure it stays current and 
useful for the entire team.
```

### Bullet Points and Lists

**Should:**
- Use bullets for unordered lists of related items
- Use numbered lists for sequential steps or ordered items
- Keep list items parallel in structure
- Consider sub-lists for complex information

**Example:**
```markdown
## When to Update

Update the Memory Bank when:

1. **Starting new work**: Update activeContext.md and progress.md
2. **Discovering patterns**: Document in systemPatterns.md
3. **Making decisions**: Update systemPatterns.md and techContext.md
4. **Completing features**: Update progress.md and activeContext.md
```

### Visual Hierarchy

**Must:**
- Use headings to break up content
- Use formatting (bold, italic, code) to emphasize key points
- Use code blocks for code examples
- Use blockquotes for important notes or warnings

**Example:**
```markdown
## Critical Rules

**Must:**
- Always print `# Mode: SOLUTION` at the beginning
- Output the full solution in every response

> **Warning**: Do not move to planning until user acknowledges understanding
```

## Internal Linking

### Link to Related Content

**Should:**
- Link to related documentation where helpful
- Use descriptive link text (not "click here")
- Link to specific sections when relevant
- Cross-reference between related pages

**Bad:**
```markdown
For more information, click [here](./memory-bank.md).
```

**Good:**
```markdown
See the [Memory Bank System](./memory-bank.md#core-files-required) for 
details on required files.
```

### Navigation

**Should:**
- Include "Related Resources" or "See Also" sections
- Link back to parent/overview pages
- Create breadcrumb navigation in complex doc structures
- Provide next steps or recommended reading

**Example:**
```markdown
## Related Resources

- [Custom Agents Overview](./README.md)
- [Memory Bank System](../instructions/memory-bank.md)
- [Creating Your First Agent](./getting-started.md)
```

## Content Quality

### Avoid Keyword Stuffing

**Must:**
- Write naturally for human readers
- Don't repeat keywords unnaturally
- Focus on clarity and value, not SEO tricks
- Use synonyms and varied language

**Bad:**
```markdown
Custom agents are great. Custom agents help you work better. Use custom 
agents for custom workflows. Custom agents make development easier.
```

**Good:**
```markdown
Custom agents help you work more efficiently by providing specialized 
configurations for different tasks. They streamline your workflow and 
ensure consistency.
```

### Evergreen Content

**Should:**
- Write content that won't quickly become outdated
- Avoid specific version numbers unless necessary
- Use relative time references sparingly
- Suggest updates when information becomes outdated
- Date-stamp documentation when timeliness matters

**Example:**
```markdown
<!-- Bad -->
As of December 2025, custom agents use the .agent.md format.

<!-- Good -->
Custom agents use the .agent.md format. (VS Code 1.106+)

<!-- Best for time-sensitive content -->
**Last Updated**: December 8, 2025

Custom agents use the .agent.md format as of VS Code 1.106.
```

## Code Examples

### Code Blocks

**Must:**
- Use proper code fencing with language identifiers
- Include context for code examples
- Show both bad and good examples when teaching
- Test code examples to ensure they work

**Example:**
````markdown
Configure the custom agent with YAML frontmatter:

```yaml
---
description: Generate an implementation plan
name: TaskPlanner
tools: ['search', 'fetch', 'usages']
---
```
````

## Accessibility

### Clear Language

**Should:**
- Use plain language when possible
- Define technical terms on first use
- Avoid jargon unless audience expects it
- Explain acronyms

**Example:**
```markdown
The Memory Bank uses markdown (.md) files to store project context. Each file 
serves a specific purpose in documenting different aspects of the project.
```

### Semantic HTML (when applicable)

**Should:**
- Use proper markdown structure (translates to semantic HTML)
- Use tables for tabular data
- Use definition lists for term/definition pairs
- Use appropriate emphasis

## Documentation Checklist

Before publishing documentation:

- [ ] Clear, descriptive title and heading
- [ ] Introduction explains value and purpose
- [ ] Short paragraphs (2-4 sentences)
- [ ] Headings create clear hierarchy
- [ ] Bullets and lists for scannability
- [ ] Code examples with proper formatting
- [ ] Internal links to related content
- [ ] No keyword stuffing
- [ ] Evergreen content (or dated if time-sensitive)
- [ ] Tested code examples
- [ ] Clear, jargon-free language

## Remember

Good documentation is:
- **Scannable**: Easy to skim and find information
- **Clear**: Written for your audience's level
- **Structured**: Logical organization and hierarchy
- **Valuable**: Answers questions and solves problems
- **Discoverable**: Easy to find through search and navigation
- **Evergreen**: Remains useful over time

Write for humans first, search engines second. Focus on providing value, and the rest follows naturally.
