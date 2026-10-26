# 10. Git / GitHub erabilera

## 10.1. Errepositorioa sortu

1. GitHub-en errepositorio pribatu bat sortu (adib. `talde-X-inbentarioa`).
2. Irakaslea kolaboratzaile gisa gehitu.
3. Lokalean:

```bash
git init
git remote add origin git@github.com:talde-X/inbentarioa.git
git add .
git commit -m "Hasierako egitura: BD, backend, frontend, scripts, docs"
git push -u origin main
```

## 10.2. Adarren estrategia

- `main`: kode egonkorra, probatuta.
- `feature/<izena>`: ezaugarri berri bakoitzeko adarra.

```bash
git checkout -b feature/etiketen-crud
# ... aldaketak egin ...
git add .
git commit -m "Etiketen CRUD gehitu backend-ean"
git push -u origin feature/etiketen-crud
```

## 10.3. Issues eta Pull Requests

- Egiteko dagoen lan bakoitzeko **Issue** bat sortu (adib. "Erosketen
  formularioa gehitu"), taldekideari esleituta.
- Adarra amaitutakoan, **Pull Request** ireki `main`-erantz, gutxienez
  beste taldekide batek berrikusi (review) eta onartu behar du bateratu
  aurretik.
- PR bakoitzean, aldaketen laburpen bat idatzi eta lotutako Issue-a
  erreferentziatu (`Closes #12`).

## 10.4. Wiki eta Readme

- `README.md` erroko fitxategian: proiektuaren deskribapena, egitura eta
  hasteko urratsak (jada sortuta dago proiektu honetan).
- **GitHub Wiki**: `docs/` karpetako fitxategi guztiak Wiki orrialde gisa
  igo behar dira (kopiatu-itsatsi zuzenean edo `git clone` errepositorioaren
  Wiki-a eta fitxategiak bertan gehitu).

```bash
git clone git@github.com:talde-X/inbentarioa.wiki.git
cp docs/*.md inbentarioa.wiki/
cd inbentarioa.wiki
git add . && git commit -m "Dokumentazio teknikoa gehitu" && git push
```

## 10.5. `.gitignore` gomendatua

```gitignore
# Konfigurazio sentikorra
backend/config.local.php

# Sistema fitxategiak
.DS_Store
Thumbs.db

# Editoreak
.vscode/
.idea/
```
