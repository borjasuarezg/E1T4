-- =====================================================================
--  INBENTARIO ERAGINKORRA - Esquema de base de datos
--  Motor: MariaDB / MySQL
--  Reto 1 - WAG2 (2.º DAW)
-- =====================================================================
--  Diseño pensado para cumplir los requisitos del documento del reto:
--   * Cada equipo (tipo/modelo de material) tiene nombre, descripción,
--     marca, modelo, categoría y stock.
--   * Cada unidad física inventariada lleva una ETIQUETA única.
--   * Una etiqueta está ubicada en una gela (sala), y esa ubicación
--     puede cambiar de fecha en fecha -> se guarda historial.
--   * El material fungible NO se etiqueta ni se inventaría por unidad,
--     solo se controla su stock.
--   * Las compras registran fecha de compra y actualizan el stock.
--   * Hay dos roles de usuario: admin y user. Solo admin gestiona
--     la tabla de usuarios.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS inventario_ethazi
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE inventario_ethazi;

-- ---------------------------------------------------------------------
-- 1. USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,          -- password_hash() de PHP (bcrypt/argon2)
    rol             ENUM('admin','user') NOT NULL DEFAULT 'user',
    activo          TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. CATEGORIAS  (Portatila, Mahaigaineko ekipoa, Periferikoak, ...)
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. GELAS (salas). Incluye biltegia (almacén) y mintegia (aula/taller)
-- ---------------------------------------------------------------------
CREATE TABLE gelas (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(80) NOT NULL UNIQUE,          -- p.ej. "Biltegia", "Mintegia 1"
    tipo    ENUM('biltegia','mintegia','beste') NOT NULL DEFAULT 'beste',
    ubicacion_fisica VARCHAR(150) NULL            -- planta/edificio, opcional
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. EQUIPOS (tipo de material / modelo de catálogo)
--    Ej: "Ikasle NUC Ordenagailua", categoría Mahaigaineko ekipoa, stock 25
-- ---------------------------------------------------------------------
CREATE TABLE equipos (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    descripcion     TEXT NULL,                    -- procesador, ram, hdd, gpu... o contenido de maletín
    marca           VARCHAR(80)  NOT NULL,
    modelo          VARCHAR(80)  NOT NULL,
    categoria_id    INT UNSIGNED NOT NULL,
    es_fungible     TINYINT(1)   NOT NULL DEFAULT 0,   -- 1 = material fungible (no se etiqueta)
    stock           INT UNSIGNED NOT NULL DEFAULT 0,   -- unidades disponibles (no inventariadas todavía)
    creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. ETIQUETAS (unidad física inventariada de un equipo)
--    Al inventariar una unidad, se descuenta del stock del equipo.
-- ---------------------------------------------------------------------
CREATE TABLE etiquetas (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo          VARCHAR(40)  NOT NULL UNIQUE,   -- código de la etiqueta física
    equipo_id       INT UNSIGNED NOT NULL,
    fecha_alta      DATE         NOT NULL,          -- fecha en la que se inventarió la unidad
    activa          TINYINT(1)   NOT NULL DEFAULT 1, -- 0 = dada de baja
    CONSTRAINT fk_etiquetas_equipo
        FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. UBICACIONES (historial de sala por etiqueta)
--    fecha_fin NULL = ubicación actual/vigente
-- ---------------------------------------------------------------------
CREATE TABLE ubicaciones (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    etiqueta_id INT UNSIGNED NOT NULL,
    gela_id     INT UNSIGNED NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin    DATE NULL,
    CONSTRAINT fk_ubicaciones_etiqueta
        FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ubicaciones_gela
        FOREIGN KEY (gela_id) REFERENCES gelas(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Vista de conveniencia: ubicación ACTUAL de cada etiqueta
CREATE OR REPLACE VIEW v_ubicacion_actual AS
SELECT u.etiqueta_id, u.gela_id, g.nombre AS gela_nombre, u.fecha_inicio
FROM ubicaciones u
JOIN gelas g ON g.id = u.gela_id
WHERE u.fecha_fin IS NULL;

-- ---------------------------------------------------------------------
-- 7. COMPRAS (alta de stock)
-- ---------------------------------------------------------------------
CREATE TABLE compras (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    equipo_id       INT UNSIGNED NOT NULL,
    fecha_compra    DATE NOT NULL,
    cantidad        INT UNSIGNED NOT NULL,
    proveedor       VARCHAR(120) NULL,
    precio_unitario DECIMAL(10,2) NULL,
    usuario_id      INT UNSIGNED NULL,          -- quién registró la compra
    CONSTRAINT fk_compras_equipo
        FOREIGN KEY (equipo_id) REFERENCES equipos(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_compras_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Trigger: al insertar una compra, aumenta el stock del equipo automáticamente
DELIMITER $$
CREATE TRIGGER trg_compras_after_insert
AFTER INSERT ON compras
FOR EACH ROW
BEGIN
    UPDATE equipos
       SET stock = stock + NEW.cantidad
     WHERE id = NEW.equipo_id;
END$$
DELIMITER ;

-- ---------------------------------------------------------------------
-- Datos iniciales de referencia (categorías y salas básicas)
-- ---------------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
 ('Portatila', 'Ordenagailu eramangarriak'),
 ('Mahaigaineko ekipoa', 'Ordenagailu finkoak / NUC'),
 ('Periferikoak', 'Sagua, teklatua, pantaila, etab.'),
 ('Beste batzuk', 'Bestelako ekipamendua');

INSERT INTO gelas (nombre, tipo) VALUES
 ('Biltegia', 'biltegia'),
 ('Mintegia', 'mintegia');

-- Usuario admin de ejemplo (contraseña real generarla con password_hash en PHP)
-- INSERT INTO usuarios (username, email, password_hash, rol)
-- VALUES ('admin', 'admin@fpsanturtzilh.eus', '$2y$10$....', 'admin');
