# Rasta project guidance

- Keep frontend coverage aligned with existing backend features and preserve endpoint contracts. Do not invent course features, an unban operation, or ban status absent from API responses.
- Use Persian, natural friendly copy and RTL layouts. Keep destructive consequences explicit, name affected users in confirmations, and explain self-demotion and self-deletion before submitting.
- Provide role-aware desktop and mobile navigation. Revalidate sessions through `/api/v1/auth/me`, protect admin screens using fresh server roles, and synchronize profile updates with session storage and visible UI.
- Keep the crisp digital workspace identity: cool surfaces, deep ink, cobalt accents, Vazirmatn typography, and restrained geometric navigation. Avoid decorative stars, sparkles, repeated line embellishments, and underscores in example copy. Preserve technically required or user-supplied underscores.
- Reuse the JavaScript shadcn components in `frontend/src/components/ui` and shared tokens. `frontend/components.json` configures RTL; keep menus, sheets, dialogs and keyboard interactions RTL-aware.
- Use the single themed react-hot-toast Toaster for errors, successes and pending mutations. Keep useful labels and instructions; avoid inline operation-status messages.
- Include loading, retry, empty and disabled-submit states. Preserve forms after failures; prevent duplicate mutations. Incorrect current passwords must not sign users out.
- Respect reduced motion, keep transitions short and accessible, manage dialog focus, and verify mobile and desktop layouts.
- Preserve pre-existing backend edits. Run the frontend production build, focused browser tests and backend session checks when relevant. Backend integration tests use in-memory model doubles, not a real MongoDB instance.
