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
  },
  INSULATION_TYPES: [
    { name: "Dfg 225 yarn", factorAlu: 1.50, factorCu: 1.70, defaultThickness: 0.50 },
    { name: "Dfg 450 yarn", factorAlu: 1.50, factorCu: 1.70, defaultThickness: 0.50 },
    { name: "Dfg 900 yarn", factorAlu: 1.50, factorCu: 1.70, defaultThickness: 0.50 },
    { name: "Polyester", factorAlu: 1.40, factorCu: 1.30, defaultThicknessStrip: 0.50, defaultThicknessWire: 0.40 },
    {
      name: "Poly + Dfg 225",
      isDualLayer: true,
      layer1Name: "Polyester",
      layer2Name: "Fiberglass",
      defaultLayer1Thickness: 0.35,
      defaultLayer2Thickness: 0.50,
      kVOptions: [
        { label: "8 kV", factorAlu: 1.45, factorCu: 1.45 },
        { label: "18 kV", factorAlu: 1.35, factorCu: 1.45 },
      ],
      defaultKV: "8 kV",
    },
    {
      name: "Poly + Dfg 450",
      isDualLayer: true,
      layer1Name: "Polyester",
      layer2Name: "Fiberglass",
      defaultLayer1Thickness: 0.35,
      defaultLayer2Thickness: 0.50,
      kVOptions: [
        { label: "8 kV", factorAlu: 1.45, factorCu: 1.45 },
        { label: "18 kV", factorAlu: 1.35, factorCu: 1.45 },
      ],
      defaultKV: "8 kV",
    },
    {
      name: "Poly + Dfg 900",
      isDualLayer: true,
      layer1Name: "Polyester",
      layer2Name: "Fiberglass",
      defaultLayer1Thickness: 0.35,
      defaultLayer2Thickness: 0.50,
      kVOptions: [
        { label: "8 kV", factorAlu: 1.45, factorCu: 1.45 },
        { label: "18 kV", factorAlu: 1.35, factorCu: 1.45 },
      ],
      defaultKV: "8 kV",
    },
    { name: "Poly + Cotton", isDualLayer: true, factor: 1.30, layer1Name: "Polyester", layer2Name: "Cotton", defaultLayer1Thickness: 0.35, defaultLayer2Thickness: 0.50 },
    { name: "Cotton 32s ( alu )", factor: 0.70, defaultThicknessStrip: 0.60, defaultThicknessWire: 0.50 },
    { name: "Cotton 42s ( cu )", factor: 0.70, defaultThickness: 0.50 },
    { name: "Enamel", factor: 1.0, defaultThickness: 0.03 },
    { name: "Enamel + Dfg 900", isDualLayer: true, factor: 0.85, layer1Name: "Enamel", layer2Name: "Fiberglass", defaultLayer1Thickness: 0.03, defaultLayer2Thickness: 0.50 },
    { name: "Kapton + Dfg 900", isDualLayer: true, factor: 1.0, layer1Name: "Kapton", layer2Name: "Fiberglass", defaultLayer1Thickness: 0.05, defaultLayer2Thickness: 0.50 },
    { name: "1 Poly + Paper (Alu)", factorAlu: 0.95, materialRestriction: "ALUMINIUM", defaultThicknessStrip: 0.50, defaultThicknessWire: 0.40 },
    { name: "Paper", factor: 1.0, defaultThickness: 0.50 },
    { name: "Mica", factor: 1.0, defaultThickness: 0.50 },
    { name: "Nomex", factor: 1.0, defaultThickness: 0.50 },
  ] as InsulationType[]
};

export interface InsulationType {
  name: string;
  factor?: number;
  factorAlu?: number;
  factorCu?: number;
  defaultThickness?: number;
  defaultThicknessStrip?: number;
  defaultThicknessWire?: number;
  isDualLayer?: boolean;
  layer1Factor?: number;
  layer2Factor?: number;
  defaultLayer1Thickness?: number;
  defaultLayer2Thickness?: number;
  /** kV-specific factors for Poly+DFG types (e.g. 8kV/18kV) */
  kVOptions?: { label: string; factorAlu?: number; factorCu?: number; factor?: number }[];
  defaultKV?: string;
  /** Display names for dual-layer inputs */
  layer1Name?: string;
  layer2Name?: string;
  /** Restrict preset to specific material only */
  materialRestriction?: "ALUMINIUM" | "COPPER";
}

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
  dualLayer?: {
    polyPercent: number;
    dfgPercent: number;
    weightAfterPoly: number;
  };
}

export function getInsulationFactor(
  type: InsulationType,
  material: "ALUMINIUM" | "COPPER",
  kV?: string
): number {
  if (kV && type.kVOptions?.length) {
    const opt = type.kVOptions.find((o) => o.label === kV);
    if (opt) {
      if (material === "ALUMINIUM" && opt.factorAlu !== undefined) return opt.factorAlu;
      if (material === "COPPER" && opt.factorCu !== undefined) return opt.factorCu;
      if (opt.factor !== undefined) return opt.factor;
    }
  }
  if (type.factorAlu !== undefined && material === "ALUMINIUM") return type.factorAlu;
  if (type.factorCu !== undefined && material === "COPPER") return type.factorCu;
  return type.factor ?? 1.0;
}

export function getDefaultThickness(type: InsulationType, shape: "STRIP" | "WIRE"): number {
  if (type.defaultLayer1Thickness !== undefined && type.defaultLayer2Thickness !== undefined) {
    return type.defaultLayer1Thickness + type.defaultLayer2Thickness;
  }
  if (type.defaultThicknessStrip !== undefined && shape === "STRIP") return type.defaultThicknessStrip;
  if (type.defaultThicknessWire !== undefined && shape === "WIRE") return type.defaultThicknessWire;
  return type.defaultThickness ?? 0.0;
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
 * STRIP Dual-Layer (Poly + DFG)
 */
export function calculateDualLayerStripInsulation(params: {
  width: number;
  thickness: number;
  polyCov: number;
  dfgCov: number;
  polyFactor: number;
  dfgFactor: number;
  density: number;
  finalWtReqd: number;
  qtyPerSpool: number;
}): InsulationResults {
  const { width, thickness, polyCov, dfgCov, polyFactor, dfgFactor, density, finalWtReqd, qtyPerSpool } = params;

  const bareArea = width * thickness;
  const polyArea = (width + polyCov) * (thickness + polyCov);
  const dfgArea = (width + polyCov + dfgCov) * (thickness + polyCov + dfgCov);

  const polyPercent = (polyArea - bareArea) * polyFactor * 100 / (bareArea * density);
  const dfgPercent = (dfgArea - polyArea) * dfgFactor * 100 / (polyArea * density);

  const weightAfterPoly = (finalWtReqd / (100 + dfgPercent)) * 100;
  const bareWtReqd = (weightAfterPoly / (100 + polyPercent)) * 100;

  const metersPerSpool = (qtyPerSpool * 1000) / (bareArea * density);
  const productionKgHr = (bareArea * density * CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR) / 1000;
  const totalHoursReqd = bareWtReqd / productionKgHr;

  return {
    bareArea,
    insulatedArea: dfgArea,
    bareWtReqd,
    percentIncrease: ((finalWtReqd - bareWtReqd) / bareWtReqd) * 100,
    metersPerSpool,
    productionKgHr,
    totalHoursReqd,
    coveredWidthOrDia: width + polyCov + dfgCov,
    coveredThickness: thickness + polyCov + dfgCov,
    dualLayer: {
      polyPercent,
      dfgPercent,
      weightAfterPoly
    }
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
 * WIRE Dual-Layer (Poly + DFG)
 */
export function calculateDualLayerWireInsulation(params: {
  dia: number;
  polyCov: number;
  dfgCov: number;
  polyFactor: number;
  dfgFactor: number;
  density: number;
  finalWtReqd: number;
  qtyPerSpool: number;
}): InsulationResults {
  const { dia, polyCov, dfgCov, polyFactor, dfgFactor, density, finalWtReqd, qtyPerSpool } = params;

  const bareArea = 0.785 * dia * dia;
  const polyArea = 0.785 * (dia + polyCov) * (dia + polyCov);
  const dfgArea = 0.785 * (dia + polyCov + dfgCov) * (dia + polyCov + dfgCov);

  const polyPercent = (polyArea - bareArea) * polyFactor * 100 / (bareArea * density);
  const dfgPercent = (dfgArea - polyArea) * dfgFactor * 100 / (polyArea * density);

  const weightAfterPoly = (finalWtReqd / (100 + dfgPercent)) * 100;
  const bareWtReqd = (weightAfterPoly / (100 + polyPercent)) * 100;

  const metersPerSpool = (qtyPerSpool * 1000) / (bareArea * density);
  const productionKgHr = (bareArea * density * CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR) / 1000;
  const totalHoursReqd = bareWtReqd / productionKgHr;

  return {
    bareArea,
    insulatedArea: dfgArea,
    bareWtReqd,
    percentIncrease: ((finalWtReqd - bareWtReqd) / bareWtReqd) * 100,
    metersPerSpool,
    productionKgHr,
    totalHoursReqd,
    coveredWidthOrDia: dia + polyCov + dfgCov,
    dualLayer: {
      polyPercent,
      dfgPercent,
      weightAfterPoly
    }
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
