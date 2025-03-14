/*
Script de création de la base de données.
*/
create database IF NOT EXISTS school;

/* Créer l'utilisateur API */
create user IF NOT EXISTS 'api-dev'@'%.%.%.%' identified by 'api-dev-password';
grant select, update, insert, delete on school.* to 'api-dev'@'%.%.%.%';
flush privileges;