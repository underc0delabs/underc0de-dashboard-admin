export type LocationOption = {
  label: string;
  value: string;
};

export const COUNTRY_OPTIONS: LocationOption[] = [
  { label: "Argentina", value: "AR" },
  { label: "Uruguay", value: "UY" },
  { label: "Chile", value: "CL" },
  { label: "Paraguay", value: "PY" },
  { label: "Bolivia", value: "BO" },
  { label: "Brasil", value: "BR" },
  { label: "Perú", value: "PE" },
  { label: "Colombia", value: "CO" },
  { label: "México", value: "MX" },
  { label: "España", value: "ES" },
  { label: "Estados Unidos", value: "US" },
  { label: "Otro", value: "OTHER" },
];

export const PROVINCE_OPTIONS_BY_COUNTRY: Record<string, LocationOption[]> = {
  AR: [
    { label: "Buenos Aires", value: "Buenos Aires" },
    { label: "Ciudad Autónoma de Buenos Aires", value: "CABA" },
    { label: "Catamarca", value: "Catamarca" },
    { label: "Chaco", value: "Chaco" },
    { label: "Chubut", value: "Chubut" },
    { label: "Córdoba", value: "Córdoba" },
    { label: "Corrientes", value: "Corrientes" },
    { label: "Entre Ríos", value: "Entre Ríos" },
    { label: "Formosa", value: "Formosa" },
    { label: "Jujuy", value: "Jujuy" },
    { label: "La Pampa", value: "La Pampa" },
    { label: "La Rioja", value: "La Rioja" },
    { label: "Mendoza", value: "Mendoza" },
    { label: "Misiones", value: "Misiones" },
    { label: "Neuquén", value: "Neuquén" },
    { label: "Río Negro", value: "Río Negro" },
    { label: "Salta", value: "Salta" },
    { label: "San Juan", value: "San Juan" },
    { label: "San Luis", value: "San Luis" },
    { label: "Santa Cruz", value: "Santa Cruz" },
    { label: "Santa Fe", value: "Santa Fe" },
    { label: "Santiago del Estero", value: "Santiago del Estero" },
    { label: "Tierra del Fuego", value: "Tierra del Fuego" },
    { label: "Tucumán", value: "Tucumán" },
  ],
  UY: [
    { label: "Montevideo", value: "Montevideo" },
    { label: "Canelones", value: "Canelones" },
    { label: "Maldonado", value: "Maldonado" },
    { label: "Salto", value: "Salto" },
    { label: "Otra", value: "Otra" },
  ],
  CL: [
    { label: "Región Metropolitana", value: "Región Metropolitana" },
    { label: "Valparaíso", value: "Valparaíso" },
    { label: "Biobío", value: "Biobío" },
    { label: "Otra", value: "Otra" },
  ],
};

export const getProvinceOptionsForCountry = (
  country?: string | null,
): LocationOption[] => {
  const code = (country ?? "").trim();
  if (!code) {
    return [];
  }
  const specific = PROVINCE_OPTIONS_BY_COUNTRY[code];
  if (specific?.length) {
    return specific;
  }
  return [{ label: "Otra", value: "Otra" }];
};

export const getCountryLabel = (value?: string | null): string => {
  const match = COUNTRY_OPTIONS.find(
    (option) => option.value === (value ?? "").trim(),
  );
  return match?.label ?? value ?? "";
};

export const getProvinceLabel = (
  country?: string | null,
  province?: string | null,
): string => {
  const options = getProvinceOptionsForCountry(country);
  const match = options.find(
    (option) => option.value === (province ?? "").trim(),
  );
  return match?.label ?? province ?? "";
};
