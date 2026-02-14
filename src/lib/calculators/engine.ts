/**
 * Palej Conductors - Modular Math Engine
 * All calculations isolated for easy future updates.
 */

export const CONSTANTS = {
  DENSITY: {
    ALUMINIUM: 2.709,
    COPPER: 8.89,
  },
  LME: {
    PREMIUM: 190,
    MULTIPLIER_CSP: 1.055,
    MULTIPLIER_WWMAI: 1.106,
    HANDLING_CHARGES: 4250,
  },
  PRODUCTION: {
    DEFAULT_SPEED_M_HR: 256,
  }
};

export interface InsulationResults {
  bareArea: number;
  insulatedArea: number;
  bareWtReqd: number;
  percentIncrease: number;
  metersPerSpool: number;
  productionKgHr: number;
  totalHoursReqd: number;
  coveredWidthOrDia: number;
  coveredThickness?: number;
}

/**
 * STRIP Calculations (rectangular cross-section)
 */
export function calculateStripInsulation(params: {
  width: number;
  thickness: number;
  insulationThickness: number;
  factor: number;
  density: number;
  finalWtReqd: number;
  qtyPerSpool: number;
}): InsulationResults {
  const { width, thickness, insulationThickness, factor, density, finalWtReqd, qtyPerSpool } = params;

  const bareArea = width * thickness;
  const insulatedWidth = width + insulationThickness;
  const insulatedThickness = thickness + insulationThickness;
  const insulatedArea = insulatedWidth * insulatedThickness;

  const weightIncreaseFactor = (insulatedArea - bareArea) * factor * 100 / (bareArea * density);
  const bareWtReqd = (finalWtReqd / (100 + weightIncreaseFactor)) * 100;
  
  const metersPerSpool = (qtyPerSpool * 1000) / (bareArea * density);
  const productionKgHr = (bareArea * density * CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR) / 1000;
  const totalHoursReqd = bareWtReqd / productionKgHr;

  return {
    bareArea,
    insulatedArea,
    bareWtReqd,
    percentIncrease: weightIncreaseFactor,
    metersPerSpool,
    productionKgHr,
    totalHoursReqd,
    coveredWidthOrDia: insulatedWidth,
    coveredThickness: insulatedThickness,
  };
}

/**
 * WIRE Calculations (circular cross-section)
 */
export function calculateWireInsulation(params: {
  dia: number;
  insulationThickness: number;
  factor: number;
  density: number;
  finalWtReqd: number;
  qtyPerSpool: number;
}): InsulationResults {
  const { dia, insulationThickness, factor, density, finalWtReqd, qtyPerSpool } = params;

  const bareArea = 0.785 * dia * dia;
  const coveredDia = dia + insulationThickness;
  const insulatedArea = 0.785 * coveredDia * coveredDia;

  const weightIncreaseFactor = (insulatedArea - bareArea) * factor * 100 / (bareArea * density);
  const bareWtReqd = (finalWtReqd / (100 + weightIncreaseFactor)) * 100;

  const metersPerSpool = (qtyPerSpool * 1000) / (bareArea * density);
  const productionKgHr = (bareArea * density * CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR) / 1000;
  const totalHoursReqd = bareWtReqd / productionKgHr;

  return {
    bareArea,
    insulatedArea,
    bareWtReqd,
    percentIncrease: weightIncreaseFactor,
    metersPerSpool,
    productionKgHr,
    totalHoursReqd,
    coveredWidthOrDia: coveredDia,
  };
}

/**
 * Factor Calculator (reverse-engineered factor)
 */
export function calculateFactor(params: {
  width: number;
  thickness: number;
  covering: number;
  percentageIncrease: number;
  density: number;
}): number {
  const { width, thickness, covering, percentageIncrease, density } = params;
  const bareArea = width * thickness;
  const insulatedArea = (width + covering) * (thickness + covering);
  
  // Formula from .ds: (input.Width * input.Thickness * input.Aluminium_Density * input.Percentage_Increase) / (((input.Width + input.Covering_mm) * (input.Thickness + input.Covering_mm) - input.Width * input.Thickness) * 100)
  return (bareArea * density * percentageIncrease) / ((insulatedArea - bareArea) * 100);
}

/**
 * LME Copper pricing
 */
export function calculateLMECopper(params: {
  lme: number;
  sbiRate: number;
}) {
  const { lme, sbiRate } = params;
  const { PREMIUM, MULTIPLIER_CSP, MULTIPLIER_WWMAI, HANDLING_CHARGES } = CONSTANTS.LME;

  const lmePlusPremium = lme + PREMIUM;
  
  // Formulas from .ds:
  // CSP = ((input.LME + 190) * 1.055 * input.SBI_TT_sell_rate_10_20_lac + 4250) / 1000
  // WWMAI = ((input.LME + 190) * 1.106 * input.SBI_TT_sell_rate_10_20_lac + 4250) / 1000
  
  const cspRate = (lmePlusPremium * MULTIPLIER_CSP * sbiRate + HANDLING_CHARGES) / 1000;
  const wwmaiRate = (lmePlusPremium * MULTIPLIER_WWMAI * sbiRate + HANDLING_CHARGES) / 1000;

  return {
    lmePlusPremium,
    cspRate,
    wwmaiRate
  };
}
