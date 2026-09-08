# 8. Scripts eta cron automatizazioa

## 8.1. Script-ak

- `scripts/backup.sh`: babeskopia bat sortzen du (`.tar.gz`) emandako
  direktorio batetik, egungo data izenean sartuta, eta 14 egun baino
  zaharragoak diren babeskopiak ezabatzen ditu.
- `scripts/monitor.sh`: `top`, `df -h`, `free -h` eta zerbitzuen egoera
  jasotzen ditu `monitor-$(date).log` fitxategi batean.

## 8.2. Exekuzio-baimenak

```bash
chmod +x scripts/backup.sh scripts/monitor.sh
```

## 8.3. Cron bidez programatzea

```bash
crontab -e -u backuser
```

Gehitu lerro hauek:

```cron
# Egunero 02:00etan, backend-aren babeskopia
0 2 * * * /var/www/backend-scripts/backup.sh /var/www/backend /home/backuser/backups >> /var/log/backup.log 2>&1

# 10 minuturo, sistemaren monitorizazioa
*/10 * * * * /var/www/backend-scripts/monitor.sh /var/log/monitor >> /var/log/monitor-cron.log 2>&1
```

## 8.4. Egiaztapena

```bash
crontab -l -u backuser          # programatutako atazak zerrendatu
sudo systemctl status cron      # cron zerbitzua martxan dagoen egiaztatu
ls -lh /home/backuser/backups   # sortutako babeskopiak ikusi
ls -lh /var/log/monitor         # sortutako monitorizazio-loguak ikusi
```
