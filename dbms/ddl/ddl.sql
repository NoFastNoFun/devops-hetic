
/* user */
create table if not exists user (
  userId int auto_increment not null,
  email varchar(256) unique not null, 
  familyName varchar(256), 
  givenName varchar(256), 
  balance int default 0, 
  primary key(userId)
);

drop trigger if exists before_insert_user;

create trigger before_insert_user
before insert
on user for each row set new.email = lower(trim(new.email));

/* ... */


/* Fichier d'un utilisateur */
create table if not exists user_file (
  fileId int auto_increment not null,
  userId int not null,
  storageKey varchar(512) not null,
  filename varchar(256),
  mimeType varchar(256),
  primary key(fileId),
  foreign key(userId) references user(userId) on delete cascade
);


/* Advertising */
create table if not exists advertiser (
  advertiserId int auto_increment not null,
  name varchar(256) not null,
  balance decimal(6,2) not null default 0 check (balance >= 0),
  primary key(advertiserId)
);

create table if not exists publisher (
  publisherId int auto_increment not null,
  name varchar(256) not null,
  balance decimal(6,2) not null default 0,
  primary key(publisherId)
);

create table if not exists advert (
  advertId int auto_increment not null,
  advertiserId int not null,
  price decimal(6,2) not null default 0 check (price >= 0),
  primary key(advertId),
  foreign key(advertiserId) references advertiser(advertiserId)
);

create table if not exists advert_view (
  advertViewId int auto_increment not null,  
  advertId int not null,  
  publisherId int not null,
  advertiserId int not null,
  userId int not null,
  total decimal(6,2) not null,
  advertiserDebit decimal(6,2) not null,
  publisherCredit decimal(6,2) not null,
  userCredit decimal(6,2) not null,
  primary key(advertViewId),
  foreign key(advertId) references advert(advertId),
  foreign key(publisherId) references publisher(publisherId),
  foreign key(advertiserId) references advertiser(advertiserId),
  foreign key(userId) references user(userId)  
);
