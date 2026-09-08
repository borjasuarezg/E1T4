# 2. Sarearen konfigurazioa

DHCP **ez da** erabiliko; sare-txartela eskuz konfiguratu behar da IP finko
batekin. Erronkaren dokumentuak talde bakoitzari esleitutako IPa ematen du:

| Taldea | IPa | Gateway | DNS |
|---|---|---|---|
| 1 TALDEA | 192.168.207.41 | 192.168.207.1 | 8.8.8.8 |
| 2 TALDEA | 192.168.207.42 | 192.168.207.1 | 8.8.8.8 |
| 3 TALDEA | 192.168.207.43 | 192.168.207.1 | 8.8.8.8 |
| 4 TALDEA | 192.168.207.44 | 192.168.207.1 | 8.8.8.8 |

## Debian/Ubuntu (netplan edo /etc/network/interfaces)

**Netplan** erabiltzen bada (Ubuntu Server 24.04):

```yaml
# /etc/netplan/00-installer-config.yaml
network:
  version: 2
  ethernets:
    ens18:                     # zure interfazearen izena (ip a bidez egiaztatu)
      dhcp4: false
      addresses: [192.168.207.41/24]
      routes:
        - to: default
          via: 192.168.207.1
      nameservers:
        addresses: [8.8.8.8]
```

```bash
sudo netplan apply
```

**Debian klasikoa** erabiltzen bada:

```
# /etc/network/interfaces
auto ens18
iface ens18 inet static
    address 192.168.207.41
    netmask 255.255.255.0
    gateway 192.168.207.1
    dns-nameservers 8.8.8.8
```

```bash
sudo systemctl restart networking
```

## Egiaztapena

```bash
ip a                       # IPa ondo dagoela egiaztatu
ip route                   # gateway ondo dagoela egiaztatu
ping -c 4 192.168.207.1    # gateway-ra iristen den egiaztatu
ping -c 4 8.8.8.8          # kanpora ateratzen den egiaztatu
cat /etc/resolv.conf       # DNSa ondo konfiguratuta dagoen egiaztatu
```

## DNS zerbitzaria

Webgunea hedatzeko **ez da beharrezkoa** DNS zerbitzari propiorik
instalatzea. Frogak egiteko, `www.talde4.edu` eta `server.talde4.edu`
proba-makinaren `/etc/hosts` fitxategian gehitu behar dira:

```
192.168.207.41   www.talde4.edu
192.168.207.41   server.talde4.edu
```

(Windows-en: `C:\Windows\System32\drivers\etc\hosts`)
