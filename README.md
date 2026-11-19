# Inbentario Eraginkorra — WAG2 1. Erronka

Web-aplikazioa FP Santurtzi LHko informatika-mintegiko ekipamuien
inbentarioa kudeatzeko. Proiektu honek eskatzen dituen atal guztiak biltzen ditu:
datu-basea, backend-a (PHP), frontend-a (HTML/CSS/JS) eta bertizarienen
hedapen (Apache, FTP, SSH, MariaDB, scripts).

> ⚠️ **Talde bakoitzak** `talde4`ordeztu behar du bere talde-zenbakiarekin
> (domeinuetan, `.htaccess`-etan eta konfigurazio-fitxategietan).

## Egitura

```
inventario/
backend/
├── .htaccess                        # URL garbien berridazketa index.php fitxategira
├── index.php                        # Bideratzaile nagusia: CORS kudeaketa eta API bideratzea
├── config.php                       # Parametro zentralizatuak (DB, saioak, CORS)
├── db.php                           # PDO konexio bakarra (Singleton eredua)
├── auth.php                         # Autentifikazioa, saio seguruak eta rol-iragazkiak
├── helpers.php                      # JSON erantzunak, gorputzaren irakurketa eta baliozkotzea
├── api/                             # REST baliabideen sarrera-egokitzaileak
<<<<<<< HEAD
│   ├── equipos.php                  # Ekipamenduen sarrera-puntua
│   ├── etiquetas.php                # Etiketen sarrera-puntua
│   ├── catalogos.php                # Katalogoen sarrera-puntua (kategoriak eta gelak)
│   ├── compras.php                  # Erosketen sarrera-puntua
│   └── usuarios.php                 # Erabiltzaileen sarrera-puntua
├── controllers/                     # Kontroladoreak: HTTP baliozkotzea, baimenak eta fluxua
│   ├── EquiposController.php        # Ekipamenduen Kontroladorea
│   ├── EtiquetasController.php      # Etiketen Kontroladorea
│   ├── CatalogosController.php      # Katalogoen Kontroladorea
│   ├── ComprasController.php        # Erosketen Kontroladorea
│   └── UsuariosController.php       # Erabiltzaileen Kontroladorea
└── models/                          # Ereduak: prestatutako SQL kontsultak eta ACID transakzioak
    ├── EquiposModel.php             # Ekipamenduen Eredua
    ├── EtiquetasModel.php           # Etiketen Eredua
    ├── CatalogosModel.php           # Katalogoen Eredua
    ├── ComprasModel.php             # Erosketen Eredua
    └── UsuariosModel.php            # Erabiltzaileen Eredua
=======
│   ├── ekipamenduak.php             # Ekipamenduen sarrera-puntua
│   ├── etiketak.php                 # Etiketen sarrera-puntua
│   ├── katalogoak.php               # Katalogoen sarrera-puntua (kategoriak eta gelak)
│   ├── erosketak.php                # Erosketen sarrera-puntua
│   └── erabiltzaileak.php           # Erabiltzaileen sarrera-puntua
├── kontroladoreak/                  # Kontroladoreak: HTTP baliozkotzea, baimenak eta fluxua
│   ├── EkipamenduakKontroladorea.php # Ekipamenduen Kontroladorea
│   ├── EtiketakKontroladorea.php    # Etiketen Kontroladorea
│   ├── KatalogoakKontroladorea.php  # Katalogoen Kontroladorea
│   ├── ErosketakKontroladorea.php   # Erosketen Kontroladorea
│   └── ErabiltzaileakKontroladorea.php # Erabiltzaileen Kontroladorea
└── ereduak/                         # Ereduak: prestatutako SQL kontsultak eta ACID transakzioak
    ├── EkipamenduakEredua.php       # Ekipamenduen Eredua
    ├── EtiketakEredua.php           # Etiketen Eredua
    ├── KatalogoakEredua.php         # Katalogoen Eredua
    ├── ErosketakEredua.php          # Erosketen Eredua
    └── ErabiltzaileakEredua.php     # Erabiltzaileen Eredua
>>>>>>> fa83a54 (Aldaketak)

├ frontend/
│   ├── login.html
│   ├── index.html              # ekipamendua
│   ├── etiketak.html
│   ├── gelak.html
│   ├── erosketak.html
│   ├── erabiltzaileak.html
│   ├── css/style.css
│   └── js/*.js
├ scripts/
│   ├── backup.sh                # cron bidez programatzeko
│   └── monitor.sh
└ docs/                         # GitHub Wiki-rako edukia (Markdown)
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

## Segurtasuna (lurraldean)

- **Pasahitzak**: `password_hash()`/`password_verify()` bidez (sin contraseñas en texto plano).
- **Login/Registro**: Usa sentencias preparadas PDO, `password_hash` por defecto, y CSRF tokens.
- **Inyección SQL**: PDO sentencias preparadas siempre (atentatzen ditug).
- **Balidazio bikoitza**: Bezerton JavaScript (cliente) eta zerbitzaria (PHP) beti.
- **HTTPS derrigorrezkoa**: HTTP -> HTTPS birbideratzea obligatoria.
- **SSH**: Pasahitzik gabe (klabe fitxategiak), root debekatuta, timeout 5 min.
- **FTP**: Erabiltzaile anonimoa `/srv/ftp/public`-era mugatuta, segurtasuna TLS/SSL.
- **CSRF Tokens**: Cada petición de escritura debe incluir el header `X-CSRF-Token`.

## Entregagarriak

Ikosi erronkaren dokumentua (`WAG2_Erronka_1_Ikasle_dokumentua.pdf`), 5. atala
"Egin beharreko lanak", moduluengo entregagarrien zerrenda osoakin.
