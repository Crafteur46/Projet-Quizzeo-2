Bonjour Monsieur Brousset, dans ce fichier, je vais vous présenter le travail effectué.
Concernant ce projet, je me suis aidé de Windsurf pour le mener à bien. 
Pour la partie Backend, j'ai utilisé les librairies vues en cours, à savoir bcrypt pour le hashage des mots de passe, cors pour autoriser ou restreindre les requêtes HTTP provenant d’un domaine différent de celui du serveur, express
et express-session pour gérer les routes, les middlewares pour l'interception et le traitement des requetes, jsonwebtoken qui permet de générer un token JWT signé côté serveur (au moment de la connexion d’un utilisateur),
envoyer ce token au client (généralement dans les headers ou le localStorage) et vérifier le token à chaque requête pour authentifier l’utilisateur sans utiliser de session.
J'utilise aussi la librairie string similarity qui permet de vérifier la ressemblance entre deux textes. Pour cette partie backend, je l'ai conteneurisée dans Docker afin que celle-ci soit liée avec la BDD et la partie Frontend.
Concernant la base de données,celle-ci est en postgresql hébergée par Docker en la créant grâce à un fichier schema.prisma.
Pour la partie frontend, j'utilise les librairies suivantes : bootstrap qui permet de créer rapidement des interfaces web responsives et stylées sans avoir à écrire beaucoup de CSS personnalisé.
React qui permet de créer des interfaces utilisateur dynamiques pour des applications web.
React-router qui permet une navigation dans la webapp. 

Toute cette webapp est conteneurisée dans Docker, ce qui permet de lancer l'ensemble de l'application (frontend, backend et base de données) de manière simple et cohérente sur n'importe quelle machine.
