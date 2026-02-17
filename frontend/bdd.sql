-- Base de datos sencilla con Producto, Cliente y Pedidos
-- MySQL con Xampp
CREATE DATABASE IF NOT EXISTS legos_avril
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE legos_avril;

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido1 VARCHAR(50) NOT NULL,
  apellido2 VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  codigo_postal VARCHAR(10) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  CONSTRAINT fk_pedidos_clientes
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pedido_detalle (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),

  CONSTRAINT fk_detalle_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO clientes (nombre, apellido1, apellido2, email, codigo_postal, activo) VALUES
("Harón","García","Serrano","aitana.garcia@legosavril.com","23001", true),
("Avril","Merino","Moreno","avril.martinez@legosavril.com","28013", true),
("Eduardo","Cano","Lozano","edu.cano@legosavril.com","41001", false),
("Leo","Sánchez","Navarro","leo.sanchez@legosavril.com","29002", true),
("Vega","Romero","Díaz","vega.romero@legosavril.com","03001", true),
("Izan","Torres","Morales","izan.torres@legosavril.com","15001", false),
("Carla","Vargas","Ortega","carla.vargas@legosavril.com","50003", true),
("Daniel","Molina","Castro","daniel.molina@legosavril.com","47001", true),
("Lucía","Suárez","Méndez","lucia.suarez@legosavril.com","33002", true),
("Álex","Ramírez","Iglesias","alex.ramirez@legosavril.com","08002", false),
("Martina","Flores","Cruz","martina.flores@legosavril.com","35001", true),
("Enzo","Herrera","Vega","enzo.herrera@legosavril.com","46002", true),
("Sofía","Giménez","Pardo","sofia.gimenez@legosavril.com","20003", false),
("Mario","Rojas","Gil","mario.rojas@legosavril.com","24001", true),
("Emma","Moreno","Peña","emma.moreno@legosavril.com","06001", true),
("Thiago","Prieto","Soto","thiago.prieto@legosavril.com","14002", false),
("Paula","Núñez","Rey","paula.nunez@legosavril.com","01001", true),
("Bruno","Delgado","Campos","bruno.delgado@legosavril.com","37001", true),
("Valeria","Cano","Ramos","valeria.cano@legosavril.com","44001", true),
("Adrián","Marín","Vidal","adrian.marin@legosavril.com","18001", false),
("Nerea","Santos","Fuentes","nerea.santos@legosavril.com","48001", true),
("Sergio","Cabrera","Cortés","sergio.cabrera@legosavril.com","12002", true),
("Claudia","Pascual","León","claudia.pascual@legosavril.com","52001", false),
("Dylan","Lorenzo","Silva","dylan.lorenzo@legosavril.com","21001", true),
("Irene","Benítez","Rivas","irene.benitez@legosavril.com","39002", true),
("Samuel","Crespo","Aguilar","samuel.crespo@legosavril.com","30001", false),
("Lara","Reina","Siles","lara.reina@legosavril.com","13001", true),
("Eric","Vicente","Soria","eric.vicente@legosavril.com","09001", true),
("Mía","Domínguez","Blanco","mia.dominguez@legosavril.com","16002", true),
("Gael","Pérez","Acosta","gael.perez@legosavril.com","26001", false);

INSERT INTO productos (nombre, precio) VALUES
("LEGO City - Policía (Set 60312)", 29.99),
("LEGO City - Bomberos (Set 60321)", 34.99),
("LEGO Friends - Cafetería (Set 41719)", 24.99),
("LEGO Friends - Casa (Set 41724)", 49.99),
("LEGO Technic - Bugatti (Set 42162)", 54.99),
("LEGO Technic - Excavadora (Set 42122)", 39.99),
("LEGO Creator 3en1 - Dinosaurio (Set 31151)", 12.99),
("LEGO Creator 3en1 - Casa Moderna (Set 31153)", 21.99),
("LEGO Star Wars - X-Wing (Set 75355)", 239.99),
("LEGO Star Wars - Battle Pack (Set 75359)", 19.99),
("LEGO Harry Potter - Hogwarts (Set 76419)", 169.99),
("LEGO Marvel - Spider-Man (Set 76261)", 14.99),
("LEGO Ninjago - Dragón (Set 71786)", 99.99),
("LEGO Speed Champions - Ferrari (Set 76914)", 24.99),
("LEGO Icons - Ramo de Flores (Set 10280)", 49.99),
("LEGO Minecraft - La Mina (Set 21166)", 19.99);