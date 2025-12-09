# 🧩 ODBus MCP Server

Serveur MCP (Model Context Protocol) développé pour le **MCP Developer Challenge**.
Il expose un dataset LODE public (Open Database of Businesses – Statistics Canada) via un ensemble d’outils accessibles directement dans ChatGPT à travers un connecteur MCP.

---

## 🚀 **URL du serveur MCP (SSE Endpoint)**

Ce serveur est accessible via un endpoint SSE compatible avec le protocole MCP :

➡️ **[https://next-odbus-mcp-server.vercel.app/api/sse](https://next-odbus-mcp-server.vercel.app/api/sse)**

Le superviseur peut ajouter ce serveur dans ChatGPT via :

**Settings → Developer Tools → Model Context Protocol → Add Server → Server URL →**
`https://next-odbus-mcp-server.vercel.app/api/sse`

---

# 📘 **Description du projet**

Ce projet expose un ensemble d’outils MCP permettant :

* d’interroger des entreprises canadiennes
* de filtrer le dataset par province, ville, secteur, NAICS, etc.
* de produire des statistiques agrégées
* de consulter les métadonnées complètes du dataset ODBus

Le dataset source est un fichier CSV LODE public hébergé sur GitHub.

---

# 📚 **Dataset utilisé : ODBus (Open Database of Businesses)**

Le serveur repose sur le dataset public :

**Open Database of Businesses (ODBus)**
Source : Statistics Canada – Data Exploration and Integration Lab (DEIL)

Le dataset contient :

* ~1M entreprises harmonisées
* nom, adresse, ville, province
* NAICS dérivé + NAICS source
* secteurs, statut, source de données
* coordonnées géographiques
* champs normalisés LODE

Ce dataset est mis à disposition sous Licence du gouvernement ouvert — Canada.

---

# 🧩 **Liste des outils MCP disponibles**

Voici la liste complète des outils exposés via `tools/list`.

---

## 🔍 **1. describe_dataset**

**Description :**
Retourne les métadonnées complètes du dataset ODBus : champs, sources, structure, volumes, qualité des données, couverture géographique, licences, notes techniques.

**Input :** aucun
**Output :** bloc JSON formaté (type: "text").

---

## 🔎 **2. search_businesses**

**Description :**
Recherche d’entreprises par nom, ville, adresse, ou description.
Supporte un filtre optionnel par province.

**Arguments :**

* `query` (string, requis)
* `province` (string, optionnel)
* `limit` (number, optionnel, max 100)

**Exemples d’usage :**

* “Find businesses named Bakery in Quebec”
* “Search for restaurants in Vancouver”

---

## 📊 **3. get_statistics**

**Description :**
Retourne des statistiques agrégées globales sur le dataset :

* distribution par province
* distribution par secteur
* distribution NAICS (2-digit)
* distribution par fournisseur de données
* overview global

**Arguments :**

* `breakdown_by: "province" | "sector" | "naics" | "provider" | "all"`

---

## 🗺️ **4. filter_by_province**

**Description :**
Retourne toutes les entreprises d’une province + statistiques détaillées :

* villes les plus représentées
* secteurs dominants
* NAICS dominants
* statut des entreprises
* exemple d’entreprises

**Arguments :**

* `province` (string, requis)
* `sample_size` (number, optionnel, max 50)

---

## 🏢 **5. filter_by_sector**

**Description :**
Filtre par secteur économique (ex: retail, food, construction).
Peut être combiné à un filtre par province.

**Arguments :**

* `sector` (string, requis)
* `province` (string, optionnel)
* `limit` (number, optionnel, max 100)

---

## 🧾 **6. find_by_naics**

**Description :**
Recherche par code NAICS (2–6 digits).
Supporte des recherches partielles : “72” = Accommodation & Food Services.

**Arguments :**

* `naics_code` (string, requis)
* `province` (string, optionnel)
* `limit` (number, optionnel, max 100)

---

## 🏙️ **7. filter_by_city**

**Description :**
Liste et analyse toutes les entreprises d’une ville donnée.
Retourne les secteurs dominants + liste d’entreprises.

**Arguments :**

* `city` (string, requis)
* `limit` (number, optionnel, max 100)

---

# 🔧 **Implémentation technique**

## 🔹 Framework :

Next.js 14 — Route Handler (`app/api/sse/route.ts`)

## 🔹 Protocoles MCP supportés :

* `initialize`
* `notifications/initialized`
* `tools/list`
* `tools/call`
* `resources/list`
* `resources/read`

## 🔹 Format de réponse :

Toutes les réponses respectent la structure MCP :

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ ... }"
      }
    ]
  }
}
```

## 🔹 Dataset loading :

* Chargement CSV depuis GitHub (LODE format)
* Parsing en données exploitables en mémoire
* Transformations internes via BusinessService()

---

# 🧪 **Test du serveur dans ChatGPT (instructions superviseur)**

1. Ouvrir **ChatGPT** (GPT-4.1, GPT-4o ou GPT o-mini)
2. Aller dans **Settings → Developer Tools → MCP**
3. Cliquer sur **Add Server**
4. Entrer :

```
https://next-odbus-mcp-server.vercel.app/api/sse
```

5. Le serveur apparaîtra ensuite dans la liste des outils disponibles.
6. Tester un outil, par exemple :

```
Call tool → describe_dataset
```

ou simplement demander :

> “Find 5 construction businesses in Alberta using the MCP server.”

---

# 📩 **Contact**

Pour toute question ou remarque, n’hésitez pas à me contacter via le dépôt GitHub du projet.

---

# 🎉 Fin du README

Si tu veux, je peux aussi :

* l'adapter avec badges GitHub
* ajouter une section Installation locale
* créer un README bilingue EN/FR
* générer un logo / bannière pour le projet

Souhaites-tu une version améliorée ou stylée Markdown ?
