import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Sun,
  Wind,
  Zap,
  Gauge,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  ExternalLink,
  Compass,
  Ruler,
  Maximize2,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Shield,
  Droplets,
  Layers,
  Sparkles,
  Camera
} from 'lucide-react';
import { MOZAMBIQUE_PROVINCES } from '../../types';

export const TecnicaTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<
    'wall_level' | 'tape_measure' | 'solar' | 'ac' | 'cable' | 'grounding' | 'water_pump'
  >('wall_level');

  // ==========================================
  // TOOL 1: WALL & SURFACE LEVEL (NÍVEL DE PAREDE E PRUMO)
  // ==========================================
  const [pitch, setPitch] = useState<number>(0); // Beta (-180 to 180, vertical tilt)
  const [roll, setRoll] = useState<number>(0); // Gamma (-90 to 90, horizontal tilt)
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const [calibratedOffsetPitch, setCalibratedOffsetPitch] = useState<number>(0);
  const [calibratedOffsetRoll, setCalibratedOffsetRoll] = useState<number>(0);
  const [isHold, setIsHold] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [hasDeviceMotion, setHasDeviceMotion] = useState<boolean>(false);

  // Manual simulator controls for desktop testing
  const [simulatedPitch, setSimulatedPitch] = useState<number>(0.2);
  const [simulatedRoll, setSimulatedRoll] = useState<number>(0.1);
  const [useSimulation, setUseSimulation] = useState<boolean>(true);

  // Device orientation listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setHasDeviceMotion(true);
        setUseSimulation(false);
        if (!isHold) {
          setPitch(Number((e.beta - calibratedOffsetPitch).toFixed(1)));
          setRoll(Number((e.gamma - calibratedOffsetRoll).toFixed(1)));
        }
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isHold, calibratedOffsetPitch, calibratedOffsetRoll]);

  // Update angles if simulation is active
  useEffect(() => {
    if (useSimulation && !isHold) {
      setPitch(Number((simulatedPitch - calibratedOffsetPitch).toFixed(1)));
      setRoll(Number((simulatedRoll - calibratedOffsetRoll).toFixed(1)));
    }
  }, [simulatedPitch, simulatedRoll, useSimulation, isHold, calibratedOffsetPitch, calibratedOffsetRoll]);

  // Calibration zeroing
  const handleCalibrateZero = () => {
    if (useSimulation) {
      setCalibratedOffsetPitch(simulatedPitch);
      setCalibratedOffsetRoll(simulatedRoll);
    } else {
      setCalibratedOffsetPitch(pitch + calibratedOffsetPitch);
      setCalibratedOffsetRoll(roll + calibratedOffsetRoll);
    }
    setIsCalibrated(true);
  };

  const handleResetCalibration = () => {
    setCalibratedOffsetPitch(0);
    setCalibratedOffsetRoll(0);
    setIsCalibrated(false);
  };

  // Level calculations
  const effectiveRoll = isHold ? roll : (useSimulation ? simulatedRoll - calibratedOffsetRoll : roll);
  const effectivePitch = isHold ? pitch : (useSimulation ? simulatedPitch - calibratedOffsetPitch : pitch);

  const isHorizontalLevel = Math.abs(effectiveRoll) <= 0.5;
  const isVerticalPlumb = Math.abs(effectivePitch) <= 0.5 || Math.abs(Math.abs(effectivePitch) - 90) <= 0.5;
  const isSurfaceBullseyeLevel = Math.abs(effectiveRoll) <= 0.5 && Math.abs(effectivePitch) <= 0.5;

  // Deviation in mm per meter: tan(angle in radians) * 1000
  const rollMmPerMeter = (Math.tan((effectiveRoll * Math.PI) / 180) * 1000).toFixed(1);
  const rollSlopePercent = (Math.tan((effectiveRoll * Math.PI) / 180) * 100).toFixed(1);

  // ==========================================
  // TOOL 2: TAPE MEASURE & SCREEN RULER (FITA MÉTRICA DIGITAL)
  // ==========================================
  const [rulerLengthCm, setRulerLengthCm] = useState<number>(30);
  const [pinAPosMm, setPinAPosMm] = useState<number>(0);
  const [pinBPosMm, setPinBPosMm] = useState<number>(185); // 18.5 cm
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [rulerScaleFactor, setRulerScaleFactor] = useState<number>(3.78); // px per mm for standard 96dpi

  // Area & Room measurement calculator
  const [roomLengthM, setRoomLengthM] = useState<number>(5.5);
  const [roomWidthM, setRoomWidthM] = useState<number>(4.2);
  const [roomHeightM, setRoomHeightM] = useState<number>(2.8);
  const [doorWindowAreaM2, setDoorWindowAreaM2] = useState<number>(3.5);

  const roomFloorArea = Number((roomLengthM * roomWidthM).toFixed(2));
  const roomPerimeter = Number((2 * (roomLengthM + roomWidthM)).toFixed(2));
  const roomWallArea = Number((roomPerimeter * roomHeightM - doorWindowAreaM2).toFixed(2));
  const roomVolumeM3 = Number((roomFloorArea * roomHeightM).toFixed(2));
  const roomDiagonalM = Number((Math.sqrt(roomLengthM * roomLengthM + roomWidthM * roomWidthM)).toFixed(2));

  // Estimation helpers
  const paintLitersNeeded = Number((roomWallArea / 10).toFixed(1)); // 10m²/L
  const conduitMetersNeeded = Number((roomPerimeter + roomHeightM * 4).toFixed(1));

  // Optical Triangulation AR measurement tool
  const [cameraHeightM, setCameraHeightM] = useState<number>(1.5); // phone eye height
  const [tiltAngleDeg, setTiltAngleDeg] = useState<number>(25); // angle looking down to ground base
  const estimatedDistanceM = Number((cameraHeightM / Math.tan((tiltAngleDeg * Math.PI) / 180)).toFixed(2));

  // ==========================================
  // TOOL 3: SOLAR PV SIZING (DIMENSIONAMENTO SOLAR)
  // ==========================================
  const [solarDailyKwh, setSolarDailyKwh] = useState<number>(14);
  const [solarProvince, setSolarProvince] = useState<string>('Maputo Província');
  const [solarSunHours, setSolarSunHours] = useState<number>(5.5);
  const [panelWattage, setPanelWattage] = useState<number>(550);
  const [batteryDaysAutonomy, setBatteryDaysAutonomy] = useState<number>(1.2);
  const [systemVoltage, setSystemVoltage] = useState<number>(48);

  const totalKwPNeeded = solarDailyKwh / (solarSunHours * 0.78);
  const panelsQuantity = Math.ceil((totalKwPNeeded * 1000) / panelWattage);
  const batteryKwhNeeded = Number((solarDailyKwh * 0.7 * batteryDaysAutonomy).toFixed(1));
  const batteryAh48V = Math.ceil((batteryKwhNeeded * 1000) / systemVoltage);
  const recommendedInverterKva = Math.max(3, Math.ceil((totalKwPNeeded * 1.25) / 1.5) * 1.5);

  // ==========================================
  // TOOL 4: CABLE DROP & SIZING (BITOLA E QUEDA DE TENSÃO EDM)
  // ==========================================
  const [cableVoltageType, setCableVoltageType] = useState<'220V_mono' | '380V_tri' | 'solar_dc'>('220V_mono');
  const [cableVoltage, setCableVoltage] = useState<number>(220);
  const [cableCurrentAmps, setCableCurrentAmps] = useState<number>(30);
  const [cableDistanceMeters, setCableDistanceMeters] = useState<number>(45);
  const [cableConductor, setCableConductor] = useState<'copper' | 'aluminum'>('copper');

  const rho = cableConductor === 'copper' ? 0.0178 : 0.0285;
  const factor = cableVoltageType === '380V_tri' ? Math.sqrt(3) : 2;
  const allowedDropPct = 3.0; // 3% max by EDM
  const allowedDropVolts = (cableVoltage * allowedDropPct) / 100;
  const calculatedSectionMm2 = (factor * rho * cableDistanceMeters * cableCurrentAmps) / allowedDropVolts;

  let recommendedCableSection = '4 mm²';
  if (calculatedSectionMm2 > 25) recommendedCableSection = '35 mm² ou superior';
  else if (calculatedSectionMm2 > 16) recommendedCableSection = '25 mm²';
  else if (calculatedSectionMm2 > 10) recommendedCableSection = '16 mm²';
  else if (calculatedSectionMm2 > 6) recommendedCableSection = '10 mm²';
  else if (calculatedSectionMm2 > 4) recommendedCableSection = '6 mm²';
  else if (calculatedSectionMm2 > 2.5) recommendedCableSection = '4 mm²';
  else recommendedCableSection = '2.5 mm²';

  const actualDropVolts = Number(((factor * rho * cableDistanceMeters * cableCurrentAmps) / (parseFloat(recommendedCableSection) || 4)).toFixed(2));
  const actualDropPct = Number(((actualDropVolts / cableVoltage) * 100).toFixed(2));
  const heatLossWatts = Number((actualDropVolts * cableCurrentAmps).toFixed(0));

  // ==========================================
  // TOOL 5: AC BTU SIZING (CARGA TÉRMICA CLIMATIZAÇÃO)
  // ==========================================
  const [acAreaM2, setAcAreaM2] = useState<number>(25);
  const [acPeopleCount, setAcPeopleCount] = useState<number>(3);
  const [acSunExposure, setAcSunExposure] = useState<'morning' | 'afternoon_coastal' | 'afternoon_inland'>('afternoon_coastal');
  const [acAppliancesWatts, setAcAppliancesWatts] = useState<number>(600);

  let btuPerM2 = 600;
  if (acSunExposure === 'afternoon_coastal') btuPerM2 = 800; // Maputo, Beira, Pemba
  if (acSunExposure === 'afternoon_inland') btuPerM2 = 900; // Tete, Chimoio, Nampula

  const btuBaseCalc = acAreaM2 * btuPerM2;
  const btuPeopleCalc = (acPeopleCount - 1 > 0 ? (acPeopleCount - 1) * 600 : 0);
  const btuAppliancesCalc = (acAppliancesWatts / 100) * 340;
  const totalBtuNeeded = Math.round(btuBaseCalc + btuPeopleCalc + btuAppliancesCalc);

  let standardBtuUnit = '9.000 BTU';
  if (totalBtuNeeded > 28000) standardBtuUnit = '36.000 BTU ou 2x 18.000 BTU';
  else if (totalBtuNeeded > 22000) standardBtuUnit = '24.000 BTU';
  else if (totalBtuNeeded > 16000) standardBtuUnit = '18.000 BTU';
  else if (totalBtuNeeded > 11000) standardBtuUnit = '12.000 BTU';

  // ==========================================
  // TOOL 6: GROUNDING RESISTANCE (ATERRAMENTO EDM)
  // ==========================================
  const [soilType, setSoilType] = useState<string>('argila');
  const [rodLengthM, setRodLengthM] = useState<number>(2.4);
  const [rodDiameterMm, setRodDiameterMm] = useState<number>(16);
  const [rodsCount, setRodsCount] = useState<number>(2);
  const [soilTreatment, setSoilTreatment] = useState<boolean>(false);

  // Resistivity in Ohm*m
  const SOIL_RESISTIVITIES: { [key: string]: { name: string; rho: number } } = {
    praia_arenosa: { name: 'Praia / Areia Litorânea (Maputo Costa / Vilankulo)', rho: 350 },
    terra_vermelha: { name: 'Terra Vermelha / Humífera (Matola / Gaza)', rho: 120 },
    argila: { name: 'Solo Argiloso / Várzea (Beira / Zambézia)', rho: 45 },
    rochoso: { name: 'Solo Rochoso / Calcário (Tete / Nampula)', rho: 800 }
  };

  const currentSoil = SOIL_RESISTIVITIES[soilType] || SOIL_RESISTIVITIES.terra_vermelha;
  const effectiveRho = soilTreatment ? currentSoil.rho * 0.5 : currentSoil.rho;

  // Rod formula: R = (rho / 2*pi*L) * (ln(4L / d))
  const rodDiameterM = rodDiameterMm / 1000;
  const singleRodResistance = (effectiveRho / (2 * Math.PI * rodLengthM)) * Math.log((4 * rodLengthM) / rodDiameterM);
  // Group efficiency factor for rods spaced 1x length apart
  const parallelFactor = rodsCount === 1 ? 1 : rodsCount === 2 ? 0.58 : rodsCount === 3 ? 0.42 : 0.32;
  const calculatedGroundResistance = Number((singleRodResistance * parallelFactor).toFixed(1));
  const isEdmCompliant = calculatedGroundResistance <= 10.0;

  // ==========================================
  // TOOL 7: SUBMERSIBLE WATER PUMP (BOMBA SUBMERSA & FURO)
  // ==========================================
  const [wellDynamicDepthM, setWellDynamicDepthM] = useState<number>(45);
  const [tankElevationM, setTankElevationM] = useState<number>(10);
  const [dailyWaterLiters, setDailyWaterLiters] = useState<number>(5000);
  const [pumpingHours, setPumpingHours] = useState<number>(5);

  const flowRateLitersPerHour = Math.round(dailyWaterLiters / pumpingHours);
  const flowRateM3PerHour = Number((flowRateLitersPerHour / 1000).toFixed(2));
  const totalHeadM = wellDynamicDepthM + tankElevationM + (wellDynamicDepthM * 0.1); // +10% pipe friction loss
  // Hydraulic power P = (Q in m³/s * rho * g * H) / pump_efficiency (0.55)
  const pumpPowerKw = Number(((flowRateM3PerHour / 3600) * 1000 * 9.81 * totalHeadM / (0.5 * 1000)).toFixed(2));
  const pumpPowerHp = Number((pumpPowerKw * 1.341).toFixed(2));
  const solarPanelsKwpForPump = Number((pumpPowerKw * 1.4).toFixed(2));

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-cyan-500/20 relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ferramentas Técnicas & Instrumentos de Medição • TécnicaMZ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
              Instrumentos & Calculadoras Técnicas
            </h1>
            <p className="text-xs sm:text-base text-slate-300">
              Nível digital de parede com giroscópio, fita métrica interativa, dimensionamento solar PV, queda de tensão EDM, aterramento e bombas d'água.
            </p>
          </div>
        </div>

        {/* Tool Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* 1. Nível de Parede */}
          <button
            onClick={() => setActiveTool('wall_level')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'wall_level'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md ring-2 ring-cyan-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'wall_level' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-700'
            }`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Nível de Parede</h3>
              <p className={`text-[10px] ${activeTool === 'wall_level' ? 'text-cyan-100' : 'text-slate-400'}`}>
                Prumo & Bolha
              </p>
            </div>
          </button>

          {/* 2. Fita Métrica */}
          <button
            onClick={() => setActiveTool('tape_measure')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'tape_measure'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'tape_measure' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Fita Métrica</h3>
              <p className={`text-[10px] ${activeTool === 'tape_measure' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Régua & Área m²
              </p>
            </div>
          </button>

          {/* 3. Solar PV */}
          <button
            onClick={() => setActiveTool('solar')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'solar'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'solar' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Solar Fotovoltaico</h3>
              <p className={`text-[10px] ${activeTool === 'solar' ? 'text-amber-100' : 'text-slate-400'}`}>
                Painéis & Bateria
              </p>
            </div>
          </button>

          {/* 4. Bitola & Queda */}
          <button
            onClick={() => setActiveTool('cable')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'cable'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'cable' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Bitola de Cabos</h3>
              <p className={`text-[10px] ${activeTool === 'cable' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Queda EDM 220V/DC
              </p>
            </div>
          </button>

          {/* 5. Aterramento EDM */}
          <button
            onClick={() => setActiveTool('grounding')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'grounding'
                ? 'bg-teal-600 text-white border-teal-500 shadow-md ring-2 ring-teal-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'grounding' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Aterramento EDM</h3>
              <p className={`text-[10px] ${activeTool === 'grounding' ? 'text-teal-100' : 'text-slate-400'}`}>
                Hastes & Solo &lt;10Ω
              </p>
            </div>
          </button>

          {/* 6. Ar Condicionado BTU */}
          <button
            onClick={() => setActiveTool('ac')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'ac'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'ac' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
            }`}>
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Climatização BTU</h3>
              <p className={`text-[10px] ${activeTool === 'ac' ? 'text-blue-100' : 'text-slate-400'}`}>
                Carga Térmica AC
              </p>
            </div>
          </button>

          {/* 7. Bomba de Água */}
          <button
            onClick={() => setActiveTool('water_pump')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
              activeTool === 'water_pump'
                ? 'bg-sky-600 text-white border-sky-500 shadow-md ring-2 ring-sky-400/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              activeTool === 'water_pump' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
            }`}>
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black">Bomba de Furo</h3>
              <p className={`text-[10px] ${activeTool === 'water_pump' ? 'text-sky-100' : 'text-slate-400'}`}>
                Pressão & Vazão
              </p>
            </div>
          </button>
        </div>

        {/* WORKSPACE AREA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          {/* ========================================================================= */}
          {/* TOOL 1: WALL & SURFACE LEVEL (NÍVEL DE PAREDE E PRUMO DIGITAL) */}
          {/* ========================================================================= */}
          {activeTool === 'wall_level' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[11px] font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Nível de Bolha & Prumo de Precisão com Sensor Inercial</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Nível de Parede, Estrutura & Prumo Digital
                  </h2>
                  <p className="text-xs text-slate-500">
                    Use o sensor do celular para nivelar quadros elétricos, calhas, painéis solares no telhado e alvenaria.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsHold(!isHold)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isHold ? 'bg-amber-500 text-white font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isHold ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{isHold ? 'Congelado' : 'Congelar'}</span>
                  </button>

                  <button
                    onClick={handleCalibrateZero}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    title="Definir ângulo atual como 0°"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Calibrar Zero (Tara)</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border text-center transition ${
                  isHorizontalLevel ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-semibold text-slate-500">Nível Horizontal (Roll)</p>
                  <p className="text-3xl font-black font-mono my-1">{effectiveRoll > 0 ? `+${effectiveRoll}°` : `${effectiveRoll}°`}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isHorizontalLevel ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isHorizontalLevel ? '✓ PERFEITAMENTE NIVELADO' : `Desvio: ${rollMmPerMeter} mm/m`}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border text-center transition ${
                  isVerticalPlumb ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-semibold text-slate-500">Prumo Vertical (Pitch)</p>
                  <p className="text-3xl font-black font-mono my-1">{effectivePitch > 0 ? `+${effectivePitch}°` : `${effectivePitch}°`}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isVerticalPlumb ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isVerticalPlumb ? '✓ PRUMO APROVADO' : 'Inclinado'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950 text-white text-center flex flex-col justify-center">
                  <p className="text-xs text-cyan-300 font-semibold">Inclinação da Rampa / Telhado</p>
                  <p className="text-3xl font-black font-mono text-cyan-100 my-1">{rollSlopePercent}%</p>
                  <p className="text-[10px] text-cyan-400">Ângulo ideal telhado solar MZ: 15° a 25° Norte</p>
                </div>
              </div>

              {/* VISUAL SPIRIT LEVEL GAUGES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                {/* 1. Horizontal Spirit Tube */}
                <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Tubo de Bolha Horizontal
                    </span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                      isHorizontalLevel ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                    }`}>
                      {effectiveRoll}°
                    </span>
                  </div>

                  {/* Horizontal Liquid Tube */}
                  <div className="relative h-16 bg-gradient-to-b from-cyan-950 via-cyan-900 to-slate-950 rounded-2xl border-2 border-cyan-500/40 p-2 overflow-hidden shadow-inner">
                    {/* Measurement lines */}
                    <div className="absolute inset-0 flex justify-between px-6 items-center pointer-events-none opacity-40">
                      <div className="h-6 w-0.5 bg-white"></div>
                      <div className="h-4 w-0.5 bg-white"></div>
                      <div className="h-10 w-0.5 bg-cyan-300"></div>
                      <div className="h-4 w-0.5 bg-white"></div>
                      <div className="h-6 w-0.5 bg-white"></div>
                    </div>

                    {/* Center tolerance target box */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-16 border-x-2 border-amber-400/80 bg-amber-400/10 pointer-events-none"></div>

                    {/* Fluid Bubble */}
                    <div
                      className={`absolute top-2.5 bottom-2.5 w-12 rounded-full transition-all duration-75 shadow-lg flex items-center justify-center ${
                        isHorizontalLevel
                          ? 'bg-gradient-to-r from-emerald-400 to-green-300 shadow-emerald-400/50'
                          : 'bg-gradient-to-r from-cyan-300 to-teal-200 shadow-cyan-400/40'
                      }`}
                      style={{
                        left: `calc(50% + ${Math.max(-45, Math.min(45, effectiveRoll * 3))}%)`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-white/70"></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Mantenha a bolha de ar entre as duas linhas amarelas centrais para obter o nível perfeito (0.0°).
                  </p>
                </div>

                {/* 2. 2D Circular Surface Bullseye Level */}
                <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-inner flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Nível Esférico Circular (Mesa / Topo)
                    </span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                      isSurfaceBullseyeLevel ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                    }`}>
                      X:{effectiveRoll}° Y:{effectivePitch}°
                    </span>
                  </div>

                  {/* Bullseye Circular Ring */}
                  <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-cyan-950 via-slate-900 to-slate-950 border-4 border-cyan-500/50 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                    {/* Concentric rings */}
                    <div className="w-32 h-32 rounded-full border border-cyan-500/30 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-cyan-400/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-amber-400/70 bg-amber-400/10"></div>
                      </div>
                    </div>

                    {/* Crosshair lines */}
                    <div className="absolute inset-x-0 h-0.5 bg-cyan-500/20"></div>
                    <div className="absolute inset-y-0 w-0.5 bg-cyan-500/20"></div>

                    {/* 2D Bubble */}
                    <div
                      className={`absolute w-8 h-8 rounded-full transition-all duration-75 shadow-lg flex items-center justify-center ${
                        isSurfaceBullseyeLevel
                          ? 'bg-gradient-to-r from-emerald-400 to-green-300 ring-2 ring-emerald-300 shadow-emerald-400/60'
                          : 'bg-gradient-to-r from-cyan-300 to-teal-200 shadow-cyan-400/40'
                      }`}
                      style={{
                        transform: `translate(${Math.max(-55, Math.min(55, effectiveRoll * 2.5))}px, ${Math.max(-55, Math.min(55, effectivePitch * 2.5))}px)`
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Coloque o telefone plano sobre a superfície horizontal. A bolha centraliza ao atingir nivelamento biaxial.
                  </p>
                </div>
              </div>

              {/* Simulation / Desktop Calibration sliders */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <h4 className="text-xs font-black text-slate-800">Controles de Calibração Manual</h4>
                  </div>
                  {isCalibrated && (
                    <button
                      onClick={handleResetCalibration}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remover Calibração Tara
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Simulador Ângulo Horizontal (Roll):</span>
                      <span className="font-mono">{simulatedRoll}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="0.1"
                      value={simulatedRoll}
                      onChange={e => setSimulatedRoll(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Simulador Ângulo Vertical (Pitch):</span>
                      <span className="font-mono">{simulatedPitch}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="0.1"
                      value={simulatedPitch}
                      onChange={e => setSimulatedPitch(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 2: TAPE MEASURE & ROOM AREA (FITA MÉTRICA DIGITAL & ÁREA) */}
          {/* ========================================================================= */}
          {activeTool === 'tape_measure' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Fita Métrica Digital, Régua Milimetrada & Calculador de Área m²</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Fita Métrica & Dimensionamento de Ambientes
                  </h2>
                  <p className="text-xs text-slate-500">
                    Meça peças na tela, calcule áreas de parede, chão, volume cúbico e estimativas de tubulação e cabos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUnitMode(unitMode === 'metric' ? 'imperial' : 'metric')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                  >
                    Unidade: {unitMode === 'metric' ? 'Métrico (cm/m)' : 'Polegadas (in/ft)'}
                  </button>
                </div>
              </div>

              {/* INTERACTIVE ON-SCREEN CALIPER / RULER */}
              <div className="space-y-4 bg-slate-900 p-6 rounded-3xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Régua Interativa na Tela (Arraste os Marcadores A e B)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-2">Distância Medida:</span>
                    <span className="text-xl font-black font-mono text-amber-300">
                      {unitMode === 'metric'
                        ? `${Math.abs(pinBPosMm - pinAPosMm)} mm (${(Math.abs(pinBPosMm - pinAPosMm) / 10).toFixed(1)} cm)`
                        : `${(Math.abs(pinBPosMm - pinAPosMm) / 25.4).toFixed(2)} polegadas`}
                    </span>
                  </div>
                </div>

                {/* Ruler Visual Scale */}
                <div className="relative h-20 bg-amber-100 rounded-2xl border-2 border-amber-300 p-2 overflow-x-auto select-none shadow-inner">
                  {/* Graduations */}
                  <div className="flex justify-between items-end h-full px-2 text-[9px] font-mono font-bold text-slate-900">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="mb-1 text-[8px]">{i} cm</span>
                        <div className={`w-0.5 bg-slate-900 ${i % 5 === 0 ? 'h-6 bg-red-600' : 'h-3'}`}></div>
                      </div>
                    ))}
                  </div>

                  {/* Pin A */}
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-indigo-600 shadow-md cursor-ew-resize flex items-center justify-center text-[9px] font-black text-white rounded-xs"
                    style={{ left: `${Math.min(95, Math.max(2, (pinAPosMm / 200) * 100))}%` }}
                    title="Pino A"
                  >
                    A
                  </div>

                  {/* Pin B */}
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-red-600 shadow-md cursor-ew-resize flex items-center justify-center text-[9px] font-black text-white rounded-xs"
                    style={{ left: `${Math.min(95, Math.max(2, (pinBPosMm / 200) * 100))}%` }}
                    title="Pino B"
                  >
                    B
                  </div>
                </div>

                {/* Draggable Slider Pins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Posição Marcador A: <span className="font-mono text-indigo-300">{pinAPosMm} mm</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={pinAPosMm}
                      onChange={e => setPinAPosMm(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Posição Marcador B: <span className="font-mono text-red-300">{pinBPosMm} mm</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={pinBPosMm}
                      onChange={e => setPinBPosMm(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* ROOM MEASUREMENT & AREA CALCULATOR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-indigo-600" />
                    <span>Calculador de Ambiente, Área & Perímetro</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomLengthM}
                        onChange={e => setRoomLengthM(Math.max(0.1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomWidthM}
                        onChange={e => setRoomWidthM(Math.max(0.1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pé-Direito (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={roomHeightM}
                        onChange={e => setRoomHeightM(Math.max(0.1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Desconto de Portas e Janelas (m²)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={doorWindowAreaM2}
                      onChange={e => setDoorWindowAreaM2(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <span className="text-[11px] text-slate-400">Porta padrão ~1.6m² | Janela média ~1.5m²</span>
                  </div>

                  {/* Optical AR Height Triangulation */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Estimativa de Distância Óptica / AR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block">Altura dos Olhos (m)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={cameraHeightM}
                          onChange={e => setCameraHeightM(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block">Ângulo Inclinado (°)</label>
                        <input
                          type="number"
                          value={tiltAngleDeg}
                          onChange={e => setTiltAngleDeg(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-xs font-black text-indigo-950 pt-1">
                      Distância Estimada até a Parede: <span className="font-mono text-indigo-600">{estimatedDistanceM} metros</span>
                    </p>
                  </div>
                </div>

                {/* Outputs */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      Resultados de Geometria do Ambiente
                    </span>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold">Área do Piso / Teto</p>
                        <p className="text-2xl font-black text-white font-mono">{roomFloorArea} m²</p>
                      </div>

                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold">Perímetro Total</p>
                        <p className="text-2xl font-black text-white font-mono">{roomPerimeter} m</p>
                      </div>

                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold">Área Líquida de Paredes</p>
                        <p className="text-2xl font-black text-amber-300 font-mono">{roomWallArea} m²</p>
                      </div>

                      <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-semibold">Volume Cúbico</p>
                        <p className="text-2xl font-black text-white font-mono">{roomVolumeM3} m³</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5 text-xs">
                      <p className="text-slate-300 font-bold">📋 Estimativa de Materiais Técnicos:</p>
                      <p className="text-slate-400">• Tubulação / Calhas de Eletricidade: <span className="text-white font-bold">{conduitMetersNeeded} metros</span></p>
                      <p className="text-slate-400">• Tinta Acrílica (2 demãos): <span className="text-white font-bold">{paintLitersNeeded} Litros</span></p>
                      <p className="text-slate-400">• Diagonal Máxima para Prumo: <span className="text-white font-bold">{roomDiagonalM} m</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 3: SOLAR PV SIZING */}
          {/* ========================================================================= */}
          {activeTool === 'solar' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dimensionamento Solar Fotovoltaico Conforme Radiação de Moçambique</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Parâmetros do Sistema Solar</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Consumo Médio Diário da Residência / Negócio (kWh/dia)
                  </label>
                  <input
                    type="number"
                    value={solarDailyKwh}
                    onChange={e => setSolarDailyKwh(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
                  />
                  <span className="text-[11px] text-slate-400">Ex: Residência média consome entre 8 a 18 kWh/dia</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Província em Moçambique</label>
                    <select
                      value={solarProvince}
                      onChange={e => setSolarProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {MOZAMBIQUE_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horas de Sol Pico (HSP)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={solarSunHours}
                      onChange={e => setSolarSunHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Potência do Painel Solar</label>
                    <select
                      value={panelWattage}
                      onChange={e => setPanelWattage(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value={450}>450W Mono Half-Cell</option>
                      <option value={550}>550W Tier-1 Mono Perc</option>
                      <option value={600}>600W Bi-facial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tensão do Banco de Baterias</label>
                    <select
                      value={systemVoltage}
                      onChange={e => setSystemVoltage(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value={24}>24V (Sistemas menores)</option>
                      <option value={48}>48V (Padrão Inversores 5kW/8kW)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-full">
                    Resultado Recomendado
                  </span>

                  <div>
                    <p className="text-xs text-amber-900">Potência Total Fotovoltaica Pico:</p>
                    <p className="text-3xl font-black text-amber-950 font-mono">{totalKwPNeeded.toFixed(2)} kWp</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-white rounded-2xl border border-amber-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Painéis de {panelWattage}W</p>
                      <p className="text-xl font-black text-slate-900 font-mono">{panelsQuantity} unidades</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-2xl border border-amber-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Banco LiFePO4 48V</p>
                      <p className="text-xl font-black text-slate-900 font-mono">{batteryKwhNeeded} kWh ({batteryAh48V}Ah)</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-100/70 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-1">
                    <p className="font-bold">⚡ Inversor Recomendado: <span className="font-mono">{recommendedInverterKva} kVA Híbrido</span></p>
                    <p className="text-[11px] text-amber-900">Suporta gerador a diesel como backup e entrada de rede EDM.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 4: CABLE DROP & SIZING (AC & SOLAR DC) */}
          {/* ========================================================================= */}
          {activeTool === 'cable' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Normas EDM de Instalação Elétrica (Queda Máxima 3%)</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Cálculo de Queda de Tensão & Bitola de Cabos</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Circuito</label>
                    <select
                      value={cableVoltageType}
                      onChange={e => {
                        const val = e.target.value as any;
                        setCableVoltageType(val);
                        if (val === '220V_mono') setCableVoltage(220);
                        if (val === '380V_tri') setCableVoltage(380);
                        if (val === 'solar_dc') setCableVoltage(48);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="220V_mono">220V Monofásico (EDM Residencial)</option>
                      <option value="380V_tri">380V Trifásico (Industrial)</option>
                      <option value="solar_dc">Corrente Contínua Solar (DC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Material do Condutor</label>
                    <select
                      value={cableConductor}
                      onChange={e => setCableConductor(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="copper">Cobre Eletrolítico (Cu)</option>
                      <option value="aluminum">Alumínio (Al)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tensão (V)</label>
                    <input
                      type="number"
                      value={cableVoltage}
                      onChange={e => setCableVoltage(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Corrente (Amperes)</label>
                    <input
                      type="number"
                      value={cableCurrentAmps}
                      onChange={e => setCableCurrentAmps(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Distância (Metros)</label>
                    <input
                      type="number"
                      value={cableDistanceMeters}
                      onChange={e => setCableDistanceMeters(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2.5 py-1 rounded-full">
                    Bitola Recomendada (Seção Mínima)
                  </span>

                  <div>
                    <p className="text-xs text-emerald-900">Seção Padrão Comercial:</p>
                    <p className="text-3xl font-black text-emerald-950 font-mono">{recommendedCableSection}</p>
                    <p className="text-[11px] text-emerald-800">Cálculo teórico exato: {calculatedSectionMm2.toFixed(2)} mm²</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-white rounded-2xl border border-emerald-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Queda de Tensão</p>
                      <p className="text-lg font-black text-slate-900 font-mono">{actualDropVolts} V ({actualDropPct}%)</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-2xl border border-emerald-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Perda Térmica (Joule)</p>
                      <p className="text-lg font-black text-slate-900 font-mono">{heatLossWatts} Watts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 5: GROUNDING RESISTANCE (ATERRAMENTO EDM) */}
          {/* ========================================================================= */}
          {activeTool === 'grounding' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold">
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>Cálculo de Eletrodo de Terra Conforme Normas de Segurança EDM Moçambique</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Resistência de Aterramento & Hastes</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Solo em Moçambique</label>
                  <select
                    value={soilType}
                    onChange={e => setSoilType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {Object.keys(SOIL_RESISTIVITIES).map(key => (
                      <option key={key} value={key}>{SOIL_RESISTIVITIES[key].name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Comprimento Haste (m)</label>
                    <select
                      value={rodLengthM}
                      onChange={e => setRodLengthM(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value={2.4}>2.4 metros (Padrão)</option>
                      <option value={3.0}>3.0 metros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diâmetro da Haste</label>
                    <select
                      value={rodDiameterMm}
                      onChange={e => setRodDiameterMm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value={14}>14 mm (5/8")</option>
                      <option value={16}>16 mm (3/4")</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Qtd. de Hastes</label>
                    <select
                      value={rodsCount}
                      onChange={e => setRodsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value={1}>1 Haste Simples</option>
                      <option value={2}>2 Hastes Paralelas</option>
                      <option value={3}>3 Hastes em Triângulo</option>
                      <option value={4}>4 Hastes em Quadrado</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="soilTreat"
                    checked={soilTreatment}
                    onChange={e => setSoilTreatment(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-xs"
                  />
                  <label htmlFor="soilTreat" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Adicionar Tratamento Químico / Carvão Vegetal & Sal (Reduz resistividade em 50%)
                  </label>
                </div>
              </div>

              {/* Output */}
              <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-900 bg-teal-200/70 px-2.5 py-1 rounded-full">
                    Resistência Ôhmica Estimada
                  </span>

                  <div>
                    <p className="text-xs text-teal-900">Resistência de Terra (R):</p>
                    <p className="text-3xl font-black text-teal-950 font-mono">{calculatedGroundResistance} Ohms (Ω)</p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    isEdmCompliant
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-red-100 border-red-300 text-red-900'
                  }`}>
                    {isEdmCompliant ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span>{isEdmCompliant ? 'CONFORME NORMA EDM (< 10 Ω)' : 'NÃO CONFORME (> 10 Ω) — Adicione mais hastes ou tratamento'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 6: AC BTU (CARGA TÉRMICA) */}
          {/* ========================================================================= */}
          {activeTool === 'ac' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold">
                    <Wind className="w-3.5 h-3.5 text-blue-600" />
                    <span>Carga Térmica para Clima Quente & Úmido de Moçambique</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Cálculo de Capacidade de Ar Condicionado (BTU/h)</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Área do Quarto / Escritório (m²)</label>
                  <input
                    type="number"
                    value={acAreaM2}
                    onChange={e => setAcAreaM2(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ocupantes no Ambiente</label>
                    <input
                      type="number"
                      value={acPeopleCount}
                      onChange={e => setAcPeopleCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exposição Solar</label>
                    <select
                      value={acSunExposure}
                      onChange={e => setAcSunExposure(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="morning">Sol da Manhã / Suave</option>
                      <option value="afternoon_coastal">Sol da Tarde Litoral (Maputo/Beira)</option>
                      <option value="afternoon_inland">Sol Forte Interior (Tete/Nampula)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/70 px-2.5 py-1 rounded-full">
                    Aparelho Recomendado
                  </span>

                  <div>
                    <p className="text-xs text-blue-900">Capacidade Comercial:</p>
                    <p className="text-3xl font-black text-blue-950 font-mono">{standardBtuUnit}</p>
                    <p className="text-[11px] text-blue-800">Cálculo exato: {totalBtuNeeded.toLocaleString()} BTU/h</p>
                  </div>

                  <div className="p-3.5 bg-blue-100/70 rounded-2xl border border-blue-300 text-xs text-blue-950 space-y-1">
                    <p className="font-bold">❄️ Dica Técnica: Prefira compressores com tecnologia Inverter R32 para economizar até 60% na fatura da EDM.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TOOL 7: SUBMERSIBLE WATER PUMP */}
          {/* ========================================================================= */}
          {activeTool === 'water_pump' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[11px] font-bold">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Dimensionamento de Bomba Submersa para Furos de Água em Moçambique</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Bomba Submersa & Altura Manométrica (HMT)</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nível Dinâmico do Furo (m)</label>
                    <input
                      type="number"
                      value={wellDynamicDepthM}
                      onChange={e => setWellDynamicDepthM(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Altura do Tanque / Caixa (m)</label>
                    <input
                      type="number"
                      value={tankElevationM}
                      onChange={e => setTankElevationM(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Consumo Diário (Litros/dia)</label>
                    <input
                      type="number"
                      value={dailyWaterLiters}
                      onChange={e => setDailyWaterLiters(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horas de Bombeamento</label>
                    <input
                      type="number"
                      value={pumpingHours}
                      onChange={e => setPumpingHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="p-6 rounded-3xl bg-sky-50/70 border border-sky-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-200/70 px-2.5 py-1 rounded-full">
                    Bomba & Potência Recomendada
                  </span>

                  <div>
                    <p className="text-xs text-sky-900">Potência do Motor da Bomba:</p>
                    <p className="text-3xl font-black text-sky-950 font-mono">{pumpPowerHp} HP ({pumpPowerKw} kW)</p>
                    <p className="text-[11px] text-sky-800">Altura Manométrica Total (HMT): {totalHeadM.toFixed(1)} metros</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-white rounded-2xl border border-sky-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Vazão Média</p>
                      <p className="text-base font-black text-slate-900 font-mono">{flowRateLitersPerHour} L/h ({flowRateM3PerHour} m³/h)</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-2xl border border-sky-200">
                      <p className="text-[11px] text-slate-500 font-semibold">Painéis Solares para Bomba</p>
                      <p className="text-base font-black text-slate-900 font-mono">{solarPanelsKwpForPump} kWp Solar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
