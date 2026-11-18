#!/bin/bash
# =====================================================================
# backup.sh - Segurtasun kopia bat sortzen du direktorio baten fitxategiak
#             .tar.gz formatuan, egungo data izenean sartuta.
#
# Erabilera:  ./backup.sh /jatorrizko/direktorioa [/helmuga/direktorioa]
# Cron adibidea (egunero 02:00etan):
#   0 2 * * * /home/backuser/scripts/backup.sh /var/www/backend >> /var/log/backup.log 2>&1
# =====================================================================

set -euo pipefail

ORIGEN="${1:-}"
DESTINO="${2:-/home/backuser/backups}"
FECHA=$(date +'%Y-%m-%d_%H%M%S')

if [[ -z "$ORIGEN" ]]; then
    echo "Errorea: babeskopiatu beharreko direktorioa eman behar duzu." >&2
    echo "Erabilera: $0 /jatorrizko/direktorioa [/helmuga/direktorioa]" >&2
    exit 1
fi

if [[ ! -d "$ORIGEN" ]]; then
    echo "Errorea: '$ORIGEN' direktorioa ez da existitzen." >&2
    exit 1
fi

mkdir -p "$DESTINO"

NOMBRE_BASE=$(basename "$ORIGEN")
FICHERO_DESTINO="${DESTINO}/${NOMBRE_BASE}-${FECHA}.tar.gz"

echo "[$(date)] Babeskopia hasten: $ORIGEN -> $FICHERO_DESTINO"
tar -czf "$FICHERO_DESTINO" -C "$(dirname "$ORIGEN")" "$NOMBRE_BASE"
echo "[$(date)] Babeskopia amaituta. Tamaina: $(du -h "$FICHERO_DESTINO" | cut -f1)"

# Mantenimiento: elimina copias con más de 14 días de antigüedad
find "$DESTINO" -name "${NOMBRE_BASE}-*.tar.gz" -mtime +14 -exec rm -v {} \;

echo "[$(date)] Prozesua amaitu da."
