# 5. FTP zerbitzaria (vsftpd)

## 5.1. Instalazioa

```bash
sudo apt install vsftpd -y
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.orig   # jatorrizkoaren babeskopia
```

## 5.2. Konfigurazioa (`/etc/vsftpd.conf`)

```ini
# --- Oinarrizkoa ---
listen=YES
listen_ipv6=NO
anonymous_enable=YES
local_enable=YES
write_enable=YES

# --- Sarbide anonimoa: soilik /srv/ftp/public kudeatzeko ---
anon_root=/srv/ftp/public
anon_upload_enable=YES
anon_mkdir_write_enable=YES
anon_other_write_enable=YES
no_anon_password=YES

# --- Erabiltzaile errealak (frontuser) chroot batean, bere karpetara mugatuta ---
chroot_local_user=YES
allow_writeable_chroot=YES
local_root=/var/www/frontend
userlist_enable=YES
userlist_file=/etc/vsftpd.userlist
userlist_deny=NO        # zerrendan daudenak SOILIK onartzen ditu

# --- Modu aktiboa eta pasiboa ---
pasv_enable=YES
pasv_min_port=40000
pasv_max_port=40100
port_enable=YES

# --- TLS/SSL (FTP segurua) ---
ssl_enable=YES
rsa_cert_file=/etc/vsftpd/vsftpd-talde4.crt
rsa_private_key_file=/etc/vsftpd/vsftpd-talde4.key
force_local_data_ssl=YES
force_local_logins_ssl=YES
ssl_tlsv1=YES
ssl_sslv2=NO
ssl_sslv3=NO
require_ssl_reuse=NO
ssl_ciphers=HIGH

# --- Loguak ---
xferlog_enable=YES
xferlog_file=/var/log/vsftpd.log
```

## 5.3. Ziurtagiri autofirmatua FTPrako

```bash
sudo mkdir -p /etc/vsftpd
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/vsftpd/vsftpd-talde4.key \
  -out /etc/vsftpd/vsftpd-talde4.crt \
  -subj "/C=ES/ST=Bizkaia/L=Santurtzi/O=Talde X/CN=server.talde4.edu"
```

## 5.4. Zerrenda eta karpetak

```bash
# Erabiltzaile onartuen zerrenda
echo "frontuser" | sudo tee /etc/vsftpd.userlist

# Karpeta anonimoa
sudo mkdir -p /srv/ftp/public
sudo chown ftp:ftp /srv/ftp/public
sudo chmod 755 /srv/ftp/public
```

> `backuser`-ek **ez du FTP bidez konektatzeko baimenik**: ez dago
> `/etc/vsftpd.userlist`-en, beraz `userlist_deny=NO` konfigurazioarekin
> automatikoki blokeatuta geratzen da.

## 5.5. Zerbitzua abiarazi eta egiaztatu

```bash
sudo systemctl restart vsftpd
sudo systemctl enable vsftpd
sudo systemctl status vsftpd

# Bezero gisa probak: komando-lerroan
ftp server.talde4.edu
# eta modu grafikoan (FileZilla): FTPS (Explicit) modua erabiliz
```
