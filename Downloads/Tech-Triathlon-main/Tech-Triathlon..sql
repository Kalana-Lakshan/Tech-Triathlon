CREATE DATABASE  IF NOT EXISTS `govbot_sl` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `govbot_sl`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: govbot_sl
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `status` enum('pending','processing','approved','rejected','completed') DEFAULT 'pending',
  `reference_number` varchar(20) DEFAULT NULL,
  `documents` text,
  `appointment_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_number` (`reference_number`),
  KEY `service_id` (`service_id`),
  KEY `idx_applications_user_id` (`user_id`),
  KEY `idx_applications_status` (`status`),
  KEY `idx_applications_reference` (`reference_number`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `language` enum('sinhala','tamil','english') DEFAULT NULL,
  `status` enum('active','closed','escalated') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `description` text,
  `status` enum('open','investigating','resolved','closed') DEFAULT 'open',
  `assigned_officer` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complaints_user_id` (`user_id`),
  KEY `idx_complaints_status` (`status`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offices`
--

DROP TABLE IF EXISTS `offices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `department` varchar(100) NOT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_offices_district` (`district`),
  KEY `idx_offices_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offices`
--

LOCK TABLES `offices` WRITE;
/*!40000 ALTER TABLE `offices` DISABLE KEYS */;
INSERT INTO `offices` VALUES (1,'Colombo District Secretariat','General Administration','No. 123, Galle Road, Colombo 03','Colombo','Colombo','+94-11-2345678','colombo@district.gov.lk',6.92710000,79.86120000,'2025-08-09 05:18:17'),(2,'Kandy District Secretariat','General Administration','No. 456, Peradeniya Road, Kandy','Kandy','Kandy','+94-81-2345678','kandy@district.gov.lk',7.29060000,80.63370000,'2025-08-09 05:18:17'),(3,'Jaffna District Secretariat','General Administration','No. 789, Kandy Road, Jaffna','Jaffna','Jaffna','+94-21-2345678','jaffna@district.gov.lk',9.66150000,80.02550000,'2025-08-09 05:18:17'),(4,'Colombo District Secretariat','General Administration','No. 123, Galle Road, Colombo 03','Colombo','Colombo','+94-11-2345678','colombo@district.gov.lk',6.92710000,79.86120000,'2025-08-09 05:20:09'),(5,'Kandy District Secretariat','General Administration','No. 456, Peradeniya Road, Kandy','Kandy','Kandy','+94-81-2345678','kandy@district.gov.lk',7.29060000,80.63370000,'2025-08-09 05:20:09'),(6,'Jaffna District Secretariat','General Administration','No. 789, Kandy Road, Jaffna','Jaffna','Jaffna','+94-21-2345678','jaffna@district.gov.lk',9.66150000,80.02550000,'2025-08-09 05:20:09'),(7,'Colombo District Secretariat','General Administration','No. 123, Galle Road, Colombo 03','Colombo','Colombo','+94-11-2345678','colombo@district.gov.lk',6.92710000,79.86120000,'2025-08-09 06:20:02'),(8,'Kandy District Secretariat','General Administration','No. 456, Peradeniya Road, Kandy','Kandy','Kandy','+94-81-2345678','kandy@district.gov.lk',7.29060000,80.63370000,'2025-08-09 06:20:02'),(9,'Jaffna District Secretariat','General Administration','No. 789, Kandy Road, Jaffna','Jaffna','Jaffna','+94-21-2345678','jaffna@district.gov.lk',9.66150000,80.02550000,'2025-08-09 06:20:02');
/*!40000 ALTER TABLE `offices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `requirements` text,
  `fees` decimal(10,2) DEFAULT NULL,
  `processing_time` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_category` (`category`),
  KEY `idx_services_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Documents & Certificates','NIC Renewal','Renewal of National Identity Card','Old NIC, Passport size photos, Application form',500.00,'7-10 working days','Department of Registration of Persons','2025-08-09 05:18:17'),(2,'Documents & Certificates','Birth Certificate','Obtain birth certificate','Parents ID, Hospital records, Application form',200.00,'3-5 working days','Department of Registration of Persons','2025-08-09 05:18:17'),(3,'Benefits & Subsidies','Samurdhi Benefits','Apply for Samurdhi welfare benefits','NIC, Income certificate, Application form',0.00,'15-20 working days','Ministry of Social Welfare','2025-08-09 05:18:17'),(4,'Business Services','Business Registration','Register new business','NIC, Business plan, Application form',2500.00,'10-15 working days','Department of Registrar of Companies','2025-08-09 05:18:17'),(5,'Healthcare Services','Health Insurance','Apply for government health insurance','NIC, Medical certificate, Application form',1000.00,'5-7 working days','Ministry of Health','2025-08-09 05:18:17'),(6,'Documents & Certificates','NIC Renewal','Renewal of National Identity Card','Old NIC, Passport size photos, Application form',500.00,'7-10 working days','Department of Registration of Persons','2025-08-09 05:20:09'),(7,'Documents & Certificates','Birth Certificate','Obtain birth certificate','Parents ID, Hospital records, Application form',200.00,'3-5 working days','Department of Registration of Persons','2025-08-09 05:20:09'),(8,'Benefits & Subsidies','Samurdhi Benefits','Apply for Samurdhi welfare benefits','NIC, Income certificate, Application form',0.00,'15-20 working days','Ministry of Social Welfare','2025-08-09 05:20:09'),(9,'Business Services','Business Registration','Register new business','NIC, Business plan, Application form',2500.00,'10-15 working days','Department of Registrar of Companies','2025-08-09 05:20:09'),(10,'Healthcare Services','Health Insurance','Apply for government health insurance','NIC, Medical certificate, Application form',1000.00,'5-7 working days','Ministry of Health','2025-08-09 05:20:09'),(11,'Documents & Certificates','NIC Renewal','Renewal of National Identity Card','Old NIC, Passport size photos, Application form',500.00,'7-10 working days','Department of Registration of Persons','2025-08-09 06:20:02'),(12,'Documents & Certificates','Birth Certificate','Obtain birth certificate','Parents ID, Hospital records, Application form',200.00,'3-5 working days','Department of Registration of Persons','2025-08-09 06:20:02'),(13,'Benefits & Subsidies','Samurdhi Benefits','Apply for Samurdhi welfare benefits','NIC, Income certificate, Application form',0.00,'15-20 working days','Ministry of Social Welfare','2025-08-09 06:20:02'),(14,'Business Services','Business Registration','Register new business','NIC, Business plan, Application form',2500.00,'10-15 working days','Department of Registrar of Companies','2025-08-09 06:20:02'),(15,'Healthcare Services','Health Insurance','Apply for government health insurance','NIC, Medical certificate, Application form',1000.00,'5-7 working days','Ministry of Health','2025-08-09 06:20:02');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nic` varchar(12) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `language` enum('sinhala','tamil','english') DEFAULT 'english',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic` (`nic`),
  KEY `idx_users_nic` (`nic`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'123456789V','Test User','test@example.com','+94123456789','english','2025-08-09 06:20:12'),(2,'230','aa','a@gmail.com','0771224215','english','2025-08-09 06:23:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-09 12:07:49
