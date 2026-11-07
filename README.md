# Scholar Compass (Grantly)

Scholarship discovery and tracking, built with React 18, TypeScript and Vite.

- **Discover:** profile-based match score (level, field, GPA, region), search, filters, sorting.
- **Tracker:** deadline runway, status columns, document checklist, notes. Saved in localStorage with validation on load.
- **Plan:** funding goal progress, readiness score, deadline radar, calendar (.ics) export with reminders, JSON backup and restore.
- **Power tools:** compare up to 3 scholarships, Ctrl+K command palette, shareable filter URLs, undo toasts.
- **Quality:** reducer + context state, memoised cards, deferred search, input sanitisation, CSP, native `<dialog>` (focus trap, Esc), skip link, ARIA labels, `/` shortcut, dark mode, reduced motion.

```bash
npm install
npm run dev     # local
npm test        # Vitest + Testing Library
npm run build   # type-check + production build
```

Deploy: push to a public GitHub repo, import it on Vercel (framework: Vite).
