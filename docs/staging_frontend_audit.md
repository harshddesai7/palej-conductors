# Staging Frontend Audit Report
**Date**: 2026-02-16  
**Environment**: https://palej-app-staging.vercel.app  
**Commit**: efc7b1a (UI Consolidation)  
**Status**: ⚠️ **MANUAL TESTING REQUIRED** - Browser automation tools limited

---

## Executive Summary

This audit verifies all frontend functionality after the UI consolidation changes:
- Factor Calculator output fix
- Unified Calculator Bare mode integration
- Sidebar module removal
- Redirect functionality

**Critical Test Areas**:
1. Factor Calculator: Output display with % Increase requirement
2. Unified Calculator: Insulated vs Bare mode switching
3. Unified Calculator: All insulation presets and kV selectors
4. Unified Calculator: Bare mode calculations
5. Navigation: Sidebar shows only 3 calculators
6. Redirect: /dashboard/bare → /calculator?mode=bare

---

## Test Results

### 1. Authentication & Navigation ✅

**Test**: Login and verify sidebar
- **Expected**: Login page → Dashboard → Sidebar shows 3 items only
- **Sidebar Items Expected**:
  - ✅ Unified Calculator
  - ✅ Factor Calculator  
  - ✅ LME Copper
  - ✅ Settings (footer)
- **Removed Items** (should NOT appear):
  - ❌ Bare Calculator
  - ❌ Fabrication List
  - ❌ Competitor Rates
  - ❌ Work Instructions
  - ❌ Die Calculator

**Result**: [MANUAL TEST REQUIRED]

---

### 2. Factor Calculator Tests

#### 2.1 Material Toggle
- **Test**: Click Aluminium → Copper → Aluminium
- **Expected**: Density updates (2.709 → 8.89 → 2.709)
- **Result**: [ ]

#### 2.2 Input Fields
- **Test**: Enter values in all 4 fields
  - Width: `12`
  - Thickness: `5`
  - Covering: `0.50`
  - % Increase: `10`
- **Expected**: All fields accept numeric input
- **Result**: [ ]

#### 2.3 Calculation Output (CRITICAL FIX)
- **Test Case A**: Enter Width=12, Thickness=5, Covering=0.50, % Increase=0
  - **Expected**: Output shows `"—"` (not `"0.000000"`)
  - **Result**: [ ]

- **Test Case B**: Enter Width=12, Thickness=5, Covering=0.50, % Increase=10
  - **Expected**: Output shows calculated factor (should be ~1.857... for Aluminium)
  - **Formula Check**: `(12*5*2.709*10) / ((12.5*5.5 - 60)*100) = 1625.4 / 875 = 1.857...`
  - **Result**: [ ]

- **Test Case C**: Enter Width=12, Thickness=5, Covering=0, % Increase=10
  - **Expected**: Output shows `"—"` (covering = 0)
  - **Result**: [ ]

- **Test Case D**: Enter Width=12, Thickness=5, Covering=0.50, % Increase=10, switch to Copper
  - **Expected**: Factor recalculates with density 8.89
  - **Formula Check**: `(12*5*8.89*10) / ((12.5*5.5 - 60)*100) = 5334 / 875 = 6.096...`
  - **Result**: [ ]

#### 2.4 Save Functionality
- **Test**: Click Save button with valid inputs
- **Expected**: Alert "Factor saved!" appears
- **Result**: [ ]

---

### 3. Unified Calculator - Insulated Mode Tests

#### 3.1 Mode Toggle
- **Test**: Verify default is "Insulated", click "Bare" → "Insulated"
- **Expected**: UI switches between modes correctly
- **Result**: [ ]

#### 3.2 Material & Shape Toggles
- **Test**: Toggle Aluminium ↔ Copper, Strip ↔ Wire
- **Expected**: State updates, calculations recompute
- **Result**: [ ]

#### 3.3 Insulation Preset Dropdown
- **Test**: Select each preset from dropdown
- **Expected Presets** (filtered by material):
  - Manual Entry
  - Dfg 225 yarn
  - Dfg 450 yarn
  - Dfg 900 yarn
  - Polyester
  - Poly + Dfg 225
  - Poly + Dfg 450
  - Poly + Dfg 900
  - Poly + Cotton
  - Cotton 32s (alu) [Aluminium only]
  - Cotton 42s (cu) [Copper only]
  - Enamel
  - Enamel + Dfg 900
  - Kapton + Dfg 900
  - 1 Poly + Paper (Alu) [Aluminium only]
  - Paper
  - Mica
  - Nomex
- **Result**: [ ]

#### 3.4 kV Selector (Poly+DFG presets)
- **Test**: Select "Poly + Dfg 225" → verify kV toggle appears
- **Expected**: Toggle shows "8 kV" and "18 kV" options
- **Test**: Click "8 kV" → "18 kV"
- **Expected**: Factor updates (Alu: 1.45 → 1.35, Cu: 1.45 stays)
- **Result**: [ ]

#### 3.5 Input Fields - Single Layer
- **Test**: Select "Polyester" preset, enter:
  - Width: `10`
  - Thickness: `2`
  - Insulation Thk: `0.50`
  - Factor: `1.40` (auto-filled)
  - Total Weight: `100`
  - Qty/Spool: `25`
- **Expected**: 
  - Factor auto-fills to 1.40 (Aluminium)
  - Insulation Thk auto-fills to 0.50
  - Results calculate correctly
- **Result**: [ ]

#### 3.6 Input Fields - Dual Layer
- **Test**: Select "Poly + Dfg 225", enter:
  - Width: `10`
  - Thickness: `2`
  - Polyester: `0.35` (auto-filled)
  - Fiberglass: `0.50` (auto-filled)
  - Factor: `1.45` (auto-filled for 8kV)
  - Total Weight: `100`
  - Qty/Spool: `25`
- **Expected**:
  - Layer labels show "Polyester" and "Fiberglass"
  - Total covering = 0.35 + 0.50 = 0.85
  - Results use combined factor formula
- **Result**: [ ]

#### 3.7 Results Display
- **Test**: Enter valid inputs, verify all result metrics:
  - Bare Area (mm²)
  - Insulated Area (mm²)
  - % Weight Increase
  - Bare Wt Reqd (kg)
  - Meters/Spool (m)
  - Production (kg/hr)
  - Total Production Time (hours)
- **Expected**: All values display correctly, no NaN or undefined
- **Result**: [ ]

#### 3.8 Reset Button
- **Test**: Enter values → Click Reset
- **Expected**: All inputs clear except defaults (factor=1, weight=100, qty=25)
- **Result**: [ ]

#### 3.9 Save Functionality
- **Test**: Enter valid inputs → Click Save
- **Expected**: Alert "Calculation saved successfully!"
- **Result**: [ ]

---

### 4. Unified Calculator - Bare Mode Tests

#### 4.1 Mode Toggle to Bare
- **Test**: Click "Bare" mode toggle
- **Expected**: 
  - Insulation Preset dropdown disappears
  - Input grid shows: Material, Shape, dimensions, Length only
  - Results show: Bare Area + Weight only
- **Result**: [ ]

#### 4.2 Bare Mode Inputs - Strip
- **Test**: Mode=Bare, Shape=Strip, enter:
  - Width: `10`
  - Thickness: `2`
  - Length: `1000`
- **Expected**: 
  - Bare Area = 10 × 2 = 20 mm²
  - Weight = (20 × 2.709 × 1000) / 1000 = 54.18 kg (Aluminium)
- **Result**: [ ]

#### 4.3 Bare Mode Inputs - Wire
- **Test**: Mode=Bare, Shape=Wire, enter:
  - Diameter: `4`
  - Length: `1000`
- **Expected**:
  - Bare Area = 0.785 × 4² = 12.56 mm²
  - Weight = (12.56 × 2.709 × 1000) / 1000 = 34.02 kg (Aluminium)
- **Result**: [ ]

#### 4.4 Bare Mode - Material Switch
- **Test**: Mode=Bare, enter dimensions → Switch Aluminium → Copper
- **Expected**: Weight recalculates with density 8.89
- **Result**: [ ]

#### 4.5 Bare Mode - Save
- **Test**: Enter valid Bare inputs → Click Save
- **Expected**: Alert "Calculation saved successfully!"
- **Result**: [ ]

#### 4.6 URL Parameter - ?mode=bare
- **Test**: Navigate to `/dashboard/calculator?mode=bare`
- **Expected**: Page loads with Bare mode selected
- **Result**: [ ]

---

### 5. Redirect Tests

#### 5.1 /dashboard/bare Redirect
- **Test**: Navigate to `/dashboard/bare`
- **Expected**: Redirects to `/dashboard/calculator?mode=bare`
- **Result**: [ ]

---

### 6. LME Copper Calculator Tests

#### 6.1 Input Fields
- **Test**: Enter LME and SBI Rate
- **Expected**: Calculations display correctly
- **Result**: [ ]

#### 6.2 Save Functionality
- **Test**: Click Save
- **Expected**: Alert appears
- **Result**: [ ]

---

### 7. Responsive Design Tests

#### 7.1 Mobile Viewport (375px)
- **Test**: Resize browser to 375px width
- **Expected**: 
  - Sidebar collapses/hides appropriately
  - Input fields stack correctly
  - Buttons remain accessible
- **Result**: [ ]

#### 7.2 Tablet Viewport (768px)
- **Test**: Resize browser to 768px width
- **Expected**: Layout adapts appropriately
- **Result**: [ ]

---

## Known Issues & Edge Cases

### Edge Cases to Test:
1. **Empty inputs**: All calculators should handle empty/zero inputs gracefully
2. **Negative values**: Should be prevented or handled
3. **Very large numbers**: Should not break UI
4. **Decimal precision**: Verify rounding/display
5. **Material-restricted presets**: Should auto-reset when material changes
6. **Browser back/forward**: State should persist correctly

---

## Verification Checklist

- [ ] Factor Calculator shows "—" when % Increase = 0
- [ ] Factor Calculator calculates correctly with all 4 inputs
- [ ] Unified Calculator mode toggle works
- [ ] Bare mode shows correct inputs/results
- [ ] All insulation presets load correctly
- [ ] kV selector appears for Poly+DFG presets
- [ ] Dual-layer inputs show correct layer labels
- [ ] Save buttons work for all calculators
- [ ] Sidebar shows only 3 calculators
- [ ] /dashboard/bare redirects correctly
- [ ] Mobile/tablet layouts work
- [ ] No console errors
- [ ] No visual glitches

---

## Next Steps

1. **Manual Testing**: Execute all test cases above in staging environment
2. **Document Results**: Fill in [ ] checkboxes with ✅ or ❌
3. **Fix Issues**: Address any failures found
4. **Re-test**: Verify fixes before production deployment

---

## Test Data Reference

### Factor Calculator Expected Values:
- **Input**: Width=12, Thickness=5, Covering=0.50, % Increase=10
- **Aluminium**: Factor ≈ 1.857
- **Copper**: Factor ≈ 6.096

### Unified Calculator Expected Values:
- **Strip**: Width=10, Thickness=2, Insulation=0.5, Factor=1.5, Weight=100, Qty=25
- **Bare Area**: 20 mm²
- **Insulated Area**: 26.25 mm²
- **% Increase**: ~17.3%
- **Bare Wt Reqd**: ~85.26 kg

### Bare Mode Expected Values:
- **Strip**: Width=10, Thickness=2, Length=1000
- **Bare Area**: 20 mm²
- **Weight (Alu)**: 54.18 kg
- **Weight (Cu)**: 177.8 kg

---

**Report Generated**: 2026-02-16  
**Next Review**: After manual testing completion
