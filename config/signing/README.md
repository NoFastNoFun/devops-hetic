# Les clés pour la signature

Utilisez les commandes suivantes pour générer une paire de clés à utiliser pour signer les JWT :

```
ssh-keygen -t rsa -b 2048 -m PEM -f signing.key
openssl rsa -in signing.key -pubout -outform PEM -out signing.pub
```

> Attention ! Normalement on ne commit jamais les clés dans GIT, mais pour que cette démo fonctionne plus facilement, on l'inclu par défaut.