# Component-Based Architecture & Shared Code Policy

## Directives

1. **Component-First Design**:
   - All UI pages and views must be decomposed into modular, reusable, and single-responsibility components.
   - Avoid monolithic page files containing nested UI logic.

2. **Mandatory Reuse of Shared Logic & Components**:
   - Any function, utility, hook, or UI component shared across or needed by more than one page must be extracted to a centralized shared directory (e.g., `components/common/`, `components/shared/`, or `lib/utils/`).
   - Re-implementing, copy-pasting, or duplicating logic across pages is strictly forbidden.

3. **Line Count Limits**:
   - **All Files**: Every file in the project must strictly remain under **500 lines**.
   - **Component Files**: Component files must strictly adhere to **$\le$ 300 lines**.
