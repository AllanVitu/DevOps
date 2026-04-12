# 🚀 Guide de Déploiement sur O2Switch

Ce document explique comment déployer facilement le portfolio (et les autres projets statiques) sur un hébergement web O2Switch.

## 📋 Prérequis
1. Un compte **O2Switch** avec un hébergement actif.
2. Un nom de domaine configuré sur votre espace O2Switch (ex: `allan-vitu.fr`).
3. L'ensemble de vos fichiers projets prêts pour la production (fichiers HTML, CSS, JS, et Assets situés en général dans le dossier `docs/`).

---

## 🛠️ Méthode 1 : Déploiement via le cPanel O2Switch (Le plus simple)

O2Switch utilise le panneau d'administration cPanel qui rend le processus très visuel et sans installation de logiciel supplémentaire.

### 1. Préparation de l'archive
- Sur votre ordinateur local, rendez-vous dans le dossier de votre projet.
- Sélectionnez tous les éléments **à l'intérieur** de votre répertoire final (si votre répertoire final est `docs/`, sélectionnez `index.html`, `css/`, `js/`, `assets/`, etc.).
- Faites un clic droit et créez une archive compressée `.zip` (ex: `portfolio.zip`).

### 2. Accès au Gestionnaire de Fichiers
- Connectez-vous à votre interface client O2Switch, puis cliquez sur le lien vers votre **cPanel**.
- Dans la rubrique *Fichiers*, cliquez sur **Gestionnaire de fichiers**.
- Dans l'arborescence à gauche, naviguez jusqu'au dossier racine de votre site web. Par défaut, c'est généralement `public_html`.

### 3. Téléversement et Extraction
- Une fois dans `public_html` (ou le dossier du sous-domaine associé), cliquez sur le bouton **Charger** en haut de la page.
- Choisissez votre fichier `portfolio.zip` fraîchement créé.
- Attendez que la barre de progression soit 100% verte.
- Revenez dans le *Gestionnaire de fichiers*, faites un **clic droit** sur votre fichier `.zip` et sélectionnez **Extraire**.
- Vérifiez que vos fichiers `index.html`, `css`, `js`, etc. se trouvent bien directement à la racine de votre dossier `public_html`. (Si un sous-dossier a été créé, déplacez son contenu vers la racine).
- Vous pouvez désormais supprimer l'archive `.zip` du site pour économiser de la place.

🎉 ***Félicitations, votre site est en ligne en quelques minutes !*** Visitez votre nom de domaine pour le constater.

---

## 💻 Méthode 2 : Déploiement par FTP/SFTP (Pour les Pros)

Si vous préférez pousser vos révisions de code directement via un outil comme FileZilla ou un plugin de déploiement SFTP sur VSCode.

### 1. Récupération des accès FTP
- Sur votre **cPanel O2Switch**, allez dans la rubrique *Fichiers* et cliquez sur **Comptes FTP**.
- Créez un nouveau compte pointant vers `public_html` ou notez les identifiants de votre compte FTP principal.

### 2. Connexion
- **Hôte** : Votre nom de domaine ou l'adresse IP du serveur O2Switch.
- **Identifiant** : Votre nom d'utilisateur FTP.
- **Mot de passe** : Le mot de passe associé.
- **Port** : 21 (FTP) ou 22 (SFTP, recommandé par O2Switch).

### 3. Transfert des données
Dans votre client FTP (FileZilla par exemple) :
- Le panneau de gauche affiche les fichiers de votre ordinateur. Naviguez dans `docs/`.
- Le panneau de droite affiche les dossiers distants O2Switch. Ouvrez le dossier `public_html`.
- Faites glisser tout le contenu de votre dossier `docs/` depuis le côté gauche vers le côté droit.

Vos fichiers vont être transférés un par un sur le serveur !

---

## 🔒 Activation du HTTPS / Certificat SSL gratuit
O2Switch fournit des certificats Let's Encrypt gratuits de manière automatique.
1. Sur le cPanel, allez dans la section *Sécurité* > **Let's Encrypt™ SSL**.
2. Dans la liste de vos domaines, cliquez sur **+ Générer** ou **Issue** à côté de votre nom de domaine.
3. Validez la génération. L'opération prend généralement quelques secondes.
4. (Optionnel) Forcez le HTTPS en ajoutant cette règle dans votre fichier `.htaccess` situé dans `public_html` :

```apache
RewriteEngine On 
RewriteCond %{HTTPS} off 
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

C'est tout bon ! Votre application est maintenant parée à conquérir le web de façon fluide et sécurisée via O2Switch !
