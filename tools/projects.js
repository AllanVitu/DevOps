/* ==========================================================================
   PROJECTS.JS — Single source of truth for the portfolio.

   One entry per public GitHub repository shown on the site.

   `tier: 'featured'` gives a full chapter on the homepage and its own case
   study page. `tier: 'soon'` is a repository that exists but has no code
   yet: it gets a compact "en préparation" chapter and no page, so the site
   never presents work that has not been published.

   `live` is optional (a resource pack has nothing to open in a browser);
   `repo` is always set. Order drives numbering, tile order and paging.

   `tile` picks the homepage bento tile: 'shot' shows the cover screenshot,
   'rack' shows a logo over a row of item renders (dark tile).
   ========================================================================== */

module.exports = [
    /* ------------------------------------------------------------------ 01 */
    {
        slug: 'devtoolbox',
        tier: 'featured',
        theme: 'indigo',
        name: 'DevToolbox',
        title: 'DevToolbox — 49 outils développeur, IA intégrée',
        kind: 'PWA Vue 3 · IA intégrée',
        period: 'Juin 2026',
        tile: { style: 'shot' },
        tagline: 'Application Vue 3 hors-ligne, avec Claude branché dans chaque outil',
        summary:
            "49 outils développeur, 18 leçons et 9 aide-mémoire dans une PWA Vue 3 qui fonctionne hors-ligne. Chaque outil peut demander une analyse à Claude, avec la clé API de l'utilisateur.",
        intro:
            "DevToolbox rassemble les utilitaires du quotidien — JSON, SQL, encodage, hash, regex, cron, couleurs, réseau — dans une seule application installable. Autour des outils : un tableau de bord avec favoris et historique, une palette de commandes au clavier, 18 leçons illustrées avec quiz et suivi de progression, 9 aide-mémoire, et un assistant Claude qui peut analyser la saisie de n'importe quel outil.",
        tags: ['Vue 3', 'Vite', 'PWA', 'Claude API'],
        meta: [
            ['Rôle', 'Conception & développement'],
            ['Type', 'PWA Vue 3 hors-ligne'],
            ['Période', 'Juin 2026 · 8 commits'],
        ],
        live: 'https://allanvitu.github.io/DevToolsBox/',
        repo: 'https://github.com/AllanVitu/DevToolsBox',
        doc: 'fiche-technique.html#devtoolbox',
        media: 'devtoolbox',
        cover: 'dashboard',
        slides: [
            ['dashboard', 'DevToolbox — tableau de bord : 49 outils, 18 leçons, 9 fiches'],
            ['code', 'DevToolbox — section Code Tools, outils classés par famille'],
            ['erd', 'DevToolbox — visualiseur ERD généré depuis des CREATE TABLE'],
            ['apprendre', 'DevToolbox — les 18 leçons avec suivi de progression'],
            ['lecon', 'DevToolbox — leçon « Vue + PHP : comment ils se parlent »'],
            ['ai', 'DevToolbox — connexion de l’assistant à l’API Claude'],
            ['landing', 'DevToolbox — écran d’accueil'],
        ],
        specs: [
            ['wrench', '49 outils, 9 familles', "Données & SQL, texte, encodage, design, crypto, référence, temps, nombres, système & réseau."],
            ['wifi-off', 'Hors-ligne', "Service worker maison : le shell est pré-caché, chaque outil chargé une fois reste disponible sans réseau."],
            ['sparkles', 'IA à la demande', "Panneau « Analyse IA » dans chaque outil, réponse en streaming, 4 modèles Claude au choix."],
            ['graduation-cap', 'Apprendre', "18 leçons de code commenté avec quiz, 9 aide-mémoire, progression sauvegardée."],
        ],
        narrative: {
            problem:
                "Les outils en ligne équivalents obligent à coller un JWT, un .env ou un schéma SQL sur un serveur tiers, et chacun vit dans un onglet différent.",
            solution:
                "Tout exécuter dans le navigateur : chaque outil est un composant Vue chargé à la demande, l'état est persisté en localStorage, et un service worker rend l'application utilisable hors-ligne. L'IA est la seule exception, clairement signalée : elle part vers l'API Anthropic avec la clé de l'utilisateur, jamais par défaut.",
            outcome:
                "Une boîte à outils installable où la saisie ne quitte pas la machine, sauf demande explicite d'analyse IA.",
        },
        metrics: [
            ['49', 'Outils'],
            ['18', 'Leçons'],
            ['9', 'Aide-mémoire'],
            ['4', 'Modèles Claude'],
            ['0', 'Serveur'],
        ],
        featuresSub: 'Ce qui relie les 49 outils entre eux.',
        features: [
            ['layout-dashboard', 'Tableau de bord & palette',
                "Favoris réordonnables, outils récemment utilisés, progression des leçons. Une palette <code class=\"inline\">Ctrl + K</code> cherche parmi les outils et les actions (thème, réglages, export / import).",
                ['Dashboard', 'Ctrl + K', 'Favoris']],
            ['git-merge', 'Pipeline entre outils',
                "Le résultat d'un outil s'envoie dans un autre en un clic : un composable partagé garde le contenu en attente et l'outil cible ne l'accepte que s'il sait lire ce type de donnée.",
                ['usePipeline', 'Typage des entrées']],
            ['route', 'Liens de partage',
                "La saisie d'un outil est sérialisée en JSON, encodée en Base64 URL-safe et placée dans l'URL : un lien suffit pour rouvrir l'outil dans le même état.",
                ['useShareLink', 'Base64url']],
            ['sparkles', 'Analyse IA par outil',
                "Chaque outil peut ouvrir un panneau « Analyse IA » : le SDK Anthropic n'est chargé qu'à la première demande, la réponse arrive en streaming et peut être interrompue. Erreurs de clé et de débit traduites en français.",
                ['useClaude', 'Streaming', 'Import dynamique']],
            ['graduation-cap', 'Apprendre & quiz',
                "18 leçons, de l'architecture d'un projet jusqu'à une app complète Vue 3 + PHP + PostgreSQL. Le meilleur score de chaque quiz est conservé localement.",
                ['useProgress', '18 leçons', '9 fiches']],
            ['wifi-off', 'Service worker maison',
                "Pré-cache du shell, réseau d'abord pour la navigation avec repli sur l'index en cache, cache d'abord pour les assets — cohérent puisque Vite hashe leurs noms.",
                ['sw.js', 'Cache-first', 'Sans dépendance']],
        ],
        stack: [
            ['Frontend', ['Vue 3', 'Composition API', 'Vue Router', 'Vite']],
            ['État & persistance', ['Composables', 'localStorage', 'usePersistentRef']],
            ['PWA', ['Service worker maison', 'Manifest installable']],
            ['IA', ['SDK Anthropic', 'Streaming', 'Clé côté client']],
            ['Navigateur', ['Web Crypto', 'Clipboard API', 'TextEncoder']],
        ],
    },

    /* ------------------------------------------------------------------ 02 */
    {
        slug: 'boxcraft',
        tier: 'featured',
        theme: 'amber',
        name: 'BoxCraft',
        title: 'BoxCraft — Resource pack pour serveur Minecraft',
        kind: 'Resource pack Minecraft',
        period: 'Août 2026',
        tile: {
            style: 'rack',
            logo: 'media/boxcraft/logo.png',
            rack: [['fusil', 'Fusil'], ['pistolet', 'Pistolet'], ['plasma', 'Plasma'], ['pompe', 'Fusil à pompe'], ['sniper', 'Sniper']],
        },
        tagline: 'PvP · Survie · Quêtes — armes, armure et identité visuelle du serveur',
        summary:
            "Le resource pack du serveur Minecraft BoxCraft : 5 armes à feu modélisées en 3D, une lame, un grappin, une armure complète et le logo du serveur intégré à la police du jeu.",
        intro:
            "BoxCraft est un serveur Minecraft orienté PvP, survie et quêtes. Ce dépôt en contient le resource pack : chaque objet personnalisé a sa définition, son modèle et sa texture sous un namespace dédié, sans remplacer aucun objet du jeu de base. Les armes à feu sont de vrais modèles 3D en éléments cubiques, l'armure a ses couches d'équipement, et le logo du serveur est un glyphe de police utilisable dans le chat.",
        tags: ['Minecraft Java', 'JSON', 'Pixel art'],
        meta: [
            ['Rôle', 'Modélisation, textures & packaging'],
            ['Type', 'Resource pack Minecraft Java'],
            ['Période', 'Août 2026 · 7 commits'],
        ],
        live: null,
        repo: 'https://github.com/AllanVitu/serveur',
        doc: 'fiche-technique.html#boxcraft',
        media: 'boxcraft',
        cover: 'cover',
        slides: [
            ['cover', 'BoxCraft — logo et les 11 objets du pack'],
            ['arsenal', 'BoxCraft — les armes : 5 modèles 3D, la Lame Éternelle et le Grappin d’Abordage'],
            ['egide', 'BoxCraft — l’armure Égide d’Émeraude et sa texture portée'],
        ],
        specs: [
            ['boxes', '11 objets personnalisés', "5 armes à feu, la Lame Éternelle, le Grappin d'Abordage et les 4 pièces de l'Égide d'Émeraude."],
            ['layers', 'Modèles 3D', "Armes construites en 5 à 7 éléments cubiques, avec une transformation réglée pour chaque vue (main, sol, inventaire…)."],
            ['shield', 'Armure complète', "Couches d'équipement humanoid, leggings et baby pour l'Égide d'Émeraude."],
            ['package', 'Pack autonome', "25 Ko en ZIP, format de pack 88, aucun mod requis côté joueur."],
        ],
        narrative: {
            problem:
                "Un serveur PvP / survie / quêtes a besoin d'objets reconnaissables au premier coup d'œil, sans demander aux joueurs d'installer un mod.",
            solution:
                "Un resource pack vanilla sous le namespace boxcraft : définitions d'objets, modèles et textures séparés, appelés par le serveur via les composants d'objet. Aucun objet du jeu de base n'est écrasé, donc rien ne casse ailleurs.",
            outcome:
                "Un pack léger, versionné commit par commit, qui s'active côté client en un clic à la connexion au serveur.",
        },
        metrics: [
            ['11', 'Objets'],
            ['5', 'Modèles 3D'],
            ['4', 'Pièces d’armure'],
            ['25 Ko', 'Pack ZIP'],
            ['0', 'Mod requis'],
        ],
        featuresSub: 'Un namespace, trois couches : définition, modèle, texture.',
        features: [
            ['swords', 'Armes à feu',
                "Fusil, pistolet, plasma, fusil à pompe et sniper. Chaque arme est un modèle en éléments cubiques texturés par bandes, avec 8 vues d'affichage réglées (main gauche / droite en 1re et 3e personne, sol, inventaire, cadre, tête).",
                ['models/item', '8 vues', 'Éléments cubiques']],
            ['zap', 'Lame Éternelle & Grappin',
                "Deux objets tenus en main (parent <code class=\"inline\">item/handheld</code>), dessinés en pixel art 16×16.",
                ['handheld', '16×16']],
            ['shield', "Égide d'Émeraude",
                "Casque, plastron, jambières et bottes, plus un asset d'équipement qui habille le joueur : couches humanoid, leggings et baby.",
                ['equipment/', '4 pièces']],
            ['feather', 'Logo dans la police',
                "Le logo BoxCraft est un glyphe bitmap (<code class=\"inline\">U+E000</code>) ajouté à la police par défaut : il s'affiche dans le chat, les titres ou les tableaux de scores.",
                ['font/default.json', 'Glyphe privé']],
        ],
        stack: [
            ['Format', ['Resource pack Java', 'Format de pack 88', 'Namespace boxcraft']],
            ['Assets', ['Définitions d’objets', 'Modèles JSON', 'Couches d’équipement', 'Police bitmap']],
            ['Création', ['Pixel art 16×16', 'Modélisation cubique']],
        ],
    },

    /* ------------------------------------------------------------------ 03 */
    {
        slug: 'app',
        tier: 'soon',
        theme: 'emerald',
        name: 'App',
        kind: 'En préparation',
        period: 'Août 2026',
        tags: ['Nouveau dépôt'],
        tagline: 'Le prochain projet. Dépôt ouvert, premier commit de code à venir.',
        summary:
            "Dépôt ouvert le 28 août 2026, pas encore de code publié. Cette fiche se remplira au premier commit.",
        repo: 'https://github.com/AllanVitu/App',
    },
];
