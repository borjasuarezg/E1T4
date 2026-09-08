# 6. SSH konfigurazioa

## 6.1. Instalazioa eta klabeak

```bash
sudo apt install openssh-server -y

# Bezeroan (zure ordenagailuan), sortu klabe-pare bat baldin ez baduzu:
ssh-keygen -t ed25519 -C "backuser@talde4"

# Klabe publikoa zerbitzarira kopiatu (backuser sortuta dagoenean)
ssh-copy-id -i ~/.ssh/id_ed25519.pub backuser@192.168.207.4X
```

## 6.2. `/etc/ssh/sshd_config` konfigurazioa

```ini
# --- Autentifikazioa: pasahitzik gabe, klabe fitxategiekin soilik ---
PasswordAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey

# --- Root erabiltzaileak ezin du kautotu ---
PermitRootLogin no

# --- Zein erabiltzaile onartzen dira SSH bidez ---
AllowUsers administratzailea backuser

# --- Aldi berean bi konexio soilik ---
MaxSessions 2
MaxStartups 2

# --- Inaktibitate-denbora: 5 minutu igarota deskonektatu ---
ClientAliveInterval 60
ClientAliveCountMax 5
# 60s * 5 = 300s = 5 minutu jarduerarik gabe -> deskonektatu

# Segurtasun gehigarria
X11Forwarding no
```

`frontuser`-i shell-a `/usr/sbin/nologin` jarrita dagoenez (ikus
[03-usuarios-permisos.md](03-usuarios-permisos.md)), ez du inoiz SSH bidez
konektatzeko aukerarik izango, `AllowUsers` zerrendan ez egoteaz gain.

## 6.3. Zerbitzua berrabiarazi eta egiaztatu

```bash
sudo sshd -t                     # konfigurazioaren sintaxia egiaztatu
sudo systemctl restart ssh
sudo systemctl status ssh

# Bezerotik proba:
ssh backuser@server.talde4.edu   # klabearekin sartu behar da, pasahitzik eskatu gabe
ssh root@server.talde4.edu       # honek huts egin behar du (Permission denied)
```

## 6.4. Firewall (osagarria)

```bash
sudo apt install ufw -y
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw allow 20,21/tcp
sudo ufw allow 40000:40100/tcp   # vsftpd pasv_min_port/pasv_max_port tartea
sudo ufw enable
sudo ufw status verbose
```
