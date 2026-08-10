/* ==========================================================================
   PROJECTS.JS — Single source of truth for the portfolio.

   `tier: 'featured'` puts a project in the main grid with a full case study.
   `tier: 'archive'` puts it in the compact list; its page is still built and
   stays online, it just does not compete for attention on the homepage.

   Order in this array drives numbering, grid order and prev/next paging.
   ========================================================================== */

module.exports = [
    /* ------------------------------------------------------------------ 01 */
    {
        slug: 'focus-brain',
        tier: 'featured',
        theme: 'cyan',
        name: 'FocusBrain',
        title: 'FocusBrain — Suite de productivité TDAH',
        flag: 'Case study',
        tagline: 'PWA Vue 3 offline-first, pensée pour les cerveaux TDAH',
        summary:
            "Bien plus qu'un gestionnaire de tâches : Brain Dump, Pomodoro adaptatif, suite projet complète, habits tracker et gamification. 100 % client-side.",
        intro:
            "FocusBrain combine capture instantanée des pensées, timers Focus adaptatifs, un vrai gestionnaire de projets (Kanban, tableur, UML, chat, mind maps), un habits tracker et des rapports hebdomadaires TDAH. Aucun backend : tout vit dans le navigateur, l'application est installable et fonctionne hors-ligne.",
        tags: ['Vue 3', 'Pinia', 'PWA', 'Workbox'],
        filters: ['vue', 'pwa'],
        meta: [
            ['Rôle', 'Conception produit & développement'],
            ['Type', 'PWA offline-first'],
            ['Backend', 'Aucun — 100 % client-side'],
        ],
        live: 'https://allanvitu.github.io/GestionnaireTDAH/#/',
        doc: 'aspect_technique_FocusBrain.html',
        media: 'focusbrain',
        cover: 'accueil-2',
        slides: [
            ['accueil-1', "FocusBrain — écran d'accueil"],
            ['accueil-2', 'FocusBrain — accueil, seconde vue'],
            ['vue-01', 'FocusBrain — tableau de bord'],
            ['vue-03', 'FocusBrain — vue projet'],
            ['vue-05', 'FocusBrain — planification'],
            ['vue-07', 'FocusBrain — suivi des habitudes'],
            ['vue-09', 'FocusBrain — statistiques'],
            ['vue-11', 'FocusBrain — paramètres'],
        ],
        specs: [
            ['brain', 'Brain Dump & Focus Pomodoro', "Capture sans friction (Entrée = valider) et timer SVG circulaire à 4 modes, son de fin en Web Audio API."],
            ['layout-dashboard', 'Suite projet intégrée', "Dashboard, Kanban, calendrier, chat, docs, tableur, éditeur Mermaid UML et mind maps sur canvas."],
            ['repeat-2', 'Habits tracker & rapports', "Streaks quotidiens et rapport hebdomadaire TDAH scoré de 0 à 100 avec insights contextualisés."],
            ['zap', 'Gamification & offline', "8 niveaux d'XP, 10 achievements, Service Worker Workbox, export/import par QR code."],
        ],
        narrative: {
            problem:
                "Les outils de productivité classiques supposent une attention linéaire : ils demandent de ranger avant de capturer. Pour un cerveau TDAH, cette friction suffit à faire perdre l'idée.",
            solution:
                "Séparer radicalement la capture du rangement. Le Brain Dump avale tout sans structure, et le tri se fait plus tard. Chaque module est un store Pinia indépendant persisté en localStorage, ce qui permet d'ajouter une brique sans toucher aux autres.",
            outcome:
                "Une suite de 12 vues principales et 9 sous-vues projet portées par 15 stores, installable et pleinement fonctionnelle hors-ligne, sans une ligne de backend.",
        },
        metrics: [
            ['15', 'Stores Pinia'],
            ['12', 'Vues principales'],
            ['9', 'Sous-vues projet'],
            ['4', 'Modes Pomodoro'],
            ['0', 'Backend'],
        ],
        features: [
            ['brain', 'Brain Dump',
                "Capture rapide d'idées sans friction — une zone de texte où Entrée valide. Les items sont convertibles en tâches via <code class=\"inline\">TaskModal</code>. Débloque l'achievement <code class=\"inline\">brain_dump</code> à la première utilisation.",
                ['braindump.js', 'TaskModal', '+XP']],
            ['timer', 'Focus Pomodoro',
                "Timer SVG circulaire à 4 modes : work (25 min), short break (5 min), long break (15 min) et custom. Persistance cross-navigation, sauvegarde toutes les 10 s, son de fin en Web Audio API (C5/E5/G5).",
                ['focus.js', 'Web Audio API', '+15 XP/session']],
            ['kanban', 'Suite projet complète',
                "Par projet : Kanban 3 colonnes, calendrier d'événements, chat (texte / images / GIF), arborescence de documents avec breadcrumb, tableur type Excel, éditeur Mermaid.js avec preview live et mind maps sur canvas SVG 2400×1600 à nœuds draggables.",
                ['projectTasks.js', 'projectChat.js', 'Mermaid.js']],
            ['repeat-2', 'Habits tracker',
                "Habitudes quotidiennes avec toggle emoji, streak, calcul de la meilleure série, mini calendrier 7 jours et suggestions TDAH. <code class=\"inline\">recalcStreak()</code> compte les jours consécutifs à rebours.",
                ['habits.js', 'completedDates[]', '+8 XP/toggle']],
            ['bar-chart-2', 'Rapport hebdomadaire TDAH',
                "Score calculé automatiquement (tâches × 3 + streak × 4 + pomodoros × 1,5 + habits × 5) avec labels contextuels. Plus de 10 insights : patterns d'énergie, mode urgence, milestones de streak, meilleure journée.",
                ['weeklyReport.js', 'Score 0–100', '10+ insights']],
            ['trophy', 'Gamification',
                "8 niveaux d'XP, 10 achievements, streaks journaliers et toasts auto-fermants. Scoring par priorité : urgent = 35 XP, high = 20, medium = 10, low = 5. Les unlocks se déclenchent depuis n'importe quel store.",
                ['gamification.js', '8 niveaux', '10 achievements']],
        ],
        stack: [
            ['Frontend', ['Vue 3', 'Composition API', 'Vue Router', 'Vite']],
            ['État & persistance', ['Pinia', 'LocalStorage', '15 stores découplés']],
            ['PWA', ['Workbox', 'Service Worker', 'Manifest installable']],
            ['Rendu spécialisé', ['Mermaid.js', 'Canvas SVG', 'Web Audio API']],
        ],
    },

    /* ------------------------------------------------------------------ 02 */
    {
        slug: 'devtoolbox',
        tier: 'featured',
        theme: 'indigo',
        name: 'DevToolbox',
        title: 'DevToolbox — 29 outils développeur, hors-ligne',
        flag: 'Offline',
        tagline: 'Boîte à outils du quotidien, 100 % dans le navigateur',
        summary:
            "29 outils développeur (JSON, Base64, JWT, QR…) et 11 leçons illustrées, entièrement hors-ligne et sans framework.",
        intro:
            "Une boîte à outils qui regroupe 29 utilitaires du quotidien — JSON Formatter, conversions JSON ↔ CSV/YAML/TypeScript, Base64, JWT Decoder, QR Code, Image → Base64 — et 11 leçons illustrées de code commenté. Tout tourne en local, avec une palette de recherche au clavier.",
        tags: ['Vanilla JS', 'PWA', 'Offline'],
        filters: ['vanilla', 'pwa'],
        meta: [
            ['Rôle', 'Conception & développement'],
            ['Type', 'PWA outil'],
            ['Dépendances', 'Aucune — Vanilla JS'],
        ],
        live: 'https://allanvitu.github.io/DevToolsBox/',
        media: 'devtoolbox',
        cover: 'outils',
        slides: [
            ['outils', 'DevToolbox — catalogue des outils'],
            ['apprendre', 'DevToolbox — section Apprendre'],
        ],
        specs: [
            ['wrench', '29 outils', "Formatage, conversion, encodage et sécurité, sans jamais quitter l'onglet."],
            ['wifi-off', '100 % hors-ligne', "PWA installable, tout s'exécute en local, aucune donnée ne quitte le navigateur."],
            ['graduation-cap', 'Section Apprendre', "11 leçons illustrées, de l'architecture projet jusqu'au SQL."],
        ],
        narrative: {
            problem:
                "Les outils en ligne équivalents demandent de coller son contenu sur un serveur tiers. Pour un JWT ou un payload d'API, ce n'est simplement pas acceptable.",
            solution:
                "Tout exécuter côté navigateur, sans dépendance ni requête réseau, et rendre l'ensemble installable en PWA. Une palette de recherche au clavier (Ctrl + K) remplace la navigation dans un menu de 29 entrées.",
            outcome:
                "Une boîte à outils utilisable dans l'avion comme derrière un réseau d'entreprise, où aucune donnée saisie ne sort de la machine.",
        },
        metrics: [
            ['29', 'Outils'],
            ['11', 'Leçons'],
            ['0', 'Requête réseau'],
            ['0', 'Dépendance'],
        ],
        stack: [
            ['Frontend', ['Vanilla JS', 'HTML', 'CSS moderne']],
            ['PWA', ['Service Worker', 'Manifest installable', 'Cache-first']],
            ['UX', ['Palette Ctrl + K', 'Navigation clavier']],
        ],
    },

    /* ------------------------------------------------------------------ 03 */
    {
        slug: 'questflow',
        tier: 'featured',
        theme: 'violet',
        name: 'QuestFlow',
        title: 'QuestFlow — Command center gamifié',
        flag: 'Gamification',
        tagline: 'Les tâches deviennent des quêtes',
        summary:
            "Gestionnaire de productivité gamifié : XP, niveaux, streaks, Kanban, mode Focus et heatmap d'activité.",
        intro:
            "Un gestionnaire de productivité qui transforme les tâches en quêtes : XP, niveaux, streaks et succès. Tableau Kanban, mode Focus Pomodoro, ludothèque et statistiques d'activité détaillées dans une interface command center.",
        tags: ['Vue 3', 'Gamification', 'PWA'],
        filters: ['vue', 'pwa'],
        meta: [
            ['Rôle', 'Conception & développement'],
            ['Type', 'PWA productivité'],
            ['Angle', 'Gamification'],
        ],
        live: 'https://allanvitu.github.io/QuestFlow/',
        media: 'questflow',
        cover: 'dashboard',
        slides: [
            ['dashboard', 'QuestFlow — tableau de bord'],
            ['focus', 'QuestFlow — mode Focus'],
            ['stats', 'QuestFlow — statistiques'],
        ],
        specs: [
            ['trophy', 'Gamification', "XP, niveaux, streaks et succès pour rendre la progression lisible."],
            ['timer', 'Mode Focus', "Minuteur Pomodoro intégré et sessions de concentration comptabilisées."],
            ['bar-chart-3', 'Statistiques', "Heatmap d'activité, XP par jour et répartition par priorité et par tag."],
        ],
        narrative: {
            problem:
                "Une todo-list ne montre que ce qui reste à faire. Elle rend le travail accompli invisible, ce qui décourage sur la durée.",
            solution:
                "Rendre la progression visible : chaque tâche rapporte de l'XP selon sa priorité, les séries se maintiennent jour après jour et une heatmap montre l'activité réelle.",
            outcome:
                "Un command center où l'historique compte autant que le backlog.",
        },
        stack: [
            ['Frontend', ['Vue 3', 'Pinia', 'Vite']],
            ['Fonctionnel', ['Kanban', 'Pomodoro', "Heatmap d'activité"]],
        ],
    },

    /* ------------------------------------------------------------------ 04 */
    {
        slug: 'wikialbion',
        tier: 'featured',
        theme: 'emerald',
        name: "Atlas d'Albion",
        title: "Atlas d'Albion — Codex de terrain",
        flag: 'Wiki',
        tagline: 'Albion Online — 40 fiches pratiques',
        summary:
            "Codex éditorial pour Albion Online : 40 fiches pratiques, 18 anecdotes et un suivi de campagne, en Vanilla JS.",
        intro:
            "Un codex dense mais lisible pour apprendre les systèmes du sandbox d'Albion Online, préparer ses sorties et retrouver les détails qui font la différence sur le terrain. 40 fiches pratiques, 18 anecdotes et un suivi de campagne, dans une interface éditoriale soignée.",
        tags: ['Vanilla JS', 'PWA', 'Éditorial'],
        filters: ['vanilla', 'pwa'],
        meta: [
            ['Rôle', 'Rédaction & développement'],
            ['Type', 'Wiki / PWA'],
            ['Volume', '40 fiches · 18 anecdotes'],
        ],
        live: 'https://allanvitu.github.io/wikialbion/',
        media: 'wikialbion',
        cover: 'accueil',
        slides: [
            ['accueil', "Atlas d'Albion — accueil"],
            ['campagne', "Atlas d'Albion — suivi de campagne"],
            ['codex', "Atlas d'Albion — codex"],
        ],
        specs: [
            ['book-open', 'Codex riche', "40 fiches pratiques et 18 anecdotes classées par familles de sujets."],
            ['map', 'Suivi de campagne', "État du monde et patchs Radiant Wilds tenus à jour."],
            ['feather', 'Design éditorial', "Vanilla JS, typographie soignée et expérience PWA installable."],
        ],
        narrative: {
            problem:
                "Les wikis de jeu existants sont exhaustifs mais illisibles en session : on cherche une information précise et on tombe sur une page de tableaux.",
            solution:
                "Un parti pris éditorial plutôt qu'encyclopédique — des fiches courtes, classées par famille de sujets, lisibles sur un second écran pendant qu'on joue.",
            outcome:
                "Un codex consultable en jeu, installable, et maintenu au rythme des patchs.",
        },
        metrics: [
            ['40', 'Fiches pratiques'],
            ['18', 'Anecdotes'],
            ['0', 'Framework'],
        ],
        stack: [
            ['Frontend', ['Vanilla JS', 'HTML', 'CSS éditorial']],
            ['PWA', ['Service Worker', 'Manifest installable']],
        ],
    },

    /* ------------------------------------------------------------------ 05 */
    {
        slug: 'lolflow',
        tier: 'archive',
        theme: 'amber',
        name: 'LoLFlow',
        title: 'LoLFlow — Companion multi-jeux Riot',
        flag: 'API',
        tagline: 'League of Legends · Valorant · 2XKO',
        summary:
            "Companion connecté à l'API Riot Games : analyse de joueurs sur trois jeux, clé API stockée localement, proxy CORS Cloudflare.",
        intro:
            "Un companion multi-jeux connecté à l'API Riot Games. On renseigne sa clé, on choisit sa région et on analyse n'importe quel joueur sur League of Legends, Valorant ou 2XKO. La clé reste dans le navigateur et un Cloudflare Worker fait office de proxy CORS en production.",
        tags: ['Vue 3', 'Riot API', 'Pinia'],
        filters: ['vue', 'api'],
        meta: [
            ['Rôle', 'Conception & développement'],
            ['Type', "Client d'API tierce"],
            ['Jeux', 'LoL · Valorant · 2XKO'],
        ],
        live: 'https://allanvitu.github.io/LoLFlow/',
        media: 'lolflow',
        cover: 'lol',
        slides: [
            ['lol', 'LoLFlow — League of Legends'],
            ['valorant', 'LoLFlow — Valorant'],
            ['2xko', 'LoLFlow — 2XKO'],
        ],
        specs: [
            ['plug', 'API Riot Games', "Recherche et analyse de joueurs en temps réel sur trois jeux."],
            ['shield', 'Clé stockée localement', "La clé API reste en LocalStorage, elle n'est jamais commitée ni envoyée ailleurs."],
            ['route', 'Proxy CORS', "Un Cloudflare Worker contourne les restrictions CORS de l'API en production."],
        ],
        narrative: {
            problem:
                "L'API Riot refuse les appels directs depuis un navigateur, et un site statique n'a pas de backend pour porter une clé secrète.",
            solution:
                "La clé reste côté utilisateur, en LocalStorage, et les appels transitent par un Cloudflare Worker qui gère le CORS. Aucun secret n'entre dans le dépôt.",
            outcome:
                "Un companion entièrement statique, déployé sur GitHub Pages, qui interroge malgré tout une API tierce authentifiée.",
        },
        stack: [
            ['Frontend', ['Vue 3', 'Pinia', 'Vite']],
            ['Intégration', ['Riot Games API', 'Cloudflare Worker', 'LocalStorage']],
        ],
    },
];
