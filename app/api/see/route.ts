// import { Business } from "@/app/models/business";

// // Cache pour le dataset (sera chargé au premier appel)
// let businessesCache: Business[] | null = null;

// // Fonction pour charger le CSV
// async function loadBusinesses(): Promise<Business[]> {
//   if (businessesCache) return businessesCache;

//   try {
//     // Remplacez cette URL par votre CSV hébergé ou chargez depuis /public
//     const response = await fetch(process.env.CSV_URL || 'PUBLIC_CSV_PATH');
//     const csvText = await response.text();

//     // Parse CSV simple (vous pouvez utiliser papaparse pour plus de robustesse)
//     const lines = csvText.split('\n');
//     const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

//     const businesses: Business[] = [];
//     for (let i = 1; i < lines.length; i++) {
//       if (!lines[i].trim()) continue;

//       const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
//       const business: any = {};

//       headers.forEach((header, index) => {
//         business[header] = values[index]?.replace(/^"|"$/g, '').trim() || '';
//       });

//       businesses.push(business as Business);
//     }

//     businessesCache = businesses;
//     return businesses;
//   } catch (error) {
//     console.error('Erreur chargement CSV:', error);
//     throw new Error('Impossible de charger le dataset ODBus');
//   }
// }

// // Définition des outils MCP
// const TOOLS = [
//   {
//     name: 'describe_dataset',
//     description: 'Get information about the ODBus dataset structure, available fields, and statistics',
//     inputSchema: {
//       type: 'object',
//       properties: {},
//       required: []
//     }
//   },
//   {
//     name: 'search_businesses',
//     description: 'Search businesses by name, municipality, or address. Returns matching businesses.',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         query: {
//           type: 'string',
//           description: 'Search term (business name, city, or address)'
//         },
//         province: {
//           type: 'string',
//           description: 'Filter by province (e.g., ON, QC, BC)'
//         },
//         limit: {
//           type: 'number',
//           description: 'Maximum number of results (default: 10, max: 100)',
//           default: 10
//         }
//       },
//       required: ['query']
//     }
//   },
//   {
//     name: 'filter_by_sector',
//     description: 'Get businesses filtered by business sector with optional province filter',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         sector: {
//           type: 'string',
//           description: 'Business sector to filter by'
//         },
//         province: {
//           type: 'string',
//           description: 'Optional province filter (e.g., ON, QC, BC)'
//         },
//         limit: {
//           type: 'number',
//           description: 'Maximum number of results (default: 10, max: 100)',
//           default: 10
//         }
//       },
//       required: ['sector']
//     }
//   },
//   {
//     name: 'get_by_province',
//     description: 'Get statistics and sample businesses for a specific province',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         province: {
//           type: 'string',
//           description: 'Province code (e.g., ON, QC, BC, AB)'
//         },
//         sample_size: {
//           type: 'number',
//           description: 'Number of example businesses to return (default: 5)',
//           default: 5
//         }
//       },
//       required: ['province']
//     }
//   },
//   {
//     name: 'find_by_naics',
//     description: 'Find businesses by NAICS (North American Industry Classification System) code',
//     inputSchema: {
//       type: 'object',
//       properties: {
//         naics_code: {
//           type: 'string',
//           description: 'NAICS code (can be partial, e.g., "72" for Accommodation and Food Services)'
//         },
//         province: {
//           type: 'string',
//           description: 'Optional province filter'
//         },
//         limit: {
//           type: 'number',
//           description: 'Maximum results (default: 10)',
//           default: 10
//         }
//       },
//       required: ['naics_code']
//     }
//   },
//   {
//     name: 'get_statistics',
//     description: 'Get overall statistics about the ODBus dataset',
//     inputSchema: {
//       type: 'object',
//       properties: {},
//       required: []
//     }
//   }
// ];

// // Gestionnaire d'outils
// async function handleToolCall(name: string, args: any): Promise<any> {
//   const businesses = await loadBusinesses();
  
//   switch (name) {
//     case 'describe_dataset':
//       return {
//         dataset_name: 'Open Database of Businesses (ODBus)',
//         source: 'Statistics Canada',
//         licence: 'Open Government Licence - Canada',
//         total_records: businesses.length,
//         fields: [
//           { name: 'Name', description: 'Business name' },
//           { name: 'Business Sector', description: 'Industry sector' },
//           { name: 'Business ID number', description: 'Unique identifier' },
//           { name: 'Licence Number', description: 'Business licence number' },
//           { name: 'Licence Type', description: 'Type of business licence' },
//           { name: 'NAICS Code', description: 'North American Industry Classification System code' },
//           { name: 'Number of Employees', description: 'Employee count range' },
//           { name: 'Status', description: 'Business operational status' },
//           { name: 'Address', description: 'Street address' },
//           { name: 'Municipality Name', description: 'City/town name' },
//           { name: 'Province', description: 'Province code (e.g., ON, QC)' },
//           { name: 'Postal Code', description: 'Canadian postal code' },
//           { name: 'Census Subdivision Name', description: 'Census subdivision' },
//           { name: 'Longitude', description: 'Geographic longitude' },
//           { name: 'Latitude', description: 'Geographic latitude' }
//         ],
//         sample_provinces: [...new Set(businesses.slice(0, 1000).map(b => b.Province))].slice(0, 10)
//       };
      
//     case 'search_businesses':
//       const query = args.query.toLowerCase();
//       const searchProvince = args.province?.toUpperCase();
//       const searchLimit = Math.min(args.limit || 10, 100);
      
//       let results = businesses.filter(b => 
//         b.Name.toLowerCase().includes(query) ||
//         b['Municipality Name'].toLowerCase().includes(query) ||
//         b.Address.toLowerCase().includes(query)
//       );
      
//       if (searchProvince) {
//         results = results.filter(b => b.Province === searchProvince);
//       }
      
//       return {
//         total_matches: results.length,
//         returned: Math.min(results.length, searchLimit),
//         businesses: results.slice(0, searchLimit).map(b => ({
//           name: b.Name,
//           sector: b['Business Sector'],
//           address: b.Address,
//           municipality: b['Municipality Name'],
//           province: b.Province,
//           postal_code: b['Postal Code'],
//           naics_code: b['NAICS Code'],
//           status: b.Status
//         }))
//       };
      
//     case 'filter_by_sector':
//       const sector = args.sector.toLowerCase();
//       const sectorProvince = args.province?.toUpperCase();
//       const sectorLimit = Math.min(args.limit || 10, 100);
      
//       let sectorResults = businesses.filter(b => 
//         b['Business Sector'].toLowerCase().includes(sector)
//       );
      
//       if (sectorProvince) {
//         sectorResults = sectorResults.filter(b => b.Province === sectorProvince);
//       }
      
//       return {
//         sector_searched: args.sector,
//         total_matches: sectorResults.length,
//         returned: Math.min(sectorResults.length, sectorLimit),
//         businesses: sectorResults.slice(0, sectorLimit).map(b => ({
//           name: b.Name,
//           sector: b['Business Sector'],
//           municipality: b['Municipality Name'],
//           province: b.Province,
//           naics_code: b['NAICS Code']
//         }))
//       };
      
//     case 'get_by_province':
//       const province = args.province.toUpperCase();
//       const sampleSize = Math.min(args.sample_size || 5, 50);
      
//       const provinceBusinesses = businesses.filter(b => b.Province === province);
      
//       if (provinceBusinesses.length === 0) {
//         return { error: `No businesses found for province: ${province}` };
//       }
      
//       const sectors = {};
//       provinceBusinesses.forEach(b => {
//         const sector = b['Business Sector'];
//         sectors[sector] = (sectors[sector] || 0) + 1;
//       });
      
//       return {
//         province,
//         total_businesses: provinceBusinesses.length,
//         top_sectors: Object.entries(sectors)
//           .sort((a: any, b: any) => b[1] - a[1])
//           .slice(0, 5)
//           .map(([sector, count]) => ({ sector, count })),
//         sample_businesses: provinceBusinesses.slice(0, sampleSize).map(b => ({
//           name: b.Name,
//           sector: b['Business Sector'],
//           municipality: b['Municipality Name'],
//           address: b.Address
//         }))
//       };
      
//     case 'find_by_naics':
//       const naicsCode = args.naics_code;
//       const naicsProvince = args.province?.toUpperCase();
//       const naicsLimit = Math.min(args.limit || 10, 100);
      
//       let naicsResults = businesses.filter(b => 
//         b['NAICS Code'].startsWith(naicsCode)
//       );
      
//       if (naicsProvince) {
//         naicsResults = naicsResults.filter(b => b.Province === naicsProvince);
//       }
      
//       return {
//         naics_code: naicsCode,
//         total_matches: naicsResults.length,
//         returned: Math.min(naicsResults.length, naicsLimit),
//         businesses: naicsResults.slice(0, naicsLimit).map(b => ({
//           name: b.Name,
//           naics_code: b['NAICS Code'],
//           sector: b['Business Sector'],
//           municipality: b['Municipality Name'],
//           province: b.Province
//         }))
//       };
      
//     case 'get_statistics':
//       const provinces = {};
//       const sectors = {};
      
//       businesses.forEach(b => {
//         provinces[b.Province] = (provinces[b.Province] || 0) + 1;
//         sectors[b['Business Sector']] = (sectors[b['Business Sector']] || 0) + 1;
//       });
      
//       return {
//         total_businesses: businesses.length,
//         provinces_count: Object.keys(provinces).length,
//         top_provinces: Object.entries(provinces)
//           .sort((a: any, b: any) => b[1] - a[1])
//           .slice(0, 5)
//           .map(([province, count]) => ({ province, count })),
//         sectors_count: Object.keys(sectors).length,
//         top_sectors: Object.entries(sectors)
//           .sort((a: any, b: any) => b[1] - a[1])
//           .slice(0, 5)
//           .map(([sector, count]) => ({ sector, count }))
//       };
      
//     default:
//       throw new Error(`Unknown tool: ${name}`);
//   }
// }