# Inbentario Eraginkorra — WAG2 1. Erronka

Web-aplikazioa FP Santurtzi LHko informatika-mintegiko ekipamenduaren
inbentarioa kudeatzeko. Proiektu honek eskatzen dituen atal guztiak biltzen ditu:
datu-basea, backend-a (PHP), frontend-a (HTML/CSS/JS) eta zerbitzariaren
hedapena (Apache, FTP, SSH, MariaDB, scripts).

> ⚠️ **Talde bakoitzak** `talde4` ordeztu behar du bere talde-zenbakiarekin
> (domeinuetan, `.htaccess`-etan eta konfigurazio-fitxategietan).

## Egitura

```
inventario/
├── database/
│   └── schema.sql              # BDaren diseinu osoa (taulak, FK, trigger, view)
├── backend/                    # PHP (server.talde4.edu)
│   ├── config.php              # DB konexioaren datuak
│   ├── db.php                  # PDO konexioa
│   ├── auth.php                # login/logout/register (saioak)
│   ├── helpers.php             # JSON erantzunak, balidazioa
│   ├── index.php               # API-aren router bakarra
│   ├── .htaccess                # /api/* -> index.php birbideratzea
│   └── api/
│       ├── equipos.php
│       ├── etiquetas.php
│       ├── catalogos.php       # categorias + gelas
│       ├── compras.php
│       └── usuarios.php
├── frontend/                   # HTML/CSS/JS (www.talde4.edu)
│   ├── login.html
│   ├── index.html              # ekipamendua
│   ├── etiquetas.html
│   ├── gelas.html
│   ├── compras.html
│   ├── usuarios.html
│   ├── css/style.css
│   └── js/*.js
├── scripts/
│   ├── backup.sh                # cron bidez programatzeko
│   └── monitor.sh
└── docs/                        # GitHub Wiki-rako edukia (Markdown)
    ├── 00-Home.md
    ├── 01-instalacion-proxmox-so.md
    ├── 02-configuracion-red.md
    ├── 03-usuarios-permisos.md
    ├── 04-apache-vhosts.md
    ├── 05-ftp-vsftpd.md
    ├── 06-ssh.md
    ├── 07-mariadb.md
    ├── 08-scripts-cron.md
    ├── 09-monitorizacion-servicios.md
    └── 10-git-github.md
```

## Hasteko urratsak

1. **Datu-basea**: `mysql -u root -p < database/schema.sql`
2. **Backend**: kopiatu `backend/` `server.talde4.edu`-ren document root-era.
   Editatu `backend/config.php` (DB erabiltzailea/pasahitza eta `cors_origin`).
3. **Frontend**: kopiatu `frontend/` `www.talde4.edu`-ren document root-era.
   Editatu `frontend/js/api.js` (`API_BASE`) zure backend domeinuarekin.
4. Xehetasun guztietarako (Apache, FTP, SSH, MariaDB, sarea...) ikusi `docs/` karpeta
   edo proiektuaren GitHub Wiki-a.

## Segurtasuna (laburpena)

- Pasahitzak `password_hash()`/`password_verify()` bidez (inoiz ez testu laura).
- Saio-kudeaketa PHP session seguruekin (httpOnly, secure, SameSite).
- SQL injekzioaren aurka: PDO sententzia prestatuak beti.
- Balidazio bikoitza: bezeroan (JS) eta zerbitzarian (PHP) beti.
- HTTPS derrigorrezkoa (ziurtagiri autosinatuak), HTTP -> HTTPS birbideratzea.
- SSH: pasahitzik gabe (klabe fitxategiak), root debekatuta, timeout 5 min.
- FTP: erabiltzaile anonimoa `/srv/ftp/public`-era mugatuta, gainerakoa seguru.

## Entregagarriak

Ikusi erronkaren dokumentua (`WAG2_Erronka_1_Ikasle_dokumentua.pdf`), 5. atala
"Egin beharreko lanak", modulu bakoitzeko entregagarrien zerrenda osoarekin.
