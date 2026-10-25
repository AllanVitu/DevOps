/* ==========================================================================
   APPS.JS — The downloadable Windows apps, for the apps/ page and the
   homepage banner. Edit here, then run `node tools/build.js`.

   Each app is a "flavor" with its own colours (see the contrast rules at the
   top of docs/css/apps.css):
     a     chapter background         on    text on `a`
     b     second colour (gradients)  deep  dark surfaces, white text on them
     pop   bright accent, on `deep`   text  the app's colour as text on cream
   `pattern` picks the box cover ('stripes' or 'pixels'); `font: 'pixel'`
   sets the app's name in Pixelify Sans. Floaters are Lucide icons
   ('icon') or sprites from sprites.js ('pixel').

   `features[].text`, `steps`, `notes` and the FAQ answers are trusted HTML
   (for <code> and <b>); everything else is escaped.

   Downloads are GitHub release assets of this repository: the release tag
   is `download.tag` and the asset is named `download.file`. Upload the ZIP
   under exactly that name, or the button leads to a 404.
   ========================================================================== */

const apps = [
    /* ------------------------------------------------------------------ 01 */
    {
        slug: 'desktopoptimise',
        media: 'desktopoptimise',
        name: 'Desktop Optimise',
        short: 'Optimise',
        version: '5.0.0',
        category: 'UtilitiesApplication',
        /* The app's own palette: cyan accent, light cyan, navy logo, mint bolt. */
        flavor: {
            label: 'Turbo',
            a: '#22c3e0', b: '#7bddee', deep: '#0c172d', pop: '#6bf799', on: '#0b0e14', text: '#0b7489',
            pattern: 'stripes',
        },
        floaters: { type: 'icon', items: ['zap', 'gauge', 'gamepad-2', 'fan', 'brush-cleaning', 'thermometer'] },
        band: ['Mode gaming', 'Retour au calme', 'Nettoyage', 'Diagnostic', 'Tout annuler'],
        box: { tag: 'Gaming · Dev · Calme', spine: 'Windows · Gratuit', back: ['Mode gaming par jeu', 'Retour au calme auto', 'Tout annuler en 1 clic'] },

        tagline: 'Mode gaming en un clic, retour au calme tout seul.',
        card: 'Mon PC portable ramait en jeu, alors j’ai codé l’antidote : un mode gaming par jeu qui ferme le superflu, pousse le processeur et remet tout au calme quand la partie se termine.',
        pitch:
            "Desktop Optimise, c'est l'app que je me suis construite pour mon Dell Latitude 5400 : avant une partie de LoL, TFT ou Minecraft, elle ferme le superflu et pousse le processeur, puis remet le PC au calme dès que le jeu se ferme. Nettoyage des caches, démarrage, diagnostic noté sur 100 et suivi des plantages du GPU complètent la boîte à outils, avec sauvegardes et bouton « Tout annuler ».",
        chips: ['v5.0.0', 'Windows 10 · 11', '151 Mo', 'ZIP portable'],
        numbers: [
            ['18', 'catégories de nettoyage, que des caches qui se reconstruisent'],
            ['10', 'sections au diagnostic, résumées en un score sur 100'],
            ['3', 'jeux suivis : LoL, TFT, Minecraft'],
            ['15 s', 'entre deux coups d’œil au jeu, pour le retour au calme'],
        ],
        features: [
            ['gamepad-2', 'Un mode gaming par jeu', "Choisis ton jeu : l'app montre ce qu'elle va fermer (tu décoches ce que tu gardes), garde le lanceur du jeu, active le plan GAMING et « Meilleures performances », peut couper WSL / Docker, puis lance la partie."],
            ['moon', 'Retour au calme automatique', "Après le mode gaming, l'app jette un œil au jeu toutes les 15 s. Quand il se ferme, le PC repasse en mode normal et une notification Windows le signale. Fermer la fenêtre la range près de l'horloge."],
            ['gauge', 'Tableau de bord en direct', "Disque, mémoire, processeur et batterie en anneaux, courbe CPU / RAM des 3 dernières minutes et score de santé. Le relevé ne tourne que quand la fenêtre est visible."],
            ['brush-cleaning', 'Un nettoyage qui ne casse rien', "Analyse d'abord, puis tu coches : caches de Windows, des navigateurs, de Discord, des jeux et des outils de dev. Jamais de documents, de mots de passe, de mondes Minecraft ni de profils."],
            ['stethoscope', 'Diagnostic & rapport HTML', "En lecture seule : disque, mémoire, alimentation, démarrage, carte graphique, stabilité des jeux, processus, gros dossiers. Un score sur 100, des conseils concrets et un rapport exportable."],
            ['cpu', 'Stabilité du GPU et des jeux', "Les journaux de Windows sont passés au crible sur 30 jours (plantages du GPU, jeux gelés, mémoire saturée), puis trois correctifs sont proposés, dont un pilote Intel à l'empreinte SHA-512 vérifiée."],
            ['power', 'Démarrage & applications', "Active ou coupe ce qui se lance avec Windows, par le même mécanisme que le Gestionnaire des tâches : rien n'est effacé, tout se réactive. Et ferme les applis qui pèsent le plus en mémoire."],
            ['undo-2', 'Entretien, optimisation, « Tout annuler »', "Entretien complet (Windows Update, Defender, <code>winget</code>, pilote), optimisation précédée d'un point de restauration, sauvegardes et restauration en un bouton. Tout est noté dans un journal horodaté."],
        ],
        shots: [
            ['dashboard', 'Accueil : score de santé, jauges disque, mémoire, processeur et batterie, courbe CPU et RAM des trois dernières minutes'],
            ['modes', 'Modes : choix du jeu, applications que le mode gaming fermera, options du mode et stabilité des jeux'],
            ['systeme', 'Système : entretien complet, optimisation, réparation WSL / Docker et bouton « Tout annuler »'],
            ['journal', 'Journal : chaque analyse, nettoyage et réglage, ligne par ligne et horodaté'],
        ],
        steps: [
            'Télécharge le ZIP et extrais le dossier <code>Desktop Optimise</code> où tu veux (par exemple dans <code>%LOCALAPPDATA%\\Programs</code>).',
            'Ouvre <code>Desktop Optimise.exe</code>. À l’alerte SmartScreen : <b>Informations complémentaires</b> → <b>Exécuter quand même</b>.',
            'Commence par <b>Analyser le PC</b> : le diagnostic ne modifie rien et te dit quoi faire ensuite.',
        ],
        requirements: ['Windows 10 / 11 · 64 bits', 'PowerShell 5.1 (inclus dans Windows)', '≈ 370 Mo une fois décompressé', 'Admin seulement pour certaines actions', 'Internet facultatif'],
        notes: [
            "C'est un outil perso, taillé pour <b>mon</b> Latitude 5400 : l'accueil affiche mon prénom et les caractéristiques de ce PC, quel que soit le tien (modifiable dans <code>parametres.json</code>).",
            "Il modifie vraiment Windows : plan d'alimentation, registre, services, fichier d'échange fixé à 8 Go. Un point de restauration est créé avant l'optimisation système.",
            'Le mode gaming ferme les applis cochées, navigateurs compris : enregistre ton travail avant.',
            "Le nettoyage est définitif, et « Tout annuler » remet les valeurs par défaut de Windows, pas forcément tes réglages d'avant.",
            'Interface en français, pas de mise à jour automatique. Exécutable non signé : SmartScreen préviendra au premier lancement.',
        ],
        pick: [
            'Tu joues à LoL, TFT ou Minecraft sur un PC portable un peu juste.',
            'Tu veux un mode gaming qui se défait tout seul après la partie.',
            'Tu aimes savoir ce qui est fait : tout est noté et annulable.',
        ],
        download: {
            tag: 'desktop-optimise-v5.0.0',
            file: 'DesktopOptimise-5.0.0-win-x64.zip',
            /* Sizes as Windows shows them (1 Mo = 1 048 576 octets). */
            size: '151 Mo',
            meta: 'Windows 10 · 11 (x64) · ZIP portable',
            sha256: 'c399770b872f6215e058792bb5095f7a208a266a16d7b17fcd092a6cf56c2300',
        },
    },

    /* ------------------------------------------------------------------ 02 */
    {
        slug: 'eclipsecraft',
        media: 'eclipsecraft',
        name: 'TheEclipseCraft',
        short: 'TEC',
        version: '2.0.0',
        category: 'GameApplication',
        font: 'pixel',
        /* Night indigo with the golden crown of the default "Éclipse" theme. */
        flavor: {
            label: 'Éclipse',
            a: '#221a4d', b: '#3b2d85', deep: '#110d26', pop: '#f7b733', on: '#ffffff', text: '#4a35b5',
            pattern: 'pixels',
        },
        floaters: { type: 'pixel', items: ['eclipse', 'heart', 'gem', 'grass', 'orb', 'star'] },
        band: ['Wiki', 'Crafts', 'Stats en direct', 'Récap de partie', 'Guide d’aventure', '10 thèmes'],
        box: { tag: 'Compagnon Minecraft', spine: 'Windows · Gratuit', back: ['1 657 items, 1 714 recettes', 'Stats en direct', 'Récap de chaque partie'] },

        tagline: 'L’établi de poche qui suit ta partie en direct.',
        card: 'Wiki, crafts, commandes, stats en temps réel et récap de chaque partie : tout ce qu’il faut à côté de Minecraft Java, hors ligne et sans compte.',
        pitch:
            "TheEclipseCraft lit ta propre installation de Minecraft Java pour afficher ta vie, ton inventaire, tes progrès et ta dernière mort, et te guide en 11 étapes du premier jour jusqu'au Wither. Wiki, 1 714 recettes, 84 commandes et historique de tes parties : tout fonctionne hors ligne, sans compte, et sans jamais modifier tes mondes.",
        chips: ['v2.0.0', 'Windows 10 · 11', '151 Mo', 'Minecraft Java'],
        numbers: [
            ['1 657', 'items & blocs dans le wiki, lus dans ton jeu'],
            ['1 714', 'recettes de craft du jeu installé'],
            ['84', 'commandes Java expliquées'],
            ['11', 'étapes d’aventure cochées toutes seules'],
        ],
        features: [
            ['heart', 'Ta partie en direct', "Vie, faim, XP, armure, position, effets et inventaire avec les sprites du jeu. Ta dernière mort et ton point de réapparition, avec la commande <code>/tp</code> prête à copier."],
            ['compass', 'Aventure guidée', "Une feuille de route en 11 étapes, du premier jour au Wither, cochée toute seule à partir de tes stats et progrès. Conseils du moment, quêtes annexes et progrès à collectionner."],
            ['book-open', 'Wiki & crafts hors ligne', "1 657 items, 88 créatures, 68 biomes, 44 enchantements, 41 effets et 21 structures, plus les 1 714 recettes de ton jeu. Le mode « Avec mon inventaire » montre ce que tu peux fabriquer."],
            ['history', 'Historique & récap de partie', "Chaque partie, suivie en direct ou reconstruite depuis tes anciens logs : chronologie des progrès et des morts, temps de jeu par jour, note perso, sauvegardes .zip de tes mondes."],
            ['terminal', 'Commandes & RCON', "84 commandes Java, gamerules, sélecteurs et un constructeur. Avec RCON activé, la commande part directement au serveur ; sinon elle est copiée, prête à coller en jeu."],
            ['layers', 'Overlay en jeu', "Une mini-fenêtre toujours au premier plan (<code>Ctrl+Maj+O</code>) : session, vie, dernière mort, objectif en cours et derniers événements. Elle n'a accès qu'à une API en lecture."],
            ['palette', '10 thèmes & accessibilité', "Éclipse, Halo, Overworld, Cerisier, Nether, L'End… et « Suivre Windows ». Un thème à contraste élevé, une palette pour le daltonisme, tout au clavier, animations réduites."],
            ['wrench', 'Outils & serveurs', "Convertisseur Nether ↔ Overworld, points d'intérêt par monde, chunks à slimes, calculateur de stacks, et statut en direct des serveurs enregistrés dans ton jeu."],
        ],
        shots: [
            ['en-jeu', 'En jeu, thème Éclipse : cœurs, faim, armure, niveau, position, lit de réapparition, monde et inventaire'],
            ['aventure', 'Aventure : étape 10 sur 11 « Netherite », objectifs cochés automatiquement, conseils et crafts utiles'],
            ['historique', 'Historique : la liste des parties et le récap d’une session, avec la chronologie de ses progrès'],
            ['wiki', 'Wiki, onglet Créatures : les 88 mobs du jeu et la fiche du Creeper, avec ses commandes'],
            ['crafts', 'Crafts : les 1 714 recettes lues dans le jeu installé, grille par grille'],
            ['reglages-themes', 'Réglages : les thèmes Éclipse, Halo, Overworld, Cerisier, Ardoise, Nether, L’End et Prismarine'],
            ['en-jeu-overworld', 'La même page En jeu avec le thème clair Overworld, tons papier et vert herbe'],
        ],
        steps: [
            'Télécharge le ZIP et extrais-le où tu veux (par exemple dans Documents).',
            'Ouvre le dossier <code>TheEclipseCraft</code> et lance <code>TheEclipseCraft.exe</code>. À l’alerte SmartScreen : <b>Informations complémentaires</b> → <b>Exécuter quand même</b>.',
            'Lance Minecraft Java avec ton lanceur : TEC détecte l’instance et suit ta partie tout seul.',
        ],
        requirements: ['Windows 10 / 11 · 64 bits', 'Minecraft Java (testé avec la 26.3)', 'Sans droits admin', '≈ 370 Mo une fois décompressé', 'Internet facultatif'],
        notes: [
            'TEC ne modifie jamais tes mondes : il les lit, et ne les copie que pour les sauvegardes.',
            'Minecraft Java uniquement, versions « release ». Testé avec la 26.3 ; les formats 1.20 / 1.21 sont gérés par le code mais pas re-testés pour cette version.',
            "En multijoueur, vie, inventaire et stats restent sur le serveur : le fil d'événements suit, les objectifs du guide se cochent à la main.",
            'Les stats se mettent à jour à chaque sauvegarde du jeu (menu Échap, ou toutes les 5 min).',
            'La croix range TEC près de l’horloge : clic droit sur l’icône → <b>Quitter</b>. Exécutable non signé : SmartScreen préviendra au premier lancement.',
            'Non affilié à Mojang ni à Microsoft : les textures affichées viennent de ton installation du jeu.',
        ],
        pick: [
            'Tu joues à Minecraft Java en solo ou sur ton serveur.',
            'Tu veux le wiki et les crafts sans quitter le jeu ni Internet.',
            'Tu aimes revoir tes parties, tes morts et tes progrès.',
        ],
        download: {
            tag: 'tec-v2.0.0',
            file: 'TheEclipseCraft-2.0.0-win-x64.zip',
            size: '151 Mo',
            meta: 'Windows 10 · 11 (x64) · ZIP portable',
            sha256: '2a1a209e73423f5469f454214ed7f5c76344969dd9fea2d1c78da610e4eeaa4b',
        },
    },
];

/* Shared questions, answered for both apps. */
const faq = [
    [
        'Windows affiche « Windows a protégé votre ordinateur ». C’est normal ?',
        "<p>Oui. Les deux apps ne sont pas signées avec un certificat de signature de code (payant), donc SmartScreen ne les connaît pas encore. Clique sur <b>Informations complémentaires</b>, puis sur <b>Exécuter quand même</b>.</p><p>Pour t'assurer que le fichier est bien celui que j'ai publié, compare son empreinte SHA-256 (question suivante).</p>",
    ],
    [
        'Comment vérifier que le fichier n’a pas été modifié ?',
        "<p>Ouvre PowerShell dans le dossier du téléchargement et tape <code>Get-FileHash .\\NomDuFichier.zip</code>. Le résultat doit être identique à l'empreinte SHA-256 affichée sur le ticket de l'app.</p>",
    ],
    [
        'C’est vraiment gratuit ?',
        '<p>Oui : pas de publicité, pas de compte, pas d’abonnement. Ce sont des projets personnels que je partage.</p>',
    ],
    [
        'Ça marche sur Mac ou Linux ?',
        '<p>Non, Windows 10 et 11 en 64 bits uniquement. Desktop Optimise pilote Windows lui-même, et TEC s’appuie sur les dossiers Windows de Minecraft.</p>',
    ],
    [
        'Comment désinstaller ?',
        "<p>Ce sont des versions portables, sans installeur : supprime le dossier dézippé, puis le raccourci que l'app a créé dans le menu Démarrer (Windows en a besoin pour ses notifications). Les réglages restent dans <code>%APPDATA%</code> (<code>Desktop Optimise</code> ou <code>TheEclipseCraft - TEC</code>) : supprime-les aussi pour repartir de zéro.</p><p>Pour Desktop Optimise, lance d'abord <b>Tout annuler</b> si tu veux remettre les réglages Windows par défaut. Pour TEC, désactive <b>Lancer au démarrage</b> si tu l'avais activé.</p>",
    ],
    [
        'Les apps envoient-elles mes données quelque part ?',
        "<p>Non : pas de télémétrie, pas de compte, pas de serveur à moi. L'analyse REA des deux exécutables n'a relevé aucune requête HTTP, <code>fetch</code> ou WebSocket dans leur code JavaScript.</p><p>Les seuls accès à Internet sont ceux que tu déclenches : l'entretien complet et le pilote Intel pour Desktop Optimise, le statut des serveurs Minecraft et RCON pour TEC.</p>",
    ],
    [
        'Il y aura des mises à jour ?',
        '<p>Oui, mais pas automatiques : les nouvelles versions arriveront sur cette page et dans les <a href="https://github.com/AllanVitu/DevOps/releases">GitHub Releases</a>.</p>',
    ],
];

module.exports = { apps, faq };
