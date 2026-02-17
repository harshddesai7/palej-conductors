/**
 * Verification script: runs engine calculations and checks math accuracy.
 * Run: npx tsx docs/verify_calculators.ts
 */
import {
  CONSTANTS,
  calculateStripInsulation,
  calculateWireInsulation,
  getInsulationFactor,
  getDefaultThickness,
  calculateFactor,
  calculateLMECopper,
} from "../src/lib/calculators/engine";

const D = CONSTANTS.DENSITY;
let passed = 0;
let failed = 0;

function assertEq(a: number, b: number, tol: number, msg: string) {
  const ok = Math.abs(a - b) < tol;
  if (ok) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.log(`  ✗ ${msg} (got ${a.toFixed(4)}, expected ~${b.toFixed(4)})`);
  }
}

function assertEqStr(a: string, b: string, msg: string) {
  const ok = a === b;
  if (ok) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.log(`  ✗ ${msg} (got "${a}", expected "${b}")`);
  }
}

console.log("\n=== Unified Calculator (Strip, Single-layer) ===\n");
const stripRes = calculateStripInsulation({
  width: 10,
  thickness: 2,
  insulationThickness: 0.5,
  factor: 1.5,
  density: D.ALUMINIUM,
  finalWtReqd: 100,
  qtyPerSpool: 25,
});
assertEq(stripRes.bareArea, 20, 0.001, "bareArea = 20");
assertEq(stripRes.insulatedArea, 26.25, 0.001, "insulatedArea = 26.25");
assertEq(stripRes.percentIncrease, 17.304, 0.1, "percentIncrease ~ 17.3");
assertEq(stripRes.bareWtReqd, 85.255, 0.1, "bareWtReqd ~ 85.26");
assertEq(stripRes.metersPerSpool, 461.4, 1, "metersPerSpool ~ 461");

console.log("\n=== Unified Calculator (Wire, Single-layer) ===\n");
const wireRes = calculateWireInsulation({
  dia: 4,
  insulationThickness: 0.5,
  factor: 1.5,
  density: D.ALUMINIUM,
  finalWtReqd: 100,
  qtyPerSpool: 25,
});
assertEq(wireRes.bareArea, 12.56, 0.01, "bareArea = 12.56");
assertEq(wireRes.percentIncrease, 14.71, 0.1, "percentIncrease ~ 14.7");
assertEq(wireRes.bareWtReqd, 87.18, 0.1, "bareWtReqd ~ 87.18");

console.log("\n=== Unified Calculator (Dual-layer, Combined Factor) ===\n");
const dualRes = calculateStripInsulation({
  width: 10,
  thickness: 2,
  insulationThickness: 0.35 + 0.5,
  factor: 1.45,
  density: D.ALUMINIUM,
  finalWtReqd: 100,
  qtyPerSpool: 25,
});
assertEq(dualRes.insulatedArea, (10 + 0.85) * (2 + 0.85), 0.01, "insulatedArea (summed covering)");
assertEq(dualRes.percentIncrease, 29.23, 0.1, "percentIncrease ~ 29.2");
assertEq(dualRes.bareWtReqd, 77.05, 0.5, "bareWtReqd ~ 77.05");

console.log("\n=== Factor Resolution (getInsulationFactor) ===\n");
const dfg = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Dfg 225 yarn")!;
const poly = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Polyester")!;
const polyDfg = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Poly + Dfg 225")!;
const polyPaper = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Poly + Paper")!;
const enamel = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Enamel")!;
const enamelDfg = CONSTANTS.INSULATION_TYPES.find((t) => t.name === "Enamel + Dfg 900")!;
assertEq(getInsulationFactor(dfg, "ALUMINIUM"), 1.45, 0.001, "DFG Alu factor = 1.45");
assertEq(getInsulationFactor(dfg, "COPPER"), 1.45, 0.001, "DFG Cu factor = 1.45");
assertEq(getInsulationFactor(poly, "ALUMINIUM"), 1.4, 0.001, "Polyester Alu factor = 1.40");
assertEq(getInsulationFactor(poly, "COPPER"), 1.3, 0.001, "Polyester Cu factor = 1.30");
assertEq(getInsulationFactor(polyDfg, "ALUMINIUM", "8 kV"), 1.45, 0.001, "Poly+DFG Alu 8kV = 1.45");
assertEq(getInsulationFactor(polyDfg, "ALUMINIUM", "18 kV"), 1.35, 0.001, "Poly+DFG Alu 18kV = 1.35");
assertEq(getInsulationFactor(polyDfg, "COPPER", "8 kV"), 1.45, 0.001, "Poly+DFG Cu 8kV = 1.45");
assertEq(getInsulationFactor(polyPaper, "ALUMINIUM"), 0.95, 0.001, "Poly+Paper Alu = 0.95");
assertEq(getInsulationFactor(polyPaper, "COPPER"), 0.95, 0.001, "Poly+Paper Cu = 0.95");

console.log("\n=== Default Thickness (getDefaultThickness) ===\n");
assertEq(getDefaultThickness(polyDfg, "STRIP"), 0.35 + 0.5, 0.001, "Poly+DFG strip default = 0.85");
assertEq(getDefaultThickness(poly, "STRIP"), 0.5, 0.001, "Polyester strip default = 0.50");
assertEq(getDefaultThickness(polyPaper, "STRIP"), 0.5, 0.001, "Poly+Paper strip default = 0.50");
assertEq(getDefaultThickness(polyPaper, "WIRE"), 0.4, 0.001, "Poly+Paper wire default = 0.40");
assertEq(getDefaultThickness(enamel, "STRIP"), 0.12, 0.001, "Enamel strip default = 0.12");
assertEq(enamelDfg.defaultLayer1Thickness ?? 0, 0.10, 0.001, "Enamel+DFG layer1 (enamel) default = 0.10");

console.log("\n=== Bare Calculator (strip area & weight) ===\n");
const bareArea = 10 * 2;
const bareWeight = (bareArea * D.ALUMINIUM * 1000) / 1000;
assertEq(bareArea, 20, 0.001, "bareArea = 20");
assertEq(bareWeight, 54.18, 0.1, "weight (1000m) = 54.18 kg");

console.log("\n=== Factor Calculator (reverse factor) ===\n");
const factorRes = calculateFactor({
  width: 10,
  thickness: 2,
  covering: 0.5,
  percentageIncrease: 10,
  density: D.ALUMINIUM,
});
const expectedFactor = (20 * 2.709 * 10) / ((26.25 - 20) * 100);
assertEq(factorRes, expectedFactor, 0.01, "factor reverse formula");

console.log("\n=== LME Copper ===\n");
const lmeRes = calculateLMECopper({ lme: 10000, sbiRate: 90 });
assertEq(lmeRes.lmePlusPremium, 10190, 0.1, "LME + Premium = 10190");
assertEq(lmeRes.cspRate, 970.8, 1, "CSP rate ~ 970.8");
assertEq(lmeRes.wwmaiRate, 1018.56, 0.5, "WWMAI rate ~ 1018.6");

console.log("\n=== Poly+Paper Material Availability ===\n");
const polyPaperRestriction = polyPaper?.materialRestriction;
assertEqStr(polyPaperRestriction ?? "", "", "Poly+Paper available for both materials (no restriction)");

console.log("\n=== Summary ===\n");
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
