# 7. MariaDB / MySQL

Erabakia: **MariaDB 10.11 (LTS)**, Debian/Ubuntu-ren biltegi ofizialetan
dagoena eta MySQL-rekin bateragarria dena.

## 7.1. Instalazioa

```bash
sudo apt install mariadb-server -y
sudo mysql_secure_installation
# - root-en pasahitza ezarri
# - erabiltzaile anonimoak kendu
# - urruneko root sarbidea debekatu
# - proba-datu-basea kendu
```

## 7.2. Datu-basea eta erabiltzaile propioa sortu

Ez da ona backend-ak `root`-ekin konektatzea. Aplikazioarentzako
erabiltzaile mugatu bat sortuko dugu:

```sql
-- mysql -u root -p bidez sartuta
SOURCE /ruta/al/repo/database/schema.sql;

CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY 'PASAHITZA';
GRANT SELECT, INSERT, UPDATE, DELETE ON e1inbentarioa.* TO 'inventario_app'@'localhost';
FLUSH PRIVILEGES;
```

Ondoren, `backend/config.php`-n `user`/`pass` horiekin osatu.

## 7.3. Bertsioa egiaztatu

```bash
mysql --version
sudo systemctl status mariadb
```

## 7.4. Babeskopiak

Egunero exekutatzeko `mysqldump` bidezko script bat gehi daiteke
`scripts/backup.sh`-i, edo cron bidez zuzenean:

```bash
0 3 * * * mysqldump -u inventario_app -p'PASAHITZA' e1inbentarioa | gzip > /home/backuser/backups/db-$(date +\%F).sql.gz
```
