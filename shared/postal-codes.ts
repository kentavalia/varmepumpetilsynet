// Norske postnummer og poststed
export interface PostalCode {
  postalCode: string;
  postPlace: string;
  municipality: string;
  county: string;
}

// Utvalg av norske postnummer - kan utvides med full liste
export const norwegianPostalCodes: PostalCode[] = [
  // Oslo
  { postalCode: "0001", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0010", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0015", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0020", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0030", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0040", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0050", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0080", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0101", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0102", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0103", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0104", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0105", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0106", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0107", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0110", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0111", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0112", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0113", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0114", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  { postalCode: "0115", postPlace: "Oslo", municipality: "Oslo", county: "Oslo" },
  
  // Bergen
  { postalCode: "5003", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5006", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5007", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5008", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5009", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5010", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5011", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5012", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5013", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5014", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5015", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5018", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5020", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5021", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5022", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  { postalCode: "5023", postPlace: "Bergen", municipality: "Bergen", county: "Vestland" },
  
  // Trondheim
  { postalCode: "7003", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7004", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7005", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7006", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7007", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7008", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7009", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7010", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7011", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7012", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7013", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7014", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7018", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7020", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7021", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  { postalCode: "7022", postPlace: "Trondheim", municipality: "Trondheim", county: "Trøndelag" },
  
  // Stavanger
  { postalCode: "4001", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4003", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4004", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4005", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4006", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4007", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4008", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4009", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4010", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4011", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4012", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4013", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4014", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4015", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4016", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  { postalCode: "4020", postPlace: "Stavanger", municipality: "Stavanger", county: "Rogaland" },
  
  // Kristiansand
  { postalCode: "4601", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4602", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4603", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4604", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4605", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4606", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4607", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4608", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4609", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4610", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4611", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4612", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4613", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4614", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4615", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  { postalCode: "4616", postPlace: "Kristiansand", municipality: "Kristiansand", county: "Agder" },
  
  // Tromsø
  { postalCode: "9003", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9004", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9005", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9006", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9007", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9008", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9009", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9010", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9011", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9012", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9013", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9014", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9015", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9016", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9017", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" },
  { postalCode: "9018", postPlace: "Tromsø", municipality: "Tromsø", county: "Troms og Finnmark" }
];

// Funksjon for å finne poststed basert på postnummer
export function getPostPlaceByPostalCode(postalCode: string): string | null {
  const postal = norwegianPostalCodes.find(p => p.postalCode === postalCode);
  return postal ? postal.postPlace : null;
}

// Funksjon for å søke etter postnummer
export function searchPostalCodes(query: string): PostalCode[] {
  const lowerQuery = query.toLowerCase();
  return norwegianPostalCodes.filter(p => 
    p.postalCode.includes(query) || 
    p.postPlace.toLowerCase().includes(lowerQuery) ||
    p.municipality.toLowerCase().includes(lowerQuery)
  );
}