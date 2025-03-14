
# DevOps Code Samples

Un exemple de la procédure CI/CD avec un API en NodeJS, et mise en production avec Kubernetes.

## Instructions d'utilisation

Le projet est conçu pour un VSCode Dev Container. Relancez le projet dans un DevContainer, et ouvrez un terminal.

Avant de lancer le serveur il faut d'abord préparer la base de données :

```bash
mycli -h dbms -u root < ./src/model/schema/init.sql
mycli -h dbms -u root < ./src/model/schema/ddl.sql
```

Ensuite, on peut lancer le serveur avec :

```bash
npm run server
```

Vous saurez si tout fonctionne correctement si vous arrivez à consulter le chemin d'information à [http://localhost:5055/info](http://localhost:5055/info) dans un navigateur web.

## Tests Postman

Un export des tests pour Postman se trouve dans [./src/test/postman/api.postman_collection.json](./src/test/postman/api.postman_collection.json)

## Docker Registry

Le container `vscode_devops_api` utilise une image Docker personnalisé. Les instructions pour sa création et déploiement sont :

```bash
# Terminal ouvert à la racine de ce projet

# Build l'image en local
docker buildx build --platform linux/amd64,linux/arm64  -t devops_dev_vscode -f ./config/docker/Dockerfile.dev .

# Trouver l'image
docker image ls | grep "devops_dev_vscode"  

# Retagger l'image avec l'adresse du repo at le numéro de version
docker tag devops_dev_vscode  rg.fr-par.scw.cloud/devops-code-samples-vscode/vscode_devops:2.0.1

# Créer une clé de connexion chez scaleway
SCW_SECRET_KEY=
docker login rg.fr-par.scw.cloud/devops-code-samples-vscode -u nologin --password-stdin <<< "$SCW_SECRET_KEY"

# Envoyer l'image dans le dépôt docker sur Scaleway
docker push rg.fr-par.scw.cloud/devops-code-samples-vscode/vscode_devops:2.0.1
```
