import { Business } from "@/app/models/business";
import { MCPRequest } from "@/app/models/MCPRequest";
import { BusinessService } from "@/app/services/businessesService";
import { NextResponse } from 'next/server';

const businessService = new BusinessService();

export async function POST(request: Request) {
    try {
        const body: MCPRequest = await request.json();
        const method = body.method;

        console.log("Initilisation du serveur MCP :", body);

        switch (method) {
            case 'initialize':
                return initialize(body);
            case 'notifications/initialized':
                return sendInitializedNotification(body);
            case 'resources/list':
                return resourcesList(body);
            case 'tools/list':
                return toolsList(body);
            case 'tools/call':
                return managTools(body);


            case 'resources/read':
                const url = body.params.uri;
                return resourcesRead(body, url);

            default:
                return NextResponse.json(
                    { error: "Méthode inconnue" },
                    { status: 400 }
                );
        }

    } catch (err) {
        console.error("Erreur MCP :", err);
        return NextResponse.json(
            { error: "Erreur interne serveur MCP" },
            { status: 500 }
        );
    }
}

function sendInitializedNotification(body: MCPRequest) {
    return NextResponse.json({
        jsonrpc: body.jsonrpc,
        method: "notifications/initialized"
    });
}

function resourcesRead(body: MCPRequest, url: string) {
    return NextResponse.json({
        "jsonrpc": "2.0",
        "id": body.id,
        "result": {
            "contents": [
                {
                    "uri": url,
                    "mimeType": "application/pdf",
                    "text": "Le contenue de fichier"
                }
            ]
        }
    })
}

function resourcesList(body: MCPRequest) {
    return NextResponse.json({
        "jsonrpc": "2.0",
        "id": body.id,
        "result": {
            "resources": [
                {
                    uri: 'file:///docs/ODBus_Metadata.pdf',
                    name: 'ODBus Metadata Documentation',
                    description: 'Official metadata document from Statistics Canada describing concepts, methodology, and data quality for the Open Database of Businesses (ODBus)',
                    mimeType: 'application/pdf'
                }
            ]
        }
    })
}


const initialize = (body: MCPRequest) => {
    return NextResponse.json({
        "jsonrpc": "2.0",
        "id": body.id,
        "result": {
            "protocolVersion": "2025-06-18",
            "capabilities": {
                "resources": {
                    "listChanged": false
                },
                "tools": {
                    "listChanged": false
                },
                "tool_invoke": {},
            },
            
            "serverInfo": {
                "name": "odbus-mcp-server",
                "version": "1.0.0"
            }
        }
    });
};


function toolsList(body: MCPRequest) {
    return NextResponse.json({
        "jsonrpc": "2.0",
        "id": body.id,
        "result": {
            "tools": [
                {
                    "name": "describe_dataset",
                    "title": "Get comprehensive metadata",
                    "description": "Get comprehensive metadata about the ODBus dataset including structure, fields, coverage, and data quality information",
                    "inputSchema": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                },

                {
                    "name": "search_businesses",
                    "description": "Search businesses by name, city, or address. Returns matching records with full details.",
                    "inputSchema": {
                        type: "object",
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search term (business name, municipality, or address)'
                            },

                            province: {
                                type: 'string',
                                description: 'Optional province filter (e.g., QC, ON, BC, AB, MB, SK, NS, NB, PE, NL, YT, NT, NU)'
                            },

                            limit: {
                                type: 'number',
                                description: 'Maximum number of results to return (default: 10, max: 100)',
                                default: 10
                            }
                        },
                        required: ['query']
                    },

                },

                {
                    name: 'get_statistics',
                    description: 'Get overall statistics about the dataset including distribution by province, sector, and business status',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            breakdown_by: {
                                type: 'string',
                                enum: ['province', 'sector', 'naics', 'status', 'provider', 'all'],
                                description: 'Type of breakdown to include (default: all)',
                                default: 'all'
                            }
                        },
                        required: []
                    }
                },

                {
                    name: 'filter_by_province',
                    description: 'Get businesses and detailed statistics for a specific province',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            province: {
                                type: 'string',
                                description: 'Province code (QC, ON, BC, AB, MB, SK, NS, NB, PE, NL, YT, NT, NU)'
                            },
                            sample_size: {
                                type: 'number',
                                description: 'Number of sample businesses to return (default: 5, max: 50)',
                                default: 5
                            }
                        },
                        required: ['province']
                    }
                },

                {
                    name: 'filter_by_sector',
                    description: 'Find businesses in a specific business sector with optional province filter',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sector: {
                                type: 'string',
                                description: 'Business sector keyword to search for (e.g., "retail", "food", "construction")'
                            },
                            province: {
                                type: 'string',
                                description: 'Optional province filter'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum results (default: 10, max: 100)',
                                default: 10
                            }
                        },
                        required: ['sector']
                    }
                },

                {
                    name: 'find_by_naics',
                    description: 'Find businesses by NAICS code. Can use 2-digit sector codes (e.g., "72" for Accommodation and Food Services) or more specific codes',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            naics_code: {
                                type: 'string',
                                description: 'NAICS code - can be partial (e.g., "72" finds all accommodation/food services)'
                            },
                            province: {
                                type: 'string',
                                description: 'Optional province filter'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum results (default: 10, max: 100)',
                                default: 10
                            }
                        },
                        required: ['naics_code']
                    }
                },

                {
                    name: 'filter_by_city',
                    description: 'Get all businesses in a specific city with statistics',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            city: {
                                type: 'string',
                                description: 'City name (e.g., "Montreal", "Toronto", "Vancouver")'
                            },
                            limit: {
                                type: 'number',
                                description: 'Maximum results (default: 10, max: 100)',
                                default: 10
                            }
                        },
                        required: ['city']
                    }
                }
            ]
        }
    })
}

async function managTools(body: MCPRequest) {
    const toolName = body.params.name;
    const business = await businessService.loadBusinesses();
    switch (toolName) {
        case 'describe_dataset':
            return describeDataset(body, business)
        case 'search_businesses':
            return searchBusinesses(body, business);
        case 'get_statistics':
            return getStatistics(body, business);
        case 'filter_by_province':
            return filterByProvince(body, business);
        case 'filter_by_sector':
            return filterBySector(body, business);
        case 'find_by_naics':
            return findByNaics(body, business);
        case 'filter_by_city':
            return filterByCity(body, business);

    }

}

function describeDataset(body: MCPRequest, businesses: Business[]) {
    const provinces = [...new Set(businesses.map(b => b.prov_terr))].filter(p => p);
    const sectors = [...new Set(businesses.map(b => b.business_sector))].filter(s => s);
    const providers = [...new Set(businesses.map(b => b.provider))].filter(p => p);
    const statuses = [...new Set(businesses.map(b => b.status))].filter(s => s);

    const datasetInfo = {
        name: 'Open Database of Businesses (ODBus)',
        version: body.id,
        source: 'Statistics Canada - Data Exploration and Integration Lab (DEIL)',
        release_date: 'November 28, 2023',
        licence: 'Open Government Licence - Canada',
        licence_url: 'https://open.canada.ca/en/open-government-licence-canada',
        lode_url: 'https://www.statcan.gc.ca/en/lode/databases/odbus',
        description: 'A harmonized database of businesses from open data sources across various levels of government in Canada. Contains business names, addresses, and industry information.',
        total_businesses: businesses.length,
        coverage: {
            provinces_territories: provinces.length,
            list: provinces.sort(),
            data_providers: providers.length,
            note: 'Quebec provincial registry excluded due to licence incompatibility (would add 2.6M+ businesses)'
        },
        sectors: {
            total_unique: sectors.length,
            classification: 'NAICS (North American Industry Classification System)'
        },
        status_values: statuses.sort(),
        fields: [
            { name: 'idx', description: 'Unique record index' },
            { name: 'business_name', description: 'Primary business name' },
            { name: 'alt_business_name', description: 'Alternative/secondary business name' },
            { name: 'business_sector', description: 'Primary industry sector' },
            { name: 'business_subsector', description: 'Industry subsector' },
            { name: 'business_description', description: 'Detailed business description' },
            { name: 'business_id_no', description: 'Unique business identifier from source' },
            { name: 'licence_number', description: 'Business licence number' },
            { name: 'licence_type', description: 'Type of business licence' },
            { name: 'derived_NAICS', description: 'NAICS code (derived/imputed by StatCan)' },
            { name: 'source_NAICS_primary', description: 'Primary NAICS from original source' },
            { name: 'source_NAICS_secondary', description: 'Secondary NAICS from source' },
            { name: 'NAICS_descr', description: 'Primary NAICS description' },
            { name: 'NAICS_descr2', description: 'Secondary NAICS description' },
            { name: 'latitude', description: 'Geographic latitude (5 decimal precision)' },
            { name: 'longitude', description: 'Geographic longitude (5 decimal precision)' },
            { name: 'full_address', description: 'Complete street address' },
            { name: 'postal_code', description: 'Canadian postal code' },
            { name: 'unit', description: 'Unit/suite number' },
            { name: 'street_no', description: 'Street number' },
            { name: 'street_name', description: 'Street name' },
            { name: 'street_direction', description: 'Street direction (N, S, E, W)' },
            { name: 'street_type', description: 'Street type (Ave, St, Rd, etc.)' },
            { name: 'city', description: 'City/municipality name' },
            { name: 'prov_terr', description: 'Province or territory code (2-letter)' },
            { name: 'total_no_employees', description: 'Total number of employees (when available)' },
            { name: 'status', description: 'Business operational status (Active, Not Active, Pending)' },
            { name: 'provider', description: 'Data source/provider name' },
            { name: 'geo_source', description: 'Source of geocoding (original vs imputed)' },
            { name: 'CSDUID', description: 'Census Subdivision Unique Identifier' },
            { name: 'CSDNAME', description: 'Census Subdivision Name' },
            { name: 'PRUID', description: 'Province/Territory Unique Identifier' }
        ],
        data_quality_notes: [
            'Businesses may appear multiple times if they hold multiple licences',
            '86% of businesses have NAICS codes (25% from source, 61% imputed)',
            'Addresses parsed using libpostal NLP',
            'Missing coordinates geocoded against Open Database of Addresses',
            '10,330 duplicates removed',
            'Data collected May-December 2022 from 70 sources'
        ],
        attribution_required: 'Contains information licensed under the Open Government Licence – Canada'
    };



    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(datasetInfo, null, 2)
                }
            ]
        }
    });
}

function searchBusinesses(body: MCPRequest, businesses: Business[]) {

    // On récupère les arguments envoyés par le client via JSON-RPC
    const args = body.params.arguments;

    // Normalisation de la requête en minuscule pour faciliter la recherche
    const query = args.query.toLowerCase();

    // Limite de résultats : maximum 100 même si l’utilisateur demande plus
    const searchLimit = Math.min(args.limit || 10, 100);

    let data;

    // ---- FILTRAGE PRINCIPAL DES ENTREPRISES ----
    // On recherche la query dans plusieurs colonnes du dataset :
    // nom d’entreprise, nom alternatif, ville, adresse, description, etc.
    let results = businesses.filter(b =>
        b.business_name?.toLowerCase().includes(query) ||
        b.alt_business_name?.toLowerCase().includes(query) ||
        b.city?.toLowerCase().includes(query) ||
        b.full_address?.toLowerCase().includes(query) ||
        b.business_description?.toLowerCase().includes(query)
    );

    // ---- FILTRE OPTIONNEL : PROVINCE ----
    // Si l'utilisateur a spécifié une province, on filtre les résultats
    if (args.province) {
        const prov = args.province.toUpperCase();
        results = results.filter(b => b.prov_terr === prov);
    }

    // ---- CAS : AUCUN RÉSULTAT ----
    if (results.length === 0) {
        data = {
            message: `No businesses found matching "${args.query}"${args.province ? ` in ${args.province}` : ''}`,
            suggestion: 'Try a broader search term, different spelling, or remove province filter',
            total_matches: 0,
            businesses: []
        };

    } else {

        // ---- CAS : RÉSULTATS TROUVÉS ----
        // On construit un objet clair et propre à renvoyer au client
        data = {
            query: args.query,
            province_filter: args.province || 'all provinces/territories',
            total_matches: results.length,
            returned: Math.min(results.length, searchLimit),

            // On renvoie uniquement les "searchLimit" premiers résultats
            businesses: results.slice(0, searchLimit).map(b => ({
                name: b.business_name,
                alt_name: b.alt_business_name || null,
                sector: b.business_sector,
                subsector: b.business_subsector || null,
                description: b.business_description || null,

                // Utilisation d’un NAICS dérivé si disponible, sinon la source primaire
                naics_code: b.derived_NAICS || b.source_NAICS_primary,
                naics_description: b.NAICS_descr || null,

                address: b.full_address,
                city: b.city,
                province: b.prov_terr,
                postal_code: b.postal_code,
                status: b.status,
                licence_type: b.licence_type || null,
                employees: b.total_no_employees || null,

                // Conversion des coordonnées en nombres si elles existent
                coordinates: b.latitude && b.longitude ? {
                    lat: parseFloat(b.latitude),
                    lon: parseFloat(b.longitude)
                } : null
            }))
        };
    }

    // ---- RÉPONSE JSON-RPC ----
    // Format strict : { jsonrpc, id, result }
    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [
                {
                    type: 'text',

                    // On renvoie "data" converti en texte JSON bien formaté
                    text: JSON.stringify(data, null, 2)
                }
            ]
        }
    });
}

function getStatistics(body: MCPRequest, businesses: Business[]) {
    // On récupère les arguments envoyés par le client via JSON-RPC
    const args = body.params.arguments;
    const breakdown = args.breakdown_by || 'all';
    console.log("Argument : ", args);
    const stats: any = {
        total_businesses: businesses.length,
        dataset_version: '1.0',
        reference_period: 'Data collected May-December 2022'
    };

    if (breakdown === 'province' || breakdown === 'all') {
        const provStats: Record<string, number> = {};
        businesses.forEach(b => {
            if (b.prov_terr) provStats[b.prov_terr] = (provStats[b.prov_terr] || 0) + 1;
        });
        stats.by_province = Object.entries(provStats)
            .sort((a, b) => b[1] - a[1])
            .map(([province, count]) => ({
                province,
                count,
                percentage: ((count / businesses.length) * 100).toFixed(2) + '%'
            }));
    }

    if (breakdown === 'sector' || breakdown === 'all') {
        const sectorStats: Record<string, number> = {};
        businesses.forEach(b => {
            if (b.business_sector) sectorStats[b.business_sector] = (sectorStats[b.business_sector] || 0) + 1;
        });
        stats.by_sector = Object.entries(sectorStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([sector, count]) => ({ sector, count }));
    }

    if (breakdown === 'naics' || breakdown === 'all') {
        const naicsStats: Record<string, number> = {};
        businesses.forEach(b => {
            const naics = b.derived_NAICS || b.source_NAICS_primary;
            if (naics) {
                const sector = naics.substring(0, 2);
                naicsStats[sector] = (naicsStats[sector] || 0) + 1;
            }
        });
        stats.by_naics_sector = Object.entries(naicsStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([code, count]) => ({ naics_code: code, count }));
    }


    if (breakdown === 'naics' || breakdown === 'all') {
        const naicsStats: Record<string, number> = {};
        businesses.forEach(b => {
            const naics = b.derived_NAICS || b.source_NAICS_primary;
            if (naics) {
                const sector = naics.substring(0, 2);
                naicsStats[sector] = (naicsStats[sector] || 0) + 1;
            }
        });
        stats.by_naics_sector = Object.entries(naicsStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([code, count]) => ({ naics_code: code, count }));
    }

    if (breakdown === 'provider' || breakdown === 'all') {
        const providerStats: Record<string, number> = {};
        businesses.forEach(b => {
            if (b.provider) providerStats[b.provider] = (providerStats[b.provider] || 0) + 1;
        });
        stats.by_provider = Object.entries(providerStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([provider, count]) => ({ provider, count }));
    }

    return NextResponse.json({
        "jsonrpc": "2.0",
        "id": body.id,
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": JSON.stringify(stats, null, 2)
                }
            ]
        }
    });

}

// ========================================
// FILTER BY PROVINCE
// ========================================
function filterByProvince(body: MCPRequest, businesses: Business[]) {
    const args = body.params.arguments;
    const prov = args.province.toUpperCase();
    const sampleSize = Math.min(args.sample_size || 5, 50);

    // Filtrer par province
    const provBusinesses = businesses.filter(b => b.prov_terr === prov);

    if (provBusinesses.length === 0) {
        const data = {
            error: `No businesses found for province/territory: ${prov}`,
            valid_provinces: [...new Set(businesses.map(b => b.prov_terr))].filter(p => p).sort()
        };

        return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(data, null, 2)
                }]
            }
        });
    }

    // Statistiques par secteur, NAICS, status, ville
    const provSectors: Record<string, number> = {};
    const naicsCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    provBusinesses.forEach(b => {
        if (b.business_sector) provSectors[b.business_sector] = (provSectors[b.business_sector] || 0) + 1;

        const naics = b.derived_NAICS || b.source_NAICS_primary;
        if (naics) {
            const sector = naics.substring(0, 2);
            naicsCounts[sector] = (naicsCounts[sector] || 0) + 1;
        }

        if (b.status) statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
        if (b.city) cityCounts[b.city] = (cityCounts[b.city] || 0) + 1;
    });

    const data = {
        province: prov,
        total_businesses: provBusinesses.length,
        percentage_of_total: ((provBusinesses.length / businesses.length) * 100).toFixed(2) + '%',
        statistics: {
            top_cities: Object.entries(cityCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([city, count]) => ({ city, count })),
            top_sectors: Object.entries(provSectors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([sector, count]) => ({ sector, count })),
            top_naics_codes: Object.entries(naicsCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([code, count]) => ({ naics_code: code, count })),
            by_status: Object.entries(statusCounts)
                .map(([status, count]) => ({ status, count }))
        },
        sample_businesses: provBusinesses.slice(0, sampleSize).map(b => ({
            name: b.business_name,
            sector: b.business_sector,
            city: b.city,
            address: b.full_address,
            naics: b.derived_NAICS || b.source_NAICS_primary,
            status: b.status
        }))
    };

    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [{
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }]
        }
    });
}

// ========================================
// FILTER BY SECTOR
// ========================================
function filterBySector(body: MCPRequest, businesses: Business[]) {
    const args = body.params.arguments;
    const sector = args.sector.toLowerCase();
    const sectorLimit = Math.min(args.limit || 10, 100);

    // Filtrer par secteur (recherche dans sector, subsector, description)
    let sectorResults = businesses.filter(b =>
        b.business_sector?.toLowerCase().includes(sector) ||
        b.business_subsector?.toLowerCase().includes(sector) ||
        b.business_description?.toLowerCase().includes(sector)
    );

    // Filtre optionnel par province
    if (args.province) {
        const p = args.province.toUpperCase();
        sectorResults = sectorResults.filter(b => b.prov_terr === p);
    }

    if (sectorResults.length === 0) {
        const data = {
            message: `No businesses found in sector matching "${args.sector}"${args.province ? ` in ${args.province}` : ''}`,
            suggestion: 'Try a broader sector term or remove province filter'
        };

        return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(data, null, 2)
                }]
            }
        });
    }

    const data = {
        sector_query: args.sector,
        province_filter: args.province || 'all provinces/territories',
        total_matches: sectorResults.length,
        returned: Math.min(sectorResults.length, sectorLimit),
        businesses: sectorResults.slice(0, sectorLimit).map(b => ({
            name: b.business_name,
            sector: b.business_sector,
            subsector: b.business_subsector || null,
            naics_code: b.derived_NAICS || b.source_NAICS_primary,
            city: b.city,
            province: b.prov_terr,
            status: b.status
        }))
    };

    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [{
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }]
        }
    });
}

// ========================================
// FIND BY NAICS
// ========================================
function findByNaics(body: MCPRequest, businesses: Business[]) {
    const args = body.params.arguments;
    const naics = args.naics_code;
    const naicsLimit = Math.min(args.limit || 10, 100);

    // Rechercher dans derived_NAICS, source_NAICS_primary, et source_NAICS_secondary
    let naicsResults = businesses.filter(b => {
        const derivedMatch = b.derived_NAICS?.startsWith(naics);
        const primaryMatch = b.source_NAICS_primary?.startsWith(naics);
        const secondaryMatch = b.source_NAICS_secondary?.startsWith(naics);
        return derivedMatch || primaryMatch || secondaryMatch;
    });

    // Filtre optionnel par province
    if (args.province) {
        const p = args.province.toUpperCase();
        naicsResults = naicsResults.filter(b => b.prov_terr === p);
    }

    if (naicsResults.length === 0) {
        const data = {
            message: `No businesses found with NAICS code starting with "${naics}"${args.province ? ` in ${args.province}` : ''}`,
            suggestion: 'Try a shorter NAICS code (e.g., just 2 digits for sector level)',
            example: 'NAICS 72 = Accommodation and Food Services'
        };

        return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(data, null, 2)
                }]
            }
        });
    }

    const data = {
        naics_code: naics,
        province_filter: args.province || 'all provinces/territories',
        total_matches: naicsResults.length,
        returned: Math.min(naicsResults.length, naicsLimit),
        businesses: naicsResults.slice(0, naicsLimit).map(b => ({
            name: b.business_name,
            naics_code: b.derived_NAICS || b.source_NAICS_primary,
            naics_description: b.NAICS_descr || null,
            sector: b.business_sector,
            city: b.city,
            province: b.prov_terr,
            address: b.full_address,
            status: b.status
        }))
    };

    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [{
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }]
        }
    });
}

// ========================================
// FILTER BY CITY
// ========================================
function filterByCity(body: MCPRequest, businesses: Business[]) {
    const args = body.params.arguments;
    const cityQuery = args.city.toLowerCase();
    const cityLimit = Math.min(args.limit || 10, 100);

    // Filtrer par ville
    const cityResults = businesses.filter(b =>
        b.city?.toLowerCase().includes(cityQuery)
    );

    if (cityResults.length === 0) {
        const data = {
            message: `No businesses found in city matching "${args.city}"`,
            suggestion: 'Try a different spelling or check the city name',
            example: 'Try "Montreal", "Toronto", "Vancouver", etc.'
        };

        return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
                content: [{
                    type: 'text',
                    text: JSON.stringify(data, null, 2)
                }]
            }
        });
    }

    // Statistiques par secteur pour cette ville
    const citySectors: Record<string, number> = {};
    cityResults.forEach(b => {
        if (b.business_sector) citySectors[b.business_sector] = (citySectors[b.business_sector] || 0) + 1;
    });

    const data = {
        city: args.city,
        exact_city_name: cityResults[0]?.city || args.city,
        total_matches: cityResults.length,
        province: cityResults[0]?.prov_terr || 'Unknown',
        top_sectors: Object.entries(citySectors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([sector, count]) => ({ sector, count })),
        businesses: cityResults.slice(0, cityLimit).map(b => ({
            name: b.business_name,
            sector: b.business_sector,
            address: b.full_address,
            naics: b.derived_NAICS || b.source_NAICS_primary,
            status: b.status,
            postal_code: b.postal_code
        }))
    };

    return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
            content: [{
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }]
        }
    });
}