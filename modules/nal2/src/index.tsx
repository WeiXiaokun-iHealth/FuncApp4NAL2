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
