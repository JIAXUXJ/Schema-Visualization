-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: testdatabase

SET FOREIGN_KEY_CHECKS= 0;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointment` (
  `patientID` int(11) DEFAULT NULL,
  `appointmentID` int(11) NOT NULL AUTO_INCREMENT,
  `dateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`appointmentID`),
  KEY `patientID` (`patientID`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`patientID`) REFERENCES `patients` (`patientID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (2,6,'1992-12-26 12:30:00'),(4,7,'1993-02-26 13:30:00'),(NULL,14,'2015-11-16 10:05:09'),(1,15,'1992-12-24 10:00:00'),(1,16,'2015-10-10 10:00:00');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `last_name` char(12) DEFAULT NULL,
  `first_name` char(12) DEFAULT NULL,
  `phone_number` char(15) DEFAULT NULL,
  `patientID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`patientID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES ('name1','name2','2508888888',1),('name3','name4','2502882888',2),('SB_NO2','DSB','2222222223',4),('test','test','test',6),(NULL,NULL,NULL,7),('nuLL','kk','null',10),('user1','user1','1234',11),('user2','user2','12345',12),('user3','user3','1234\\',13);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;
SET FOREIGN_KEY_CHECKS= 1;
