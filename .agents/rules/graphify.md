# Graphify Codebase Exploration Rule

When researching, inspecting, or looking through files, functions, types, routes, or architecture across this project:
1. ALWAYS run `graphify query "<topic or identifier>"` first to discover relevant files, dependencies, call hierarchies, and AST nodes.
2. Use `graphify path "<A>" "<B>"` to trace connections between components, and `graphify explain "<concept>"` for focused concepts.
3. Only after querying graphify should specific files be opened or edited.
4. After any code modifications, always run `graphify update .` to keep the knowledge graph up to date.
