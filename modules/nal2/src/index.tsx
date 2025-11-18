import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-nal2' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Nal2 = NativeModules.Nal2
  ? NativeModules.Nal2
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

interface Nal2Result {
  cfArray: number[];
  [key: string]: number[];
}

// ==================== NAL2 函数导出 ====================

export function dllVersion(): Promise<{ major: number; minor: number }> {
  return Nal2.dllVersion();
}

export function crossOverFrequencies(
  channels: number,
  ac: number[],
  bc: number[]
): Promise<number[]> {
  return Nal2.crossOverFrequencies(channels, Array.from(ac), Array.from(bc));
}

export function centerFrequencies(
  channels: number,
  cfArray: number[]
): Promise<number[]> {
  return Nal2.centerFrequencies(channels, Array.from(cfArray));
}

export function compressionThreshold(
  WBCT: number,
  aidType: number,
  direction: number,
  mic: number,
  calcCh: number[]
): Promise<number[]> {
  return Nal2.compressionThreshold(WBCT, aidType, direction, mic, Array.from(calcCh));
}

export function setBWC(
  channels: number,
  crossOver: number[],
  bandwidth: number,
  selection: number
): Promise<boolean> {
  return Nal2.setBWC(channels, Array.from(crossOver), bandwidth, selection);
}

export function setAdultChild(
  adultChild: number,
  dateOfBirth: number
): Promise<boolean> {
  return Nal2.setAdultChild(adultChild, dateOfBirth);
}

export function setExperience(experience: number): Promise<boolean> {
  return Nal2.setExperience(experience);
}

export function setCompSpeed(compSpeed: number): Promise<boolean> {
  return Nal2.setCompSpeed(compSpeed);
}

export function setTonalLanguage(tonal: number): Promise<boolean> {
  return Nal2.setTonalLanguage(tonal);
}

export function setGender(gender: number): Promise<boolean> {
  return Nal2.setGender(gender);
}

export function getRECDhIndiv(
  RECDmeasType: number,
  dateOfBirth: number,
  aidType: number,
  tubing: number,
  coupler: number,
  fittingDepth: number
): Promise<number[]> {
  return Nal2.getRECDhIndiv(RECDmeasType, dateOfBirth, aidType, tubing, coupler, fittingDepth);
}

export function getRECDhIndiv9(
  RECDmeasType: number,
  dateOfBirth: number,
  aidType: number,
  tubing: number,
  coupler: number,
  fittingDepth: number
): Promise<number[]> {
  return Nal2.getRECDhIndiv9(RECDmeasType, dateOfBirth, aidType, tubing, coupler, fittingDepth);
}

export function getRECDtIndiv(
  RECDmeasType: number,
  dateOfBirth: number,
  aidType: number,
  tubing: number,
  vent: number,
  earpiece: number,
  coupler: number,
  fittingDepth: number
): Promise<number[]> {
  return Nal2.getRECDtIndiv(RECDmeasType, dateOfBirth, aidType, tubing, vent, earpiece, coupler, fittingDepth);
}

export function getRECDtIndiv9(
  RECDmeasType: number,
  dateOfBirth: number,
  aidType: number,
  tubing: number,
  vent: number,
  earpiece: number,
  coupler: number,
  fittingDepth: number
): Promise<number[]> {
  return Nal2.getRECDtIndiv9(RECDmeasType, dateOfBirth, aidType, tubing, vent, earpiece, coupler, fittingDepth);
}

export function setRECDhIndiv(recdh: number[]): Promise<boolean> {
  return Nal2.setRECDhIndiv(Array.from(recdh));
}

export function setRECDhIndiv9(recdh: number[]): Promise<boolean> {
  return Nal2.setRECDhIndiv9(Array.from(recdh));
}

export function setRECDtIndiv(recdt: number[]): Promise<boolean> {
  return Nal2.setRECDtIndiv(Array.from(recdt));
}

export function setRECDtIndiv9(recdt: number[]): Promise<boolean> {
  return Nal2.setRECDtIndiv9(Array.from(recdt));
}

export function compressionRatio(
  cr: number[],
  channels: number,
  centerFreq: number,
  ac: number[],
  bc: number[],
  direction: number,
  mic: number,
  limiting: number,
  acOther: number[],
  noOfAids: number
): Promise<number[]> {
  return Nal2.compressionRatio(
    Array.from(cr),
    channels,
    centerFreq,
    Array.from(ac),
    Array.from(bc),
    direction,
    mic,
    limiting,
    Array.from(acOther),
    noOfAids
  );
}

export function getMPO(
  type: number,
  ac: number[],
  bc: number[],
  channels: number,
  limiting: number,
  acOther: number[],
  direction: number,
  mic: number,
  noOfAids: number
): Promise<number[]> {
  return Nal2.getMPO(
    type,
    Array.from(ac),
    Array.from(bc),
    channels,
    limiting,
    Array.from(acOther),
    direction,
    mic,
    noOfAids
  );
}

export function realEarAidedGain(
  ac: number[],
  bc: number[],
  L: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  acOther: number[],
  noOfAids: number
): Promise<number[]> {
  return Nal2.realEarAidedGain(
    Array.from(ac),
    Array.from(bc),
    L,
    limiting,
    channels,
    direction,
    mic,
    Array.from(acOther),
    noOfAids
  );
}

export function realEarInsertionGain(
  ac: number[],
  bc: number[],
  L: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  acOther: number[],
  noOfAids: number
): Promise<{ REIG: number[] }> {
  const convertedAc = Array.from(ac);
  const convertedBc = Array.from(bc);
  const convertedAcOther = Array.from(acOther);
  return Nal2.realEarInsertionGain(
    convertedAc,
    convertedBc,
    L,
    limiting,
    channels,
    direction,
    mic,
    convertedAcOther,
    noOfAids
  );
}

export function tccCouplerGain(
  ac: number[],
  bc: number[],
  L: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  target: number,
  aidType: number,
  acOther: number[],
  noOfAids: number,
  tubing: number,
  vent: number,
  RECDmeasType: number
): Promise<{ TccGain: number[]; lineType: number[] }> {
  return Nal2.tccCouplerGain(
    Array.from(ac),
    Array.from(bc),
    L,
    limiting,
    channels,
    direction,
    mic,
    target,
    aidType,
    Array.from(acOther),
    noOfAids,
    tubing,
    vent,
    RECDmeasType
  );
}

export function earSimulatorGain(
  ac: number[],
  bc: number[],
  L: number,
  direction: number,
  mic: number,
  limiting: number,
  channels: number,
  target: number,
  aidType: number,
  acOther: number[],
  noOfAids: number,
  tubing: number,
  vent: number,
  RECDmeasType: number
): Promise<{ ESG: number[]; lineType: number[] }> {
  return Nal2.earSimulatorGain(
    Array.from(ac),
    Array.from(bc),
    L,
    direction,
    mic,
    limiting,
    channels,
    target,
    aidType,
    Array.from(acOther),
    noOfAids,
    tubing,
    vent,
    RECDmeasType
  );
}

// 数据6-18的接口函数

export function getRealEarInputOutputCurve(
  ac: number[],
  bc: number[],
  graphFreq: number,
  startLevel: number,
  finishLevel: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  target: number,
  acOther: number[],
  noOfAids: number
): Promise<{ REIO: number[]; REIOunl: number[] }> {
  return Nal2.getRealEarInputOutputCurve(
    Array.from(ac),
    Array.from(bc),
    graphFreq,
    startLevel,
    finishLevel,
    limiting,
    channels,
    direction,
    mic,
    target,
    Array.from(acOther),
    noOfAids
  );
}

export function getTccInputOutputCurve(
  ac: number[],
  bc: number[],
  graphFreq: number,
  startLevel: number,
  finishLevel: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  target: number,
  aidType: number,
  acOther: number[],
  noOfAids: number,
  tubing: number,
  vent: number,
  RECDmeasType: number
): Promise<{ TccIO: number[]; TccIOunl: number[]; lineType: number[] }> {
  return Nal2.getTccInputOutputCurve(
    Array.from(ac),
    Array.from(bc),
    graphFreq,
    startLevel,
    finishLevel,
    limiting,
    channels,
    direction,
    mic,
    target,
    aidType,
    Array.from(acOther),
    noOfAids,
    tubing,
    vent,
    RECDmeasType
  );
}

export function getEarSimulatorInputOutputCurve(
  ac: number[],
  bc: number[],
  graphFreq: number,
  startLevel: number,
  finishLevel: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  target: number,
  aidType: number,
  acOther: number[],
  noOfAids: number,
  tubing: number,
  vent: number,
  RECDmeasType: number
): Promise<{ ESIO: number[]; ESIOunl: number[]; lineType: number[] }> {
  return Nal2.getEarSimulatorInputOutputCurve(
    Array.from(ac),
    Array.from(bc),
    graphFreq,
    startLevel,
    finishLevel,
    limiting,
    channels,
    direction,
    mic,
    target,
    aidType,
    Array.from(acOther),
    noOfAids,
    tubing,
    vent,
    RECDmeasType
  );
}

export function getSpeechOGram(
  ac: number[],
  bc: number[],
  L: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  acOther: number[],
  noOfAids: number
): Promise<{
  Speech_rms: number[];
  Speech_max: number[];
  Speech_min: number[];
  Speech_thresh: number[];
}> {
  return Nal2.getSpeechOGram(
    Array.from(ac),
    Array.from(bc),
    L,
    limiting,
    channels,
    direction,
    mic,
    Array.from(acOther),
    noOfAids
  );
}

export function getAidedThreshold(
  ac: number[],
  bc: number[],
  ct: number[],
  dbOption: number,
  acOther: number[],
  noOfAids: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number
): Promise<number[]> {
  return Nal2.getAidedThreshold(
    Array.from(ac),
    Array.from(bc),
    Array.from(ct),
    dbOption,
    Array.from(acOther),
    noOfAids,
    limiting,
    channels,
    direction,
    mic
  );
}

export function getREDDindiv(defValues: number): Promise<number[]> {
  return Nal2.getREDDindiv(defValues);
}

export function getREDDindiv9(defValues: number): Promise<number[]> {
  return Nal2.getREDDindiv9(defValues);
}

export function getREURindiv(
  defValues: number,
  dateOfBirth: number,
  direction: number,
  mic: number
): Promise<number[]> {
  return Nal2.getREURindiv(defValues, dateOfBirth, direction, mic);
}

export function getREURindiv9(
  defValues: number,
  dateOfBirth: number,
  direction: number,
  mic: number
): Promise<number[]> {
  return Nal2.getREURindiv9(defValues, dateOfBirth, direction, mic);
}

export function setREDDindiv(
  redd: number[],
  defValues: number
): Promise<boolean> {
  return Nal2.setREDDindiv(Array.from(redd), defValues);
}

export function setREDDindiv9(
  redd: number[],
  defValues: number
): Promise<boolean> {
  return Nal2.setREDDindiv9(Array.from(redd), defValues);
}

export function setREURindiv(
  reur: number[],
  defValues: number,
  dateOfBirth: number,
  direction: number,
  mic: number
): Promise<boolean> {
  return Nal2.setREURindiv(
    Array.from(reur),
    defValues,
    dateOfBirth,
    direction,
    mic
  );
}

export function setREURindiv9(
  reur: number[],
  defValues: number,
  dateOfBirth: number,
  direction: number,
  mic: number
): Promise<boolean> {
  return Nal2.setREURindiv9(
    Array.from(reur),
    defValues,
    dateOfBirth,
    direction,
    mic
  );
}

export function processData(params: {
  dateOfBirth: number;
  adultChild: number;
  experience: number;
  compSpeed: number;
  tonal: number;
  gender: number;
  channels: number;
  bandWidth: number;
  selection: number;
  WBCT: number;
  haType: number;
  direction: number;
  mic: number;
  noOfAids: number;
  ac: number[];
  bc: number[];
  calcCh: number[];
  levels: number[];
}): Promise<Nal2Result> {
  // console.log('params', 'processData');
  const convertedAc = Array.from(params.ac);
  const convertedBc = Array.from(params.bc);
  const convertedCalcCh = Array.from(params.calcCh);
  const convertedLevels = Array.from(params.levels);
  return Nal2.processData(
    params.dateOfBirth,
    params.adultChild,
    params.experience,
    params.compSpeed,
    params.tonal,
    params.gender,
    params.channels,
    params.bandWidth,
    params.selection,
    params.WBCT,
    params.haType,
    params.direction,
    params.mic,
    params.noOfAids,
    convertedAc,
    convertedBc,
    convertedCalcCh,
    convertedLevels
  );
}

// 数据25-33的新增接口函数

export function getGainAt(
  freqRequired: number,
  targetType: number,
  ac: number[],
  bc: number[],
  L: number,
  limiting: number,
  channels: number,
  direction: number,
  mic: number,
  acOther: number[],
  noOfAids: number,
  bandWidth: number,
  target: number,
  aidType: number,
  tubing: number,
  vent: number,
  RECDmeasType: number
): Promise<number> {
  return Nal2.getGainAt(
    freqRequired,
    targetType,
    Array.from(ac),
    Array.from(bc),
    L,
    limiting,
    channels,
    direction,
    mic,
    Array.from(acOther),
    noOfAids,
    bandWidth,
    target,
    aidType,
    tubing,
    vent,
    RECDmeasType
  );
}

export function getMLE(
  aidType: number,
  direction: number,
  mic: number
): Promise<number[]> {
  return Nal2.getMLE(aidType, direction, mic);
}

export function getReturnValues(): Promise<{
  MAF: number[];
  BWC: number[];
  ESCD: number[];
}> {
  return Nal2.getReturnValues();
}

export function getTubing(tubing: number): Promise<number[]> {
  return Nal2.getTubing(tubing);
}

export function getTubing9(tubing: number): Promise<number[]> {
  return Nal2.getTubing9(tubing);
}

export function getVentOut(vent: number): Promise<number[]> {
  return Nal2.getVentOut(vent);
}

export function getVentOut9(vent: number): Promise<number[]> {
  return Nal2.getVentOut9(vent);
}

export function getSI(
  s: number,
  REAG: number[],
  Limit: number[]
): Promise<number> {
  return Nal2.getSI(s, Array.from(REAG), Array.from(Limit));
}

export function getSII(
  nCompSpeed: number,
  Speech_thresh: number[],
  s: number,
  REAG: number[],
  REAGp: number[],
  REAGm: number[],
  REUR: number[]
): Promise<number> {
  return Nal2.getSII(
    nCompSpeed,
    Array.from(Speech_thresh),
    s,
    Array.from(REAG),
    Array.from(REAGp),
    Array.from(REAGm),
    Array.from(REUR)
  );
}
