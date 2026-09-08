# 1. Proxmox VE eta Sistema Eragilearen instalazioa

## 1.1. Proxmox VE

Talde bakoitzak dagoeneko esku hartzen duen zerbitzari lokal batean
(IP: `192.168.207.4X`) **Proxmox VE** instalatu behar da hypervisor gisa.

Urrats orokorrak:

1. Proxmox VE-ren ISO instalatzailea deskargatu eta USB batean grabatu
   (edo iDRAC/iLO bidez muntatu birtualizazio bidez).
2. Zerbitzaria ISOtik abiarazi eta instalazio-morroia jarraitu:
   - Diskoaren aukeraketa (ZFS/ext4, taldearen beharren arabera).
   - Herrialdea/ordu-eremua konfiguratu.
   - Kudeaketa-sarearen IPa: erabili taulan emandako IPa
     (`192.168.207.4X`), maskara `/24`, gateway `192.168.207.1`.
3. Instalazioa amaitzean, web kudeaketa-interfazera sartu:
   `https://192.168.207.4X:8006` erabiltzaile hau erabiliz: `T{X} - ikasle123`.

## 1.2. Sistema eragile librea aukeratzea

Backend/frontend zerbitzariari eusteko makina birtual bat sortuko dugu
Proxmox-en gainean. Aukera gomendatuak: **Debian 12** edo **Ubuntu Server
24.04 LTS** (biak librea, dokumentazio zabala eta Apache/PHP/MariaDB-rekin
bateragarritasun ona).

1. Proxmox-en, `Create VM` sakatu.
2. ISOa igo (edo cloud-image erabili) eta baliabideak esleitu:
   CPU 2 nukleo, RAM 4 GB, disko 40 GB gutxienez (proiektuaren arabera doitu).
3. Sare txartela `virtio` motakoa jarri, bridge `vmbr0`-ri lotuta.
4. SE instalatu, DHCP desaktibatuta utziz (sarea eskuz konfiguratuko dugu,
   ikus [02-configuracion-red.md](02-configuracion-red.md)).
5. Instalazio ostean:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 1.3. Egindako prozesuaren dokumentazioa

Kapitulu honetan pantaila-argazkiak eta oharrak sartu behar dira benetako
instalazioarekin: erabilitako SEa eta bertsioa, baliabide esleituak,
eta topatutako arazoak (baldin badaude) eta konponbideak.
