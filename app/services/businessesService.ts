import path from "path";
import { Business } from "../models/business";
import fs from 'fs';
import Papa from 'papaparse'


export class BusinessService {
    businessesCache: Business[] | null = null;
    isLoading = false;

    // Charger le csv
    async loadBusinesses(): Promise<Business[]> {
        if (this.businessesCache) return this.businessesCache;

        if (this.isLoading) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.loadBusinesses();
        }

        this.isLoading = true;
        console.log('🔄 Chargement du CSV ODBus...');
        const startTime = Date.now();

        try {
            let csvText: string;

            // En développement : charger depuis le dossier local
            if (process.env.NODE_ENV === 'development') {
                const csvPath = path.join(process.cwd(), 'dataSet', 'ODBus_v1.csv');
                csvText = fs.readFileSync(csvPath, 'utf-8');
            } else {
                csvText = await this.telechargerCsv();
            }

            // Parser avec PapaParse - Configuration robuste
            const parsed = Papa.parse<Business>(csvText, {
                header: true,
                skipEmptyLines: 'greedy', // Ignore toutes les lignes vides
                dynamicTyping: false,
                transformHeader: (h) => h.trim(),
                // Options pour gérer les erreurs
                delimiter: ',',
                newline: '\n',
                quoteChar: '"',
                escapeChar: '"',
                // Continuer même avec des erreurs
                comments: false,
                // Délimiteurs à deviner si problème
                delimitersToGuess: [',', '\t', '|', ';']
            });

            // Filtrer les lignes avec erreurs critiques
            const validBusinesses = parsed.data.filter((row, index) => {
                // Vérifier que la ligne a au moins un business_name
                if (!row.business_name || row.business_name.trim() === '') {
                    return false;
                }
                return true;
            });

            // Logger les erreurs pour debug
            if (parsed.errors.length > 0) {
                const criticalErrors = parsed.errors.filter(e => e.type === 'FieldMismatch');
                console.warn(`⚠️ ${criticalErrors.length} lignes avec erreurs de champs ignorées`);
                console.warn('Exemples d\'erreurs:', parsed.errors.slice(0, 3));
            }

            this.businessesCache = validBusinesses;
            console.log(`✅ ${this.businessesCache.length} entreprises chargées en ${Date.now() - startTime}ms`);

            this.isLoading = false;
            return this.businessesCache;
        } catch (error) {
            this.isLoading = false;
            console.error('❌ Erreur chargement CSV:', error);
            throw new Error(`Impossible de charger le dataset ODBus: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async telechargerCsv() {
        // En production : charger depuis URL externe
        const startTime = Date.now();
        const csvUrl = process.env.CSV_URL;
        if (!csvUrl) {
            throw new Error('CSV_URL non définie dans les variables d\'environnement');
        }

        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        console.log(`✅ CSV téléchargé (${(csvText.length / 1024 / 1024).toFixed(2)} MB) en ${Date.now() - startTime}ms`);
        return csvText
    }

}