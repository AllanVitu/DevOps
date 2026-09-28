/* ==========================================================================
   PROFILE.JS — Everything on the homepage that is not a project: identity,
   parcours and stack. Edit here, then run `node tools/build.js`.
   ========================================================================== */

module.exports = {
    first: 'Allan',
    last: 'Vitu',
    status: 'Disponible — freelance & CDI',
    pitch: 'Je construis des apps web robustes, de l’architecture au pixel.',
    location: 'Mulhouse, France',
    avatar: 'media/avatar',

    /* Oldest first. `project` links a step to a project slug. */
    parcours: [
        { date: '2024 — 2025', title: 'Titre professionnel DWWM', org: 'Centre de Réadaptation de Mulhouse' },
        { date: 'Juin 2026', title: 'DevToolbox', org: 'Projet personnel', project: 'devtoolbox' },
        { date: 'Août 2026', title: 'BoxCraft', org: 'Serveur Minecraft', project: 'boxcraft' },
        { date: 'Août 2026', title: 'App', org: 'Nouveau dépôt', project: 'app' },
        { date: 'Aujourd’hui', title: 'Ouvert aux opportunités', org: 'Freelance & CDI' },
    ],

    /* The first group is highlighted on the homepage. */
    stack: [
        { group: 'Frontend', items: ['Vue 3', 'JavaScript', 'Vite', 'HTML / CSS', 'Tailwind'] },
        { group: 'Backend & data', items: ['PHP 8', 'MySQL', 'Node.js', 'NoSQL'] },
        { group: 'DevOps', items: ['Docker', 'CI/CD', 'Linux', 'GitHub Pages'] },
        { group: 'IA & outils', items: ['API Claude', 'PWA', 'Service Worker', 'Git'] },
    ],
};
