-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : ven. 11 juin 2021 à 09:10
-- Version du serveur :  5.7.31
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `capchat`
--

-- --------------------------------------------------------

--
-- Structure de la table `artiste`
--

DROP TABLE IF EXISTS `artiste`;
CREATE TABLE IF NOT EXISTS `artiste` (
  `id_artiste` int(11) NOT NULL AUTO_INCREMENT,
  `nom_artiste` varchar(150) NOT NULL,
  PRIMARY KEY (`id_artiste`),
  UNIQUE KEY `nom_artiste` (`nom_artiste`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `artiste`
--

INSERT INTO `artiste` (`id_artiste`, `nom_artiste`) VALUES
(9, 'artiste1'),
(10, 'artiste2'),
(11, 'artiste3'),
(12, 'artiste4'),
(13, 'artiste5'),
(14, 'artiste6'),
(15, 'artiste7'),
(16, 'artiste8'),
(22, 'artiste9');

-- --------------------------------------------------------

--
-- Structure de la table `indice`
--

DROP TABLE IF EXISTS `indice`;
CREATE TABLE IF NOT EXISTS `indice` (
  `id_indice` int(11) NOT NULL AUTO_INCREMENT,
  `id_jeu_image` int(11) NOT NULL,
  `text_indice` text NOT NULL,
  `numero_image` int(11) NOT NULL,
  PRIMARY KEY (`id_indice`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `indice`
--

INSERT INTO `indice` (`id_indice`, `id_jeu_image`, `text_indice`, `numero_image`) VALUES
(1, 3, 'Saurez-vous reconnaître le chat de Thomas Pesquet?', 1),
(2, 3, 'Chaussez vos lunettes et montrez-moi le chat myope ?', 2),
(3, 3, 'Saurez vous reconnaître un chat amoureux ?', 3),
(4, 3, 'Mon chat est une fausse blonde', 4),
(5, 3, 'Ce chat là a fait une croix sur son oeil', 5),
(6, 3, 'Ne confondons pas une salicorne et un chat-licorne !', 7),
(7, 3, 'C\'est encore le chat qui porte le chapeau', 6),
(8, 3, 'Ce chat là a oublié de se faire vacciner contre la grippe', 8),
(9, 3, 'Quel type de chat se cache derrière ses moustaches  ?', 9),
(10, 3, 'Après la fiancée du pirate, voici le chat du corsaire', 10),
(11, 3, 'Chat du grand bleu', 11),
(12, 3, 'C\'est la reine d\'Angleterre qui a perdu son chat', 12),
(13, 3, 'Après les gilets jaunes, voici les foulards rouges', 13),
(14, 3, 'Ce chat ne s\'appelle pas personne', 14);

-- --------------------------------------------------------

--
-- Structure de la table `jeu_image`
--

DROP TABLE IF EXISTS `jeu_image`;
CREATE TABLE IF NOT EXISTS `jeu_image` (
  `id_jeu_image` int(11) NOT NULL AUTO_INCREMENT,
  `id_artiste` int(11) NOT NULL,
  `id_theme` int(11) NOT NULL,
  `nom_jeu_image` varchar(100) NOT NULL,
  `count_neutres` int(1) NOT NULL,
  `count_singuliers` int(1) NOT NULL,
  PRIMARY KEY (`id_jeu_image`),
  UNIQUE KEY `nom_jeu_image` (`nom_jeu_image`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `jeu_image`
--

INSERT INTO `jeu_image` (`id_jeu_image`, `id_artiste`, `id_theme`, `nom_jeu_image`, `count_neutres`, `count_singuliers`) VALUES
(3, 9, 1, 'capchat', 13, 14),
(4, 10, 2, 'capmontagne', 0, 0),
(7, 13, 5, 'capyramide', 0, 0),
(8, 11, 3, 'capfruit', 12, 12),
(10, 11, 3, 'caplegume', 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `theme`
--

DROP TABLE IF EXISTS `theme`;
CREATE TABLE IF NOT EXISTS `theme` (
  `id_theme` int(11) NOT NULL AUTO_INCREMENT,
  `nom_theme` varchar(75) NOT NULL,
  PRIMARY KEY (`id_theme`),
  UNIQUE KEY `nom_theme` (`nom_theme`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `theme`
--

INSERT INTO `theme` (`id_theme`, `nom_theme`) VALUES
(1, 'Animaux'),
(2, 'Paysages'),
(3, 'Nourritures'),
(4, 'Personnes'),
(5, 'Monuments');

-- --------------------------------------------------------

--
-- Structure de la table `token`
--

DROP TABLE IF EXISTS `token`;
CREATE TABLE IF NOT EXISTS `token` (
  `id_token` int(11) NOT NULL AUTO_INCREMENT,
  `token_value` varchar(255) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  PRIMARY KEY (`id_token`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `identifiant` varchar(75) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `identifiant` (`identifiant`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
