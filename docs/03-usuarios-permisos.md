# 3. Erabiltzaile eta baimen konfigurazioa

## 3.1. Sistemako erabiltzaileak

Hiru erabiltzaile-mota behar ditugu Linux-eko sisteman:

| Erabiltzailea | Erabilera | SSH | FTP | Baimenak |
|---|---|---|---|---|
| `administratzailea` | Webguneko erabiltzaileak sortzeko login-a (segurtasuna indartzeko) | Bai | Ez | sudo |
| `frontuser` | Frontend-a igotzeko | **Ez** | Bai | Idazketa `/var/www/frontend` soilik |
| `backuser` | Backend-a igotzeko (SSH+Git) | Bai | **Ez** | Idazketa `/var/www/backend` soilik |

```bash
# Erabiltzaile administratiboa (SSH bidez konektatzeko baimenarekin)
sudo adduser administratzailea
sudo usermod -aG sudo administratzailea

# frontuser: FTP soilik, ez du shell interaktiborik behar
sudo adduser --shell /usr/sbin/nologin --home /var/www/frontend frontuser
sudo mkdir -p /var/www/frontend
sudo chown frontuser:frontuser /var/www/frontend

# backuser: SSH + git soilik, ez du FTPrik behar
sudo adduser --shell /bin/bash --home /var/www/backend backuser
sudo mkdir -p /var/www/backend
sudo chown backuser:backuser /var/www/backend
```

## 3.2. Baimenak (Apache-k irakurri ahal izateko)

```bash
# www-data taldeko kide egin frontuser eta backuser, Apache-k
# fitxategiak zerbitzatu ahal izateko
sudo usermod -aG www-data frontuser
sudo usermod -aG www-data backuser

sudo chmod -R 750 /var/www/frontend /var/www/backend
sudo chgrp -R www-data /var/www/frontend /var/www/backend
```

## 3.3. Erabiltzaileak sistemarako sarbidea

- `frontuser`-ek **ezin du** SSH bidez konektatu; shell-a `/usr/sbin/nologin`
  jarrita dago horretarako (ikus [06-ssh.md](06-ssh.md) `AllowUsers`
  direktiba osagarriarekin).
- `backuser`-ek **ezin du** fitxategirik FTP bidez transferitu; vsftpd
  konfigurazioan `backuser` ez dago baimendutako erabiltzaileen zerrendan
  (ikus [05-ftp-vsftpd.md](05-ftp-vsftpd.md)).
- Webguneko erabiltzaileak (aplikazioaren `admin`/`user` erabiltzaileak,
  MariaDB-ko `usuarios` taulan daudenak) sortzeko, Linux-eko
  `administratzailea` erabiltzailearekin logeatuta egon behar da
  (erronkaren eskakizuna).

## 3.4. Sistemaren pasahitz-direktibak (PAM)

```bash
sudo apt install libpam-pwquality -y
```

`/etc/pam.d/common-password` fitxategian:

```
password requisite pam_pwquality.so retry=3 minlen=10 dcredit=-1 ucredit=-1
```

Honek gutxienez 10 karaktereko pasahitzak eskatzen ditu, zenbaki bat eta
letra larri bat gutxienez.
