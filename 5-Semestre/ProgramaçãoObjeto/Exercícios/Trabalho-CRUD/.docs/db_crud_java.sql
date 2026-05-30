-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 20/05/2026 às 22:29
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `db_crud_java`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tab_clients`
--

CREATE TABLE `tab_clients` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `cpf` varchar(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tab_clients`
--

INSERT INTO `tab_clients` (`id`, `name`, `cpf`, `email`, `phone`, `address`, `createdAt`, `updatedAt`) VALUES
(1, 'joao da sila', '2', 'joao@mail.com', '178523698', 'rua dos bobos, 0 - centro - vila velha SP', '2026-05-15 15:07:02', '2026-05-15 19:35:30'),
(2, 'Cícero dos Santos', '3', 'cicero@email.com', '12345678985', 'Endereço 23', '2026-05-15 15:08:27', '2026-05-16 01:02:43'),
(3, 'Novo Cliente', '55555555555', 'email@email.com', '12345678996', 'Endereço de exemplo 100 - centro - manaus brasil', '2026-05-15 15:48:18', '2026-05-20 20:19:43'),
(4, 'Pedro Manso', '11111111111', 'pedro.manso@gmail.com', '11111111111', 'Vila Velha 123', '2026-05-15 15:52:30', '2026-05-15 23:54:51'),
(5, 'Ze dos Santos', '12345855588', 'ze@admin.com', '36258988555', 'Rua do ze dos santos', '2026-05-15 20:36:54', '2026-05-15 20:36:54'),
(8, 'Ada', '14785236998', 'ada@ada.com', '98765412336', 'endereço da ada', '2026-05-15 21:19:49', '2026-05-15 21:19:49'),
(10, 'catarina', '98785265425', 'catarina@admin.com', '25874544777', 'endereço da catarina', '2026-05-15 21:20:33', '2026-05-15 21:20:33'),
(12, 'Novo Editado', '11111111111', 'novo@novo.com', '55555555555', 'Novo endereço', '2026-05-16 00:05:55', '2026-05-16 00:06:19');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tab_os`
--

CREATE TABLE `tab_os` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_client` int(11) NOT NULL,
  `equipament_defect` text NOT NULL,
  `description` text NOT NULL,
  `technical` varchar(200) DEFAULT NULL,
  `approved` tinyint(1) DEFAULT NULL,
  `value_os` decimal(10,2) DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updateAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tab_os`
--

INSERT INTO `tab_os` (`id`, `id_user`, `id_client`, `equipament_defect`, `description`, `technical`, `approved`, `value_os`, `createAt`, `updateAt`) VALUES
(1, 1, 1, 'sem imagem', 'equipament com 2 anos de uso aproximadamente, unico dono', 'Ze', 0, 200.00, '2026-05-07 18:31:45', '2026-05-07 18:31:45');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tab_users`
--

CREATE TABLE `tab_users` (
  `id` int(11) NOT NULL,
  `permission` tinyint(1) DEFAULT 0,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(6) NOT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updateAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tab_users`
--

INSERT INTO `tab_users` (`id`, `permission`, `name`, `email`, `password`, `phone`, `createAt`, `updateAt`) VALUES
(1, 1, 'Cicero', 'admin', 'admin', '17963258741', '2026-05-07 15:17:39', '2026-05-11 23:25:32'),
(2, 0, 'Jeff', 'jeff', '123456', '965236587', '2026-05-07 15:20:16', '2026-05-07 15:20:16'),
(3, 0, 'Zuck', 'zuck', '123456', '238999666', '2026-05-07 15:20:16', '2026-05-07 15:20:16'),
(4, 0, 'Musk', 'musk', '123456', '253999888', '2026-05-07 15:20:16', '2026-05-07 15:20:16'),
(7, 1, 'Lucio', 'lucio', '123456', '11111111111', '2026-05-09 02:54:36', '2026-05-09 02:57:02'),
(9, 1, 'Usuario para Deletar', 'usuario.deletar', '123456', '22222222222', '2026-05-12 21:03:05', '2026-05-12 21:09:00'),
(10, 1, 'Acabiu Jessica', 'jessica', '123456', '11111111111', '2026-05-12 21:08:21', '2026-05-12 21:08:21');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tab_clients`
--
ALTER TABLE `tab_clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `tab_os`
--
ALTER TABLE `tab_os`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_client` (`id_client`);

--
-- Índices de tabela `tab_users`
--
ALTER TABLE `tab_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tab_clients`
--
ALTER TABLE `tab_clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `tab_os`
--
ALTER TABLE `tab_os`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `tab_users`
--
ALTER TABLE `tab_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `tab_os`
--
ALTER TABLE `tab_os`
  ADD CONSTRAINT `tab_os_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `tab_users` (`id`),
  ADD CONSTRAINT `tab_os_ibfk_2` FOREIGN KEY (`id_client`) REFERENCES `tab_clients` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
