-- Tabelle: Länder
CREATE TABLE tbl_countries (
    id_country INT AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(100) NOT NULL
);
 
-- Tabelle: Lehrbetriebe
CREATE TABLE tbl_lehrbetriebe (
    id_lehrbetrieb INT AUTO_INCREMENT PRIMARY KEY,
    firma VARCHAR(100) NOT NULL,
    strasse VARCHAR(100),
    plz VARCHAR(10),
    ort VARCHAR(100)
);
 
-- Tabelle: Lernende
CREATE TABLE tbl_lernende (
    id_lernende INT AUTO_INCREMENT PRIMARY KEY,
    vorname VARCHAR(50) NOT NULL,
    nachname VARCHAR(50) NOT NULL,
    strasse VARCHAR(100),
    plz VARCHAR(10),
    ort VARCHAR(100),
    nr_land INT,
    geschlecht ENUM('m','w','d'),
    telefon VARCHAR(20),
    handy VARCHAR(20),
    email VARCHAR(100),
    email_privat VARCHAR(100),
    birthdate DATE,
    FOREIGN KEY (nr_land) REFERENCES tbl_countries(id_country)
        ON UPDATE CASCADE ON DELETE SET NULL
);
 
-- Tabelle: Dozenten
CREATE TABLE tbl_dozenten (
    id_dozent INT AUTO_INCREMENT PRIMARY KEY,
    vorname VARCHAR(50) NOT NULL,
    nachname VARCHAR(50) NOT NULL,
    strasse VARCHAR(100),
    plz VARCHAR(10),
    ort VARCHAR(100),
    nr_land INT,
    geschlecht ENUM('m','w','d'),
    telefon VARCHAR(20),
    handy VARCHAR(20),
    email VARCHAR(100),
    birthdate DATE,
    FOREIGN KEY (nr_land) REFERENCES tbl_countries(id_country)
        ON UPDATE CASCADE ON DELETE SET NULL
);
 
-- Tabelle: Lehrbetriebe-Lernende (n:m Beziehung)
CREATE TABLE tbl_lehrbetriebe_lernende (
    id_lehrbetriebe_lernende INT AUTO_INCREMENT PRIMARY KEY,
    nr_lehrbetrieb INT NOT NULL,
    nr_lernende INT NOT NULL,
    start DATE,
    ende DATE,
    beruf VARCHAR(100),
    FOREIGN KEY (nr_lehrbetrieb) REFERENCES tbl_lehrbetriebe(id_lehrbetrieb)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (nr_lernende) REFERENCES tbl_lernende(id_lernende)
        ON UPDATE CASCADE ON DELETE CASCADE
);
 
-- Tabelle: Kurse
CREATE TABLE tbl_kurse (
    id_kurs INT AUTO_INCREMENT PRIMARY KEY,
    kursnummer VARCHAR(50),
    kursthema VARCHAR(100),
    inhalt TEXT,
    nr_dozent INT,
    startdatum DATE,
    enddatum DATE,
    dauer INT,
    FOREIGN KEY (nr_dozent) REFERENCES tbl_dozenten(id_dozent)
        ON UPDATE CASCADE ON DELETE SET NULL
);
 
-- Tabelle: Kurse-Lernende (n:m Beziehung)
CREATE TABLE tbl_kurse_lernende (
    id_kurse_lernende INT AUTO_INCREMENT PRIMARY KEY,
    nr_kurs INT NOT NULL,
    nr_lernende INT NOT NULL,
    note DECIMAL(3,1),
    FOREIGN KEY (nr_kurs) REFERENCES tbl_kurse(id_kurs)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (nr_lernende) REFERENCES tbl_lernende(id_lernende)
        ON UPDATE CASCADE ON DELETE CASCADE
);