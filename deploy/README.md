# Inbentario Eraginkorra - Guía de Despliegue

## Arquitectura del Proyecto
Este proyecto es un inventario de equipamiento informático para FP Santurtzi, con:
- **Frontend**: HTML/CSS/JS en `www.talde4.edu` (ver `/deploy/apache-frontest.conf`)
- **Backend**: API PHP en `server.talde4.edu` (ver `/deploy/apache-backend.conf`)
- **Base de Datos**: MariaDB 10.11 con esquema en `/database/schema.sql`
- **FTP**: vsftpd seguro para transferencia de archivos
- **SSH**: Acceso remoto con claves públicas

## 1. Instalación de la Base de Datos

```bash
# Importar el esquema
mysql -u root -p < database/schema.sql

# Crear usuario de aplicación
mysql -u root -p -e "
CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY 'tu_password_segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario_ethazi.* TO 'inventario_app'@'localhost';
FLUSH PRIVILEGES;
"
```

Actualizar `backend/config.php` con los datos correctos.

## 2. Configuración del Backend (PHP)

```bash
# Mover/backend los archivos al document root
cp -r backend/* /var/www/backend/
cp config.php /var/www/backend/config.php
# Editar config.php con los datos de la BD y CORS
```

## 3. Configuración del Frontend (HTML/JS)

```bash
# Mover frontend al document root
cp -r frontend/* /var/www/frontend/
```

## 4. Configuración de Apache

```bash
# Activar módulos necesarios
sudo a2enmod rewrite ssl headers headers

# Copiar configuraciones de virtual host
sudo cp deploy/apache-frontest.conf /etc/apache2/sites-available/talde4-frontend.conf
sudo cp deploy/apache-backend.conf /etc/apache2/sites-available/talde4-backend.conf

# Activar sitios y desactivar default
sudo a2ensite talde4-frontend.conf
sudo a2ensite talde4-backend.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

## 5. SSH Hardening

```bash
# Copiar configuración SSH endurecida
sudo cp deploy/sshd_config /etc/ssh/sshd_config
sudo systemctl restart ssh
```

Pasos para generar y configurar claves:

```bash
# Generar clave cliente (en el equipo del usuario)
ssh-keygen -t ed25519 -C "usuario@talde4"

# Copiar la clave pública al servidor
ssh-copy-id -i ~/.ssh/id_ed25519.pub backuser@server.talde4.edu

# Probar conexión sin password
ssh backuser@server.talde4.edu
```

## 6. FTP Seguro (vsftpd)

```bash
# Copiar configuración vsftpd
sudo cp deploy/vsftpd.conf /etc/vsftpd.conf

# Crear directorio público anónimo
sudo mkdir -p /srv/ftp/public
sudo chown ftp:ftp /srv/ftp/public
sudo chmod 755 /srv/ftp/public

# Crear usuario frontuser (solo FTP, sin shell)
sudo adduser --shell /usr/sbin/nologin --home /var/www/frontend frontuser
sudo mkdir -p /var/www/frontend
sudo chown frontuser:frontuser /var/www/frontend

# Añadir frontuser a la lista de usuarios permitidos de vsftpd
echo "frontuser" | sudo tee /etc/vsftpd.userlist

# Generar certificado autofirmado para FTPS
sudo mkdir -p /etc/vsftpd
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/vsftpd/vsftpd-talde4.key \
  -out /etc/vsftpd/vsftpd-talde4.crt \
  -subj "/C=ES/ST=Bizkaia/L=Santurtzi/O=Talde X/CN=server.talde4.edu"

sudo systemctl restart vsftpd
```

Para conectarse con FileZilla:
- Protocolo: FTPS - File Transfer Protocol over TLS
- Encriptación: Usar FTPS (Explicit TLS/SSL)
- Servidor: server.talde4.edu
- Usuario: frontuser (anonimous también funciona para /srv/ftp/public)

## 7. Scripts de Mantenimiento

### Backup automatizado (scripts/backup.sh)
```bash
# El script ya está en scripts/backup.sh
# Cron: 0 2 * * * /var/www/backend/scripts/backup.sh /var/www/backend >> /var/log/backup.log 2>&1
```

### Monitorización (scripts/monitor.sh)
```bash
# El script ya está en scripts/monitor.sh
# Cron: */10 * * * * /var/www/backend/scripts/monitor.sh /var/log/monitor >> /var/log/monitor-cron.log 2>&1
```

## 8. Git y GitHub

```bash
# Ver .gitignore (ver /deploy/.gitignore)
cat .gitignore

# Flujo de trabajo típico:
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad
# 2. Hacer commits
git add .
git commit -m "Descripción de los cambios"
# 3. Subir a GitHub
git push -u origin feature/nueva-funcionalidad
# 4. Crear Pull Request para revisión y merge a main
```

## 9. Wiki

Los documentos en `docs/` pueden subirse a la Wiki de GitHub:

```bash
# Clonar la wiki
git clone git@github.com:talde-X/inbentarioa.wiki.git

# Copiar documentos
cp docs/*.md inbentarioa.wiki/

# Commit y push
cd inbentarioa.wiki
git add .
git commit -m "Dokumentazio teknikoa gehitu"
git push
```