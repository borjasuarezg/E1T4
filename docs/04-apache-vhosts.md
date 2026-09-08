# 4. Apache eta Virtual Host-ak

## 4.1. Instalazioa

```bash
sudo apt update
sudo apt install apache2 php php-mysql libapache2-mod-php -y
sudo a2enmod rewrite ssl headers
sudo systemctl restart apache2
```

## 4.2. Ziurtagiri autofirmatuak

Talde bakoitzaren izena identifikatzen duen ziurtagiri bat sortu behar da.

```bash
sudo mkdir -p /etc/apache2/ssl

# Frontend-erako (www.talde4.edu)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/apache2/ssl/talde4-frontend.key \
  -out /etc/apache2/ssl/talde4-frontend.crt \
  -subj "/C=ES/ST=Bizkaia/L=Santurtzi/O=Talde X/CN=www.talde4.edu"

# Backend-erako (server.talde4.edu)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/apache2/ssl/talde4-backend.key \
  -out /etc/apache2/ssl/talde4-backend.crt \
  -subj "/C=ES/ST=Bizkaia/L=Santurtzi/O=Talde X/CN=server.talde4.edu"
```

## 4.3. Virtual Host — Frontend (`www.talde4.edu`)

Fitxategia: `/etc/apache2/sites-available/frontend-talde4.conf`

```apache
<VirtualHost *:80>
    ServerName www.talde4.edu
    Redirect permanent / https://www.talde4.edu/
</VirtualHost>

<VirtualHost *:443>
    ServerName www.talde4.edu
    DocumentRoot /var/www/frontend

    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/talde4-frontend.crt
    SSLCertificateKeyFile /etc/apache2/ssl/talde4-frontend.key

    <Directory /var/www/frontend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/talde4-error.log
    CustomLog ${APACHE_LOG_DIR}/talde4-access.log combined
</VirtualHost>
```

## 4.4. Virtual Host — Backend (`server.talde4.edu`)

Sarbidea **bezeroa hedatuta dagoen makinatik bakarrik** onartzen da
(`Require ip`, IP hori taldearen backend-a probatzeko erabiliko den
makinarekin ordeztu behar da: adib. irakaslearen sarea edo frontend-aren
IP bera monolitikoki hedatuz gero).

Fitxategia: `/etc/apache2/sites-available/backend-talde4.conf`

```apache
<VirtualHost *:80>
    ServerName server.talde4.edu
    Redirect permanent / https://server.talde4.edu/
</VirtualHost>

<VirtualHost *:443>
    ServerName server.talde4.edu
    DocumentRoot /var/www/backend

    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/talde4-backend.crt
    SSLCertificateKeyFile /etc/apache2/ssl/talde4-backend.key

    <Directory /var/www/backend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require ip 192.168.207.0/24
        # Produkzioan: Require ip <bezeroaren IP zehatza>
    </Directory>

    # PHPk zerbitzatu behar du API osoa; ez erakutsi kode iturburua
    <FilesMatch "\.(env|sql|md)$">
        Require all denied
    </FilesMatch>

    ErrorLog  ${APACHE_LOG_DIR}/talde4-error.log
    CustomLog ${APACHE_LOG_DIR}/talde4-access.log combined
</VirtualHost>
```

## 4.5. Aktibatu birtual-hostak

```bash
sudo a2ensite frontend-talde4.conf
sudo a2ensite backend-talde4.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 4.6. Log fitxategiak

Eskatutako izenekin sortzen dira goiko konfigurazioan
(`${APACHE_LOG_DIR}` normalean `/var/log/apache2` da):

- Erroreak: `talde4-error.log`
- Sarbideak: `talde4-access.log`

## 4.7. Funtzionamendu-probak

```bash
curl -Ik https://www.talde4.edu/           # frontend-a erantzuten duen egiaztatu
curl -Ik https://server.talde4.edu/api/auth/me   # backend-a erantzuten duen egiaztatu
apache2ctl -M | grep ssl                   # mod_ssl aktibo dagoen egiaztatu
```
