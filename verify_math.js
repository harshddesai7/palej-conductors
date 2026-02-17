import {
    calculateStripInsulation,
    calculateWireInsulation,
    calculateFactor,
    calculateLMECopper,
    CONSTANTS
} from "./src/lib/calculators/engine.js";

// Mocking the behavior for a basic test
console.log("--- Palej Conductors Math Engine Verification ---");

// Test 1: Factor Calculation
const factorTest = calculateFactor({
    width: 10,
    thickness: 2,
    covering: 0.5,
    percentageIncrease: 5,
    density: 2.709
});
console.log(`Factor Test: Expected ~0.43344, Got: ${factorTest.toFixed(5)}`);

// Test 2: Strip Insulation
const stripResult = calculateStripInsulation({
    width: 10,
    thickness: 2,
    insulationThickness: 0.5,
    factor: 0.43344,
    density: 2.709,
    finalWtReqd: 100,
    qtyPerSpool: 25
});
console.log(`Strip Insulation % Increase: Expected ~5.00, Got: ${stripResult.percentIncrease.toFixed(2)}%`);

// Test 3: LME Copper
const lmeResult = calculateLMECopper({ lme: 9500, sbiRate: 83.5 });
console.log(`LME Copper CSP Rate: Got ₹${lmeResult.cspRate.toFixed(2)}`);

console.log("--- Verification Complete ---");
