# Inbentario Eraginkorra — Wiki

Ongi etorri proiektuaren dokumentaziora. Hemen daude zerbitzariaren
instalazio, konfigurazio eta hedapen-prozesu guztien azalpenak.

## Aurkibidea

1. [Proxmox VE eta Sistema Eragilearen instalazioa](01-instalacion-proxmox-so.md)
2. [Sarearen konfigurazioa](02-configuracion-red.md)
3. [Erabiltzaile eta baimen konfigurazioa](03-usuarios-permisos.md)
4. [Apache eta Virtual Host-ak](04-apache-vhosts.md)
5. [FTP zerbitzaria (vsftpd)](05-ftp-vsftpd.md)
6. [SSH konfigurazioa](06-ssh.md)
7. [MariaDB / MySQL](07-mariadb.md)
8. [Scripts eta cron automatizazioa](08-scripts-cron.md)
9. [Zerbitzuen monitorizazioa](09-monitorizacion-servicios.md)
10. [Git / GitHub erabilera](10-git-github.md)

## Arkitekturaren laburpena

```
              HTTPS                       HTTPS (SSH bidez soilik onartua)
[ Erabiltzailea ] ───────► [ www.talde4.edu ] ───fetch/JSON───► [ server.talde4.edu ]
                             Apache + HTML/CSS/JS                Apache + PHP + MariaDB
                             (frontend virtual host)              (backend virtual host)
```

- **Bi virtual host** Apache-n zerbitzari berean: bata frontend-erako
  (`www.talde4.edu`) eta bestea backend-erako (`server.talde4.edu`).
- Backend-erako sarbidea bezeroa hedatuta dagoen makinatik soilik onartzen da.
- Bi erabiltzaile Linux-en sisteman: `frontuser` (FTP bidez frontend-a
  igotzeko, SSH gabe) eta `backuser` (SSH+Git bidez backend-a kudeatzeko,
  FTP gabe).
