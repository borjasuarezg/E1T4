# 9. Zerbitzuen monitorizazioa eta sarearen diagnostikoa

## 9.1. Baliabideen egoera aztertzeko komandoak

| Komandoa | Zer erakusten du |
|---|---|
| `top` / `htop` | Prozesu aktiboak eta CPU/RAM erabileraren jarraipena denbora errealean |
| `df -h` | Diskoko partizioen erabilera (irakurgarria: GB/MB) |
| `free -h` | Memoria (RAM) erabilera, cache barne |
| `uptime` | Sistema noiztik dagoen martxan eta karga-batazbestekoa (load average) |
| `iostat` | Diskoaren errendimendua eta erabilera (aukerazkoa, `sysstat` paketea) |

```bash
sudo apt install sysstat -y   # iostat erabili nahi bada
```

Emaitza bakoitzari buruzko ondorioak (dokumentazioan sartu behar dena):
- `top`/`htop`: prozesu bat CPU/RAM gehiegi kontsumitzen ari bada, hemen
  antzematen da lehenengoz.
- `df -h`: partizio bat %90 baino gorago badago, arriskutsua da.
- `free -h`: memoria librea gutxi bada eta swap asko erabiltzen bada,
  sistemak arazoak izan ditzake.
- `uptime`: load average 1/5/15 minutuko batazbestekoak dira; balioa
  nukleo kopurua baino handiagoa bada, sistema gainkargatuta dago.

## 9.2. Zerbitzuen egoera egiaztatzea

```bash
systemctl status ssh
systemctl status vsftpd
systemctl status apache2
systemctl status mariadb
```

| Zerbitzua | Egoera aktiboaren esanahia |
|---|---|
| `ssh` | Urruneko kudeaketa eskuragarri dago |
| `vsftpd` | Fitxategi-transferentzia eskuragarri dago |
| `apache2` | Web-orriak zerbitzatzen ari da |
| `mariadb` | Datu-basea eskuragarri dago backend-arentzat |

Laburpen-taula bat (aktibo / geldirik) eta pantaila-argazkiak sartu behar
dira proiektuaren dokumentazioan, benetako zerbitzariaren emaitzekin.

## 9.3. Sarearen diagnostikoa

```bash
ip a                                  # interfazeen egoera
ip route                              # ibilbideak
ping -c 4 192.168.207.1               # gateway-rako konexioa
ping -c 4 8.8.8.8                     # kanpo konexioa
traceroute 8.8.8.8                    # ibilbidearen jarraipena
ss -tulnp                             # zabalik dauden atakak eta zerbitzuak
curl -Ik https://www.talde4.edu       # web zerbitzariaren erantzuna
```
