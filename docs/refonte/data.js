/* ==========================================================================
   DATA.JS — Shared content for the five redesign prototypes.
   Every prototype renders from this object, so a copy change here reaches
   all of them at once. Paths are relative to a prototype folder
   (docs/refonte/<variant>/), hence the ../../ prefix.
   ========================================================================== */
(() => {
    const A = '../../assets/media/';

    window.PORTFOLIO = {
        person: {
            name: 'Allan Vitu',
            first: 'Allan',
            last: 'Vitu',
            role: 'Développeur Full-Stack & DevOps',
            status: 'Disponible — freelance & CDI',
            pitch: 'Je construis des apps web robustes, de l’architecture au pixel.',
            bio: [
                'Diplômé du titre professionnel DWWM au Centre de Réadaptation de Mulhouse, je conçois des applications de bout en bout — de la maquette au déploiement.',
                'Je travaille surtout en Vue 3 et PHP 8, avec un goût marqué pour les PWA hors-ligne, l’outillage DevOps et, depuis DevToolbox, l’intégration de l’IA dans les outils du quotidien.',
            ],
            avatar: A + 'avatar.webp',
            email: 'allan.vitu90@gmail.com',
            github: 'https://github.com/AllanVitu',
            linkedin: 'https://www.linkedin.com/in/allan-vitu-74a11039a/',
            instagram: 'https://www.instagram.com/allan.vitu/',
            location: 'Mulhouse, France',
        },

        /* Chronological path. `project` links a step to a project id. */
        parcours: [
            { date: '2024 — 2025', title: 'Titre professionnel DWWM', org: 'Centre de Réadaptation de Mulhouse',
              text: 'Formation intensive en développement web et web mobile : projets full-stack, méthodes agiles, architectures modernes.' },
            { date: 'Juin 2026', title: 'DevToolbox', org: 'Projet personnel', project: 'devtoolbox',
              text: '49 outils, 18 leçons et un assistant Claude dans une PWA Vue 3 hors-ligne. 8 commits en 9 jours.' },
            { date: 'Août 2026', title: 'BoxCraft', org: 'Serveur Minecraft', project: 'boxcraft',
              text: 'Le resource pack du serveur : armes en 3D, armure complète et logo intégré à la police du jeu.' },
            { date: 'Août 2026', title: 'App', org: 'Nouveau dépôt', project: 'app',
              text: 'Dépôt ouvert le 28 août. Le prochain chapitre.' },
            { date: 'Aujourd’hui', title: 'Ouvert aux opportunités', org: 'Freelance & CDI',
              text: 'Disponible pour des applications web performantes, des PWA mobile-first et de l’infrastructure cloud.' },
        ],

        stack: [
            { group: 'Frontend', items: ['Vue 3', 'JavaScript', 'Vite', 'HTML / CSS', 'Tailwind'] },
            { group: 'Backend & data', items: ['PHP 8', 'MySQL', 'Node.js', 'NoSQL'] },
            { group: 'DevOps', items: ['Docker', 'CI/CD', 'Linux', 'GitHub Pages'] },
            { group: 'IA & outils', items: ['API Claude', 'PWA', 'Service Worker', 'Git'] },
        ],

        projects: [
            {
                id: 'devtoolbox',
                name: 'DevToolbox',
                repoName: 'DevToolsBox',
                status: 'live',
                kind: 'PWA Vue 3 · IA intégrée',
                period: 'Juin 2026',
                color: '#6366f1',
                icon: '🧰',
                tagline: '49 outils développeur, hors-ligne, avec Claude dans chaque outil.',
                summary: '49 outils, 18 leçons et 9 aide-mémoire dans une PWA Vue 3 qui fonctionne hors-ligne. Chaque outil peut demander une analyse à Claude, avec la clé API de l’utilisateur.',
                problem: 'Les outils en ligne équivalents obligent à coller un JWT, un .env ou un schéma SQL sur un serveur tiers — et chacun vit dans un onglet différent.',
                solution: 'Tout s’exécute dans le navigateur : un composant Vue par outil, chargé à la demande, état persisté localement, service worker maison. L’IA est la seule exception, explicite et à la demande.',
                stats: [['49', 'outils'], ['18', 'leçons'], ['9', 'aide-mémoire'], ['4', 'modèles Claude']],
                tags: ['Vue 3', 'Vite', 'Vue Router', 'PWA', 'SDK Anthropic', 'Web Crypto'],
                highlights: [
                    'Pipeline : le résultat d’un outil s’envoie dans un autre',
                    'Liens de partage : la saisie voyage dans l’URL',
                    'Palette Ctrl + K sur outils et actions',
                    'Quiz et progression sauvegardés localement',
                ],
                cover: A + 'devtoolbox/dashboard.webp',
                shots: [
                    [A + 'devtoolbox/dashboard.webp', 'Tableau de bord'],
                    [A + 'devtoolbox/code.webp', 'Code Tools'],
                    [A + 'devtoolbox/erd.webp', 'Visualiseur ERD'],
                    [A + 'devtoolbox/apprendre.webp', 'Apprendre'],
                    [A + 'devtoolbox/ai.webp', 'Assistant IA'],
                ],
                live: 'https://allanvitu.github.io/DevToolsBox/',
                repo: 'https://github.com/AllanVitu/DevToolsBox',
                page: '../../projects/devtoolbox.html',
            },
            {
                id: 'boxcraft',
                name: 'BoxCraft',
                repoName: 'serveur',
                status: 'live',
                kind: 'Resource pack Minecraft',
                period: 'Août 2026',
                color: '#fbbf24',
                icon: '⛏️',
                tagline: 'PvP · Survie · Quêtes — l’identité visuelle d’un serveur Minecraft.',
                summary: 'Le resource pack du serveur BoxCraft : 5 armes à feu modélisées en 3D, une lame, un grappin, une armure complète et le logo du serveur intégré à la police du jeu.',
                problem: 'Un serveur PvP / survie / quêtes a besoin d’objets reconnaissables au premier coup d’œil, sans demander aux joueurs d’installer un mod.',
                solution: 'Un resource pack vanilla sous un namespace dédié : définitions, modèles et textures séparés, appelés par le serveur via les composants d’objet. Aucun objet du jeu n’est écrasé.',
                stats: [['11', 'objets'], ['5', 'modèles 3D'], ['4', 'pièces d’armure'], ['25 Ko', 'le pack']],
                tags: ['Minecraft Java', 'Pack format 88', 'JSON', 'Pixel art 16×16'],
                highlights: [
                    'Armes en 5 à 7 éléments cubiques, 8 vues réglées',
                    'Armure avec couches d’équipement',
                    'Logo = glyphe de police U+E000',
                    'Aucun mod requis côté joueur',
                ],
                cover: A + 'boxcraft/cover.webp',
                logo: A + 'boxcraft/logo.png',
                shots: [
                    [A + 'boxcraft/cover.webp', 'Le pack'],
                    [A + 'boxcraft/arsenal.webp', 'L’arsenal'],
                    [A + 'boxcraft/egide.webp', 'Égide d’Émeraude'],
                ],
                items: [
                    ['Fusil', A + 'boxcraft/render/fusil.webp', '3d'],
                    ['Pistolet', A + 'boxcraft/render/pistolet.webp', '3d'],
                    ['Plasma', A + 'boxcraft/render/plasma.webp', '3d'],
                    ['Fusil à pompe', A + 'boxcraft/render/pompe.webp', '3d'],
                    ['Sniper', A + 'boxcraft/render/sniper.webp', '3d'],
                    ['Lame Éternelle', A + 'boxcraft/items/lame_eternelle.png', 'px'],
                    ['Grappin d’Abordage', A + 'boxcraft/items/grappin.png', 'px'],
                    ['Casque', A + 'boxcraft/items/emeraude_helmet.png', 'px'],
                    ['Plastron', A + 'boxcraft/items/emeraude_chestplate.png', 'px'],
                    ['Jambières', A + 'boxcraft/items/emeraude_leggings.png', 'px'],
                    ['Bottes', A + 'boxcraft/items/emeraude_boots.png', 'px'],
                ],
                live: null,
                repo: 'https://github.com/AllanVitu/serveur',
                page: '../../projects/boxcraft.html',
            },
            {
                id: 'app',
                name: 'App',
                repoName: 'App',
                status: 'soon',
                kind: 'En préparation',
                period: 'Août 2026',
                color: '#34d399',
                icon: '🚀',
                tagline: 'Le prochain projet. Dépôt ouvert, premier commit de code à venir.',
                summary: 'Dépôt ouvert le 28 août 2026, pas encore de code publié. Cette fiche se remplira au premier commit.',
                stats: [],
                tags: ['Nouveau dépôt'],
                repo: 'https://github.com/AllanVitu/App',
            },
        ],

        doc: '../../doc_technique/fiche-technique.html',
        home: '../../',
    };

    /* Tiny helpers shared by the prototypes. */
    window.PORTFOLIO.esc = (s) =>
        String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    window.PORTFOLIO.byId = (id) => window.PORTFOLIO.projects.find((p) => p.id === id);
    window.PORTFOLIO.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
