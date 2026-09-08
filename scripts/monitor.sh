#!/bin/bash
# =====================================================================
# monitor.sh - Sistemaren baliabideen egoera aztertu eta emaitzak
#              monitor-YYYY-MM-DD_HHMMSS.log fitxategi batean gorde.
#
# Erabilera:  ./monitor.sh [helmuga_direktorioa]
# Cron adibidea (10 minuturo):
#   */10 * * * * /home/backuser/scripts/monitor.sh /var/log/monitor >> /var/log/monitor-cron.log 2>&1
# =====================================================================

set -euo pipefail

DESTINO="${1:-/var/log/monitor}"
mkdir -p "$DESTINO"

FECHA=$(date +'%Y-%m-%d_%H%M%S')
LOGFILE="${DESTINO}/monitor-${FECHA}.log"

{
    echo "===================================================="
    echo " SISTEMAREN MONITORIZAZIOA - $(date)"
    echo "===================================================="

    echo -e "\n--- uptime (funtzionamendu-denbora eta karga) ---"
    uptime

    echo -e "\n--- CPU / prozesu aktiboak (top -bn1) ---"
    top -bn1 | head -n 15

    echo -e "\n--- Memoria erabilera (free -h) ---"
    free -h

    echo -e "\n--- Diskoko partizioen erabilera (df -h) ---"
    df -h

    if command -v iostat &> /dev/null; then
        echo -e "\n--- Diskoaren errendimendua (iostat) ---"
        iostat
    fi

    echo -e "\n--- Zerbitzuen egoera ---"
    for servicio in ssh vsftpd apache2; do
        if systemctl list-unit-files | grep -q "^${servicio}.service"; then
            estado=$(systemctl is-active "$servicio" 2>/dev/null || echo "ezezaguna")
            printf "  %-10s : %s\n" "$servicio" "$estado"
        else
            printf "  %-10s : ez dago instalatuta\n" "$servicio"
        fi
    done

} > "$LOGFILE"

echo "Monitorizazioa gordeta: $LOGFILE"
