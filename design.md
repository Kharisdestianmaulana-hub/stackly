## Overview

Stackly is a modern local development control panel for running and managing a PHP-based local server stack with a cleaner experience than traditional XAMPP-style tools. The product focuses on clarity, stability, and beginner-friendly control for Apache, MySQL, PHP, and phpMyAdmin.

The interface uses a premium dark dashboard style with deep navy surfaces, soft blue highlights, green service-status indicators, rounded cards, minimal text, and clear action buttons. The app should feel like a professional developer utility: simple enough for beginners, but polished enough for serious local development.

The design direction is not to copy XAMPP visually. XAMPP feels old, crowded, and technical. Stackly should feel modern, calm, and helpful. The main dashboard must immediately answer four questions:

- Is the local server running?
- Which services are active?
- Which ports are being used?
- Where can I open localhost, phpMyAdmin, htdocs, logs, and backup?

### Key Characteristics

- Dark modern desktop dashboard with blue, teal, and green accents.
- Minimal wording; most actions use short labels and icons.
- Card-based service controls for Apache, MySQL, PHP, and phpMyAdmin.
- Clear status badges: Running, Stopped, Ready, Error.
- Human-friendly error messages, not raw technical confusion.
- Rounded cards and buttons to make the app feel softer and easier than XAMPP.
- Sidebar-based navigation with Dashboard, Services, Projects, DB, Logs, and Settings.
- Bottom log panel for server activity, but kept compact and readable.
- Designed first for macOS and Linux desktop workflows. Windows is optional/future support and should not drive MVP decisions.


## Platform Direction

Stackly is **macOS + Linux first**. The MVP should be designed around Unix-like desktop workflows instead of Windows Service behavior. Windows support can be added later, but the first implementation should prioritize the environments the user actually uses.

### Primary Platforms

- **macOS**: primary development target. The app should feel native enough for macOS users, support `.app` / `.dmg` packaging later, and avoid Windows-only assumptions.
- **Linux**: secondary primary target. The app should support common desktop distributions through AppImage or `.deb` packaging later.

### Runtime Strategy

- Services should be controlled as child processes from the app during MVP.
- Avoid Windows-specific service management in the first version.
- Avoid hardcoded `.exe` paths. Use platform-aware binary resolution.
- Paths should support `/Applications`, `/usr/local`, `/opt/homebrew`, `/usr/bin`, and app-bundled runtime folders.
- macOS Apple Silicon and Intel paths should both be considered.
- Linux distributions may have Apache, MySQL/MariaDB, and PHP installed through system package managers; Stackly should be able to detect existing binaries before requiring bundled runtimes.

### Platform-Aware Labels

Use neutral labels in the UI:

- Use `Open Web Root` instead of Windows-specific `Open htdocs` when appropriate.
- Use `Runtime Path`, `Config Path`, and `Data Path` instead of Windows-style folder examples.
- Avoid showing `C:\...` paths in default UI copy. Use examples like `~/Sites`, `~/Stackly`, `/usr/local/var`, or `/opt/stackly`.

## Colors

### Brand & Accent

- **Primary Blue** (`{colors.primary-blue}` — #2563EB): Main active navigation color, primary button background, selected menu item, and important interactive highlights.
- **Electric Blue** (`{colors.electric-blue}` — #38BDF8): Used for icons, focus states, active borders, and decorative server-light details.
- **Teal Accent** (`{colors.teal}` — #14B8A6): Used for phpMyAdmin action, open buttons, active service accents, and secondary positive states.
- **Success Green** (`{colors.success}` — #22C55E): Used for Running badges, OK statuses, healthy indicators, and operational dots.
- **Warning Amber** (`{colors.warning}` — #F59E0B): Used for port warnings, pending setup, and caution states.
- **Danger Red** (`{colors.danger}` — #EF4444): Used for Stop buttons, service errors, and failed startup states.

### Surface

- **App Background** (`{colors.app-bg}` — #050B14): Main application canvas.
- **Sidebar Background** (`{colors.sidebar}` — #07111F): Left navigation surface.
- **Top Bar Background** (`{colors.topbar}` — #08111E): Header and window-control area.
- **Card Background** (`{colors.card}` — #0D1B2E): Default dashboard card surface.
- **Card Elevated** (`{colors.card-elevated}` — #11233A): Nested card and quick-action tile surface.
- **Input Background** (`{colors.input}` — #0A1626): Search field and input surface.
- **Log Background** (`{colors.log-bg}` — #07101C): Server log terminal panel.

### Borders & Dividers

- **Border Soft** (`{colors.border-soft}` — #1D314A): Default card borders and subtle dividers.
- **Border Strong** (`{colors.border-strong}` — #2B4566): Focused cards, active panels, and selected row borders.
- **Glow Blue** (`{colors.glow-blue}` — rgba(37, 99, 235, 0.35)): Soft glow behind active dashboard elements.
- **Glow Green** (`{colors.glow-green}` — rgba(34, 197, 94, 0.28)): Soft glow for healthy service states.

### Text

- **Text Primary** (`{colors.text-primary}` — #F8FAFC): Main labels, headings, active text.
- **Text Secondary** (`{colors.text-secondary}` — #CBD5E1): Supporting text, service details, log messages.
- **Text Muted** (`{colors.text-muted}` — #64748B): Metadata, timestamps, inactive labels.
- **Text Disabled** (`{colors.text-disabled}` — #475569): Disabled buttons and unavailable services.

### Semantic Status

- **Running** (`{colors.status-running}` — #22C55E): Service is active.
- **Ready** (`{colors.status-ready}` — #3B82F6): Service is installed and available.
- **Stopped** (`{colors.status-stopped}` — #94A3B8): Service is not running.
- **Error** (`{colors.status-error}` — #EF4444): Service failed or port conflict occurred.
- **Warning** (`{colors.status-warning}` — #F59E0B): Service requires attention but is not broken.

## Typography

### Font Family

The app uses **Inter** as the primary font because it is modern, readable, open-source, and works well in desktop dashboards. The fallback stack should be:

`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`

For the server log and technical output, use a monospaced font:

`JetBrains Mono, "Fira Code", Consolas, "Courier New", monospace`

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---:|---:|---:|---:|---|
| `{typography.display-md}` | 28px | 700 | 1.2 | -0.3px | Main dashboard title |
| `{typography.title-lg}` | 20px | 700 | 1.3 | -0.2px | Section title, page title |
| `{typography.title-md}` | 18px | 600 | 1.35 | 0 | Service card title |
| `{typography.title-sm}` | 16px | 600 | 1.4 | 0 | Panel title, sidebar brand |
| `{typography.body-md}` | 15px | 400 | 1.5 | 0 | Default body and labels |
| `{typography.body-sm}` | 14px | 400 | 1.45 | 0 | Service detail, sidebar items |
| `{typography.caption}` | 12px | 400 | 1.4 | 0 | Metadata, timestamps, footer status |
| `{typography.badge}` | 12px | 600 | 1.2 | 0 | Running, Ready, Error badges |
| `{typography.button}` | 14px | 600 | 1.0 | 0 | Button labels |
| `{typography.log}` | 13px | 400 | 1.55 | 0 | Server log text |

### Principles

The UI should use short, direct labels. Avoid long paragraphs inside the dashboard. Users should understand the server state through layout, color, icon, and short status text.

Recommended labels:

- Use “Running”, not “The service is currently running”.
- Use “Port 3306”, not “Database server is listening on port 3306”.
- Use “Open”, not “Open phpMyAdmin in browser”.
- Use “Backup”, not “Create database backup now”.

## Layout

### Spacing System

- **Base unit:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px.
- **Window padding:** 24px inside the main dashboard area.
- **Card gap:** 16px between service cards.
- **Panel gap:** 16px between dashboard panels.
- **Card padding:** 18px to 20px.
- **Sidebar item gap:** 8px.
- **Button gap:** 8px.

### App Shell

The app uses a three-part desktop shell:

1. **Top Bar** — app title, search field, theme toggle, and window controls.
2. **Left Sidebar** — primary navigation and system status.
3. **Main Content** — current page content, dashboard cards, logs, and panels.

Recommended desktop dimensions:

- Minimum window width: 1180px.
- Ideal window width: 1360px to 1440px.
- Minimum window height: 760px.
- Ideal window height: 900px.

### Grid & Container

- Dashboard top row uses a 4-column card grid on desktop.
- Middle dashboard row uses a 3-column grid: Quick Actions, System Health, Recent Projects.
- Server Log spans the full width below the middle row.
- Sidebar width should be around 260px.
- Top bar height should be around 64px.

### Whitespace Philosophy

Stackly should feel cleaner than XAMPP by reducing clutter. Whitespace should separate service groups clearly. Avoid cramming too many technical details into one card.

Each service card should show only:

- Icon
- Service name
- Status badge
- One short detail line
- Primary action buttons
- Secondary config/log buttons

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Base | `{colors.app-bg}` background | Main app canvas |
| Surface | `{colors.card}` with 1px border | Dashboard cards and panels |
| Elevated | `{colors.card-elevated}` with subtle border | Buttons, quick actions, nested tiles |
| Active | Blue or green top border + soft glow | Running service cards, active nav |
| Critical | Red border or red-tinted button | Stop buttons, error state |

The app should use subtle depth, not heavy shadows. Most depth comes from contrast between dark surfaces, borders, and glow accents.

### Decorative Depth

- **Service Accent Line** (`{component.service-accent-line}`): A 2px to 3px line at the top of each service card. Green for running, blue for ready, red for error.
- **Soft Glow** (`{effect.soft-glow}`): Used only behind active cards, not everywhere.
- **Server Illustration** (`{component.server-illustration}`): Small decorative illustration in the dashboard header. It should not distract from controls.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---:|---|
| `{rounded.none}` | 0px | Rare; only for terminal blocks if needed |
| `{rounded.xs}` | 6px | Tiny badges and small chips |
| `{rounded.sm}` | 8px | Small buttons and inputs |
| `{rounded.md}` | 12px | Service cards and panels |
| `{rounded.lg}` | 16px | Main containers and status cards |
| `{rounded.xl}` | 20px | App window and large panels |
| `{rounded.full}` | 9999px | Status dots, pills, circular icon buttons |

### Shape Principles

Unlike XAMPP, the app should not feel boxy and old. Rounded corners help make the product feel more beginner-friendly, calmer, and modern. Use consistent radius across similar components.

## Components

### App Window

**`app-window`** — Main desktop frame with rounded `{rounded.xl}` corners, dark background, and subtle outer shadow. The app should feel like a native desktop utility, not a website opened in a browser.

### Top Bar

**`top-bar`** — 64px tall header. Contains app logo, app name, search input, theme icon, and window controls. Background uses `{colors.topbar}` with a bottom border `{colors.border-soft}`.

### Sidebar

**`sidebar`** — Fixed-width navigation area. Background `{colors.sidebar}`. Contains the logo/title at top, navigation items, and a small bottom status card.

**`sidebar-item`** — Navigation row with icon and label. Height around 48px, rounded `{rounded.sm}`. Default text uses `{colors.text-secondary}`.

**`sidebar-item-active`** — Active navigation row. Background `{colors.primary-blue}` with subtle glow. Text uses `{colors.text-primary}`.

### Search Input

**`search-input`** — Compact command/search field in the top bar. Background `{colors.input}`, border `{colors.border-soft}`, rounded `{rounded.sm}`, height 40px. Placeholder example: “Search (Ctrl + K)”.

### Service Card

**`service-card`** — Main card used for Apache, MySQL, PHP, and phpMyAdmin. Background `{colors.card}`, border `{colors.border-soft}`, rounded `{rounded.md}`, padding 20px.

Each service card contains:

- Service icon
- Service name
- Status badge
- Short detail line
- Primary action row
- Secondary action row

### Service Status Badge

**`status-badge-running`** — Green pill badge. Used when Apache or MySQL is active.

**`status-badge-ready`** — Blue pill badge. Used when PHP or phpMyAdmin is available.

**`status-badge-stopped`** — Gray pill badge. Used when a service is installed but not active.

**`status-badge-error`** — Red pill badge. Used when service startup fails.

### Buttons

**`button-primary`** — Main action button. Blue or teal background, white text, rounded `{rounded.sm}`. Used for actions like Open, Start, Restart.

**`button-danger`** — Red-tinted button. Used for Stop. Should be visible but not overly aggressive.

**`button-secondary`** — Dark elevated button with border. Used for Config, Logs, Open Folder.

**`button-icon`** — Icon-only or icon-leading button. Used for compact controls and window-style actions.

### Quick Actions Panel

**`quick-actions-panel`** — Middle-row panel containing four shortcut tiles:

- Localhost
- phpMyAdmin
- htdocs
- Backup

The labels must stay short. Each tile should use a clear icon and one label only.

### System Health Panel

**`system-health-panel`** — Shows a compact list of health checks:

- 80 OK
- 3306 OK
- PHP OK
- Storage OK

Use green dots for healthy items. Use amber for warning and red for error.

### Recent Projects Panel

**`recent-projects-panel`** — Shows recently opened local projects inside htdocs. Each row contains folder icon, project name, small timestamp, and overflow menu.

Example rows:

- portfolio-site
- toko-online
- belajar-php

### Server Log Panel

**`server-log-panel`** — Bottom full-width log viewer. Background `{colors.log-bg}` with monospaced text. Keep the visible log short. The panel should help users understand what happened without overwhelming them.

Example messages:

- `[Apache] Started on port 80.`
- `[MySQL] Started on port 3306.`
- `[PHP] PHP 8.2 ready.`
- `[System] All systems operational.`

### Error Helper

**`error-helper`** — Friendly explanation panel shown when startup fails. This is one of the app's most important differentiators from XAMPP.

Example:

**Problem:** Port 3306 is already used.  
**Suggestion:** Use port 3307 or stop the other MySQL service.

Actions:

- Use 3307
- Retry
- View Details

### Settings Page

**`settings-page`** — Configuration area for default ports, startup behavior, theme, app path, and backup settings.

Recommended settings:

- Apache port
- MySQL port
- phpMyAdmin port
- Auto-start services
- Default htdocs folder
- Backup location
- Theme mode

### Databases Page

**`databases-page`** — Optional future page for showing database list, backup, restore, import, and export actions. Keep it simple; advanced database editing should still be handled by phpMyAdmin.

## Do's and Don'ts

### Do

- Keep the dashboard simple and readable.
- Use short labels and clear icons.
- Make service status obvious at a glance.
- Check ports before starting services.
- Translate technical errors into human-friendly explanations.
- Keep Stop buttons visually distinct from Start/Open buttons.
- Use green only for healthy/running states.
- Use red only for stop, error, and failed states.
- Keep log output compact by default.
- Make localhost, phpMyAdmin, htdocs, and backup easy to access.

### Don't

- Don't overload the dashboard with long descriptions.
- Don't show raw error logs as the first explanation.
- Don't make every button the same color.
- Don't use too many service details inside cards.
- Don't make the UI look like a terminal-only tool.
- Don't copy XAMPP's old layout directly.
- Don't hide port conflicts from the user.
- Don't use green for buttons that stop or delete something.
- Don't make phpMyAdmin require manual URL typing.
- Don't place advanced settings on the main dashboard.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Compact Desktop | < 1100px | Service cards become 2 columns; recent projects can move below health panel |
| Standard Desktop | 1100–1440px | Full dashboard layout; 4 service cards in one row |
| Wide Desktop | > 1440px | Same layout with wider spacing and larger log panel |

### Desktop First

Stackly is a desktop utility first. The design does not need a mobile layout for version 1. However, the layout should still handle smaller laptop screens gracefully.

### Collapsing Strategy

- Service card grid collapses from 4 columns to 2 columns.
- Middle panels collapse from 3 columns to 1 or 2 columns.
- Sidebar can collapse to icon-only mode on compact screens.
- Server Log remains full-width.
- Search field can shrink or hide placeholder text.

### Touch Targets

Even though this is a desktop app, all buttons should remain comfortable:

- Primary buttons: minimum 40px height.
- Sidebar items: minimum 44px height.
- Quick action tiles: minimum 80px height.
- Icon buttons: minimum 36px × 36px.

## Interaction States

### Default

Controls appear calm, dark, and readable. Status is visible but not noisy.

### Hover

Hover increases border brightness slightly and may raise the surface one level. Avoid large movement or flashy animation.

### Active / Pressed

Pressed buttons slightly darken. Service actions should feel responsive and immediate.

### Loading

When starting a service, show a small spinner or “Starting” badge. Disable repeated clicks until the process finishes.

### Error

Error state should show:

- Red badge on affected service.
- Short problem summary.
- Suggested fix.
- Button to view technical details.

### Success

Success state should show:

- Green status badge.
- Short log line.
- Optional toast: “MySQL started.”

## Motion

Motion should be subtle and functional.

Recommended motion:

- Button hover: 120ms ease-out.
- Card hover: 160ms ease-out.
- Status badge change: 180ms ease-in-out.
- Toast enter/exit: 200ms ease-out.
- Sidebar active indicator: 180ms ease-in-out.

Avoid playful or bouncy animation. This is a developer utility, so motion should feel stable and precise.

## Accessibility

- Maintain strong contrast between text and dark surfaces.
- Do not rely on color alone; pair status color with status text.
- Buttons must have readable labels.
- Critical states should include icons and text.
- Keyboard navigation should support sidebar, service cards, buttons, and search.
- Focus rings should use `{colors.electric-blue}`.
- Log text should remain readable at small sizes.

## Content Guidelines

### Voice

The app speaks like a helpful developer tool: short, direct, calm, and clear.

Good examples:

- “MySQL started.”
- “Port 3306 is already used.”
- “Use port 3307?”
- “Backup created.”
- “Apache failed to start.”

Avoid:

- “An unexpected fatal exception has occurred.”
- “Unable to bind socket due to unknown system process.”
- “The service cannot be initialized because the port is occupied by another daemon.”

### Error Message Pattern

Use this format:

1. Problem
2. Cause
3. Suggested fix
4. Action buttons

Example:

**Problem:** MySQL cannot start.  
**Cause:** Port 3306 is already used.  
**Fix:** Stop the other MySQL service or use port 3307.  
**Actions:** Use 3307 · Retry · View Log

## Product Pages

### Dashboard

Main overview page. Shows service cards, quick actions, health status, recent projects, and server log.

### Services

Detailed service management page. Shows Apache, MySQL, PHP, and phpMyAdmin with more advanced controls.

### Projects

Local project manager for htdocs. Users can open folders, open localhost paths, and create new PHP project folders.

### DB

Simple database utility page. Users can backup, restore, import, export, and open phpMyAdmin.

### Logs

Dedicated log viewer for Apache, MySQL, PHP, phpMyAdmin, and system messages.

### Settings

App configuration page for ports, paths, theme, startup, and backups.

## MVP Scope

### Version 1 Must Have

- Start Apache
- Stop Apache
- Start MySQL
- Stop MySQL
- Start phpMyAdmin server
- Open phpMyAdmin
- Open localhost
- Open htdocs folder
- Port checker
- Compact server log
- Basic settings for ports

### Version 1 Should Have

- Restart service
- Config shortcut
- Logs shortcut
- Backup database shortcut
- Friendly error helper
- Recent projects list

### Version 1 Not Needed Yet

- Multiple PHP versions
- Built-in SQL editor
- Advanced virtual host manager
- Team sync
- Cloud backup
- Plugin system
- Full database table viewer

## Future Features

- PHP version switcher.
- MySQL/MariaDB version switcher.
- One-click Laravel project setup.
- Virtual host manager.
- Automatic database backup schedule.
- Import/export `.sql` from the app.
- Service health diagnostics.
- Auto-fix port conflict.
- Portable mode.
- Dark and light theme.
- Extension/plugin system.

## Iteration Guide

1. Start with the Dashboard page only.
2. Build service cards first: Apache, MySQL, PHP, phpMyAdmin.
3. Add real status detection before adding advanced settings.
4. Add port checker early because it is the main anti-error feature.
5. Keep all labels short unless the user opens an error detail panel.
6. Do not add too many features to the first screen.
7. Add Logs and Settings after the main service control works.
8. Make error messages beginner-friendly before adding advanced developer tools.
9. Use design tokens for colors, spacing, radius, and typography.
10. Every new feature should answer: does this make local development easier than XAMPP?

## Known Gaps

- The first design version focuses only on desktop layout.
- The app does not yet define full light mode.
- Multi-version PHP switching is not included in MVP.
- MySQL installation and initialization flow needs separate technical documentation.
- Build packaging for macOS `.dmg` / `.app` and Linux AppImage or `.deb` needs a dedicated implementation guide.
- phpMyAdmin configuration needs a separate security note for production-like usage.
- Database backup and restore UI needs more detailed flow in a later version.
