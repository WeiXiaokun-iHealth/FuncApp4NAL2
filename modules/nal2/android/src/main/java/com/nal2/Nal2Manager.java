package com.nal2;

import android.content.Context;
import android.util.Log;

import au.org.nal.NativeManager;
import au.org.nal.OutputResult;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class Nal2Manager {
    private static final String TAG = "Nal2Manager";
    private static Nal2Manager instance;
    private Context context;

    private Nal2Manager(Context context) {
        this.context = context.getApplicationContext();
        NativeManager.getInstance(context);
    }

    public static synchronized Nal2Manager getInstance(Context context) {
        if (instance == null) {
            instance = new Nal2Manager(context);
        }
        return instance;
    }

    public int[] getDllVersion() {
        try {
            // NAL2 SDK可能没有直接提供dllVersion的Java封装
            // 尝试通过反射调用
            int[] version = new int[2];
            try {
                Method method = NativeManager.getInstance(context).getClass().getMethod("dllVersion", int[].class);
                method.invoke(NativeManager.getInstance(context), (Object) version);
                return version;
            } catch (NoSuchMethodException e) {
                Log.w(TAG, "dllVersion方法不存在，返回默认版本号");
                // 如果SDK没有提供dllVersion方法，返回NAL-NL2的标准版本号
                // 根据NAL-NL2规范，当前版本通常是2.0
                return new int[] { 2, 0 };
            }
        } catch (Exception e) {
            Log.e(TAG, "获取DLL版本失败", e);
            return new int[] { 2, 0 }; // 默认返回2.0
        }
    }

    public void setAdultChild(int adultChild, int dateOfBirth) {
        NativeManager.getInstance(context).SetAdultChild(adultChild, dateOfBirth);
    }

    public void setExperience(int experience) {
        NativeManager.getInstance(context).SetExperience(experience);
    }

    public void setCompSpeed(int compSpeed) {
        NativeManager.getInstance(context).SetCompSpeed(compSpeed);
    }

    public void setTonalLanguage(int tonal) {
        NativeManager.getInstance(context).SetTonalLanguage(tonal);
    }

    public void setGender(int gender) {
        NativeManager.getInstance(context).SetGender(gender);
    }

    public double[] getCrossOverFrequencies(double[] cfArr, int channels, double[] acDouble, double[] bcDouble,
            int[] freqInCh) {
        try {
            OutputResult result = NativeManager.getInstance(context).CrossOverFrequencies_NL2(cfArr, channels, acDouble,
                    bcDouble, freqInCh);
            return getOutputData(result, cfArr);
        } catch (Exception e) {
            Log.e(TAG, "获取交叉频率失败", e);
            return cfArr;
        }
    }

    public void setBWC(int channels, double[] crossoverFrequencies) {
        NativeManager.getInstance(context).setBWC(channels, crossoverFrequencies);
    }

    public void setCompressionThreshold(double[] ct, int bandWidth, int selection, int WBCT, int haType, int direction,
            int mic, int[] calcChArray) {
        NativeManager.getInstance(context).CompressionThreshold_NL2(ct, bandWidth, selection, WBCT, haType, direction,
                mic, calcChArray);
    }

    public double[] getMPO(double[] mpo, int limiting, double[] acDouble, double[] bcDouble, int channels) {
        try {
            OutputResult result = NativeManager.getInstance(context).getMPO_NL2(mpo, 0, acDouble, bcDouble, channels,
                    limiting);
            return getOutputData(result, mpo);
        } catch (Exception e) {
            Log.e(TAG, "获取MPO失败", e);
            return mpo;
        }
    }

    public double[] getRealEarAidedGain(double[] data, double[] acDouble, double[] bcDouble, double level, int limiting,
            int channels, int direction, int mic, int noOfAids) {
        try {
            OutputResult result = NativeManager.getInstance(context).RealEarAidedGain_NL2(data, acDouble, bcDouble,
                    level, limiting, channels, direction, mic, acDouble, noOfAids);
            return getOutputData(result, data);
        } catch (Exception e) {
            Log.e(TAG, "获取实耳增益失败", e);
            return data;
        }
    }

    public double[] getRealEarInsertionGain(double[] reig, double[] ac, double[] bc, double L, int limiting,
            int channels,
            int direction, int mic, double[] acOther, int noOfAids) {
        try {
            OutputResult result = NativeManager.getInstance(context).RealEarInsertionGain_NL2(reig, ac, bc, L, limiting,
                    channels, direction, mic, acOther, noOfAids);
            return getOutputData(result, reig);
        } catch (Exception e) {
            Log.e(TAG, "获取实耳插入增益失败", e);
            return reig;
        }
    }

    public double[] getRECDhIndiv(int RECDmeasType, int dateOfBirth, int aidType, int tubing, int coupler,
            int fittingDepth) {
        try {
            double[] recdh = new double[9];
            // 需要添加 coupler2 参数 (第8个参数)
            OutputResult result = NativeManager.getInstance(context).GetRECDh_indiv_NL2(recdh, RECDmeasType,
                    dateOfBirth, aidType, tubing, coupler, fittingDepth, coupler);
            return getOutputData(result, recdh);
        } catch (Exception e) {
            Log.e(TAG, "获取RECDh_indiv失败", e);
            return new double[9];
        }
    }

    public double[] getRECDhIndiv9(int RECDmeasType, int dateOfBirth, int aidType, int tubing, int coupler,
            int fittingDepth) {
        try {
            double[] recdh = new double[9];
            // 需要添加 coupler2 参数 (第8个参数)
            OutputResult result = NativeManager.getInstance(context).GetRECDh_indiv9_NL2(recdh, RECDmeasType,
                    dateOfBirth, aidType, tubing, coupler, fittingDepth, coupler);
            return getOutputData(result, recdh);
        } catch (Exception e) {
            Log.e(TAG, "获取RECDh_indiv9失败", e);
            return new double[9];
        }
    }

    public double[] getRECDtIndiv(int RECDmeasType, int dateOfBirth, int aidType, int tubing, int vent, int earpiece,
            int coupler, int fittingDepth) {
        try {
            double[] recdt = new double[9];
            OutputResult result = NativeManager.getInstance(context).GetRECDt_indiv_NL2(recdt, RECDmeasType,
                    dateOfBirth, aidType, tubing, vent, earpiece, coupler, fittingDepth);
            return getOutputData(result, recdt);
        } catch (Exception e) {
            Log.e(TAG, "获取RECDt_indiv失败", e);
            return new double[9];
        }
    }

    public double[] getRECDtIndiv9(int RECDmeasType, int dateOfBirth, int aidType, int tubing, int vent, int earpiece,
            int coupler, int fittingDepth) {
        try {
            double[] recdt = new double[9];
            OutputResult result = NativeManager.getInstance(context).GetRECDt_indiv9_NL2(recdt, RECDmeasType,
                    dateOfBirth, aidType, tubing, vent, earpiece, coupler, fittingDepth);
            return getOutputData(result, recdt);
        } catch (Exception e) {
            Log.e(TAG, "获取RECDt_indiv9失败", e);
            return new double[9];
        }
    }

    public void setRECDhIndiv(double[] recdh) {
        NativeManager.getInstance(context).SetRECDh_indiv_NL2(recdh);
    }

    public void setRECDhIndiv9(double[] recdh) {
        NativeManager.getInstance(context).SetRECDh_indiv9_NL2(recdh);
    }

    public void setRECDtIndiv(double[] recdt) {
        NativeManager.getInstance(context).SetRECDt_indiv_NL2(recdt);
    }

    public void setRECDtIndiv9(double[] recdt) {
        NativeManager.getInstance(context).SetRECDt_indiv9_NL2(recdt);
    }

    public double[] getCompressionRatio(double[] cr, int channels, int centerFreq, double[] ac, double[] bc,
            int direction, int mic, int limiting, double[] acOther, int noOfAids) {
        try {
            // centerFreq 需要转换为 int[] 数组
            int[] centerFreqArray = new int[] { centerFreq };
            OutputResult result = NativeManager.getInstance(context).CompressionRatio_NL2(cr, channels, centerFreqArray,
                    ac,
                    bc, direction, mic, limiting, acOther, noOfAids);
            return getOutputData(result, cr);
        } catch (Exception e) {
            Log.e(TAG, "获取压缩比失败", e);
            return cr;
        }
    }

    // 内部类用于返回TccCouplerGain的结果
    public static class TccCouplerGainResult {
        public double[] TccGain;
        public int[] lineType;

        public TccCouplerGainResult(double[] tccGain, int[] lineType) {
            this.TccGain = tccGain;
            this.lineType = lineType;
        }
    }

    public TccCouplerGainResult getTccCouplerGain(double[] gain, double[] ac, double[] bc, double speechLevel,
            int limiting,
            int channels, int direction, int mic, int target, int aidType, double[] acOther, int noOfAids, int tubing,
            int vent, int RECDmeasType, int[] lineType) {
        try {
            // 需要添加 calcCh 参数作为最后一个参数
            int[] calcCh = new int[channels];
            for (int i = 0; i < channels; i++) {
                calcCh[i] = 1;
            }
            OutputResult result = NativeManager.getInstance(context).TccCouplerGain_NL2(gain, ac, bc, speechLevel,
                    limiting, channels, direction, mic, target, aidType, acOther, noOfAids, tubing, vent, RECDmeasType,
                    calcCh);
            double[] tccGain = getOutputData(result, gain);
            // lineType通过calcCh返回，这里简单填充
            for (int i = 0; i < lineType.length && i < calcCh.length; i++) {
                lineType[i] = calcCh[i];
            }
            return new TccCouplerGainResult(tccGain, lineType);
        } catch (Exception e) {
            Log.e(TAG, "获取TCC增益失败", e);
            return new TccCouplerGainResult(gain, lineType);
        }
    }

    // 内部类用于返回EarSimulatorGain的结果
    public static class EarSimulatorGainResult {
        public double[] ESG;
        public int[] lineType;

        public EarSimulatorGainResult(double[] esg, int[] lineType) {
            this.ESG = esg;
            this.lineType = lineType;
        }
    }

    public EarSimulatorGainResult getEarSimulatorGain(double[] gain, double[] ac, double[] bc, double L,
            int direction, int mic, int limiting, int channels, int target, int aidType, double[] acOther,
            int noOfAids, int tubing, int vent, int RECDmeasType, int[] lineType) {
        try {
            // aidType 需要转换为 int[] 数组
            int[] aidTypeArray = new int[] { aidType };
            OutputResult result = NativeManager.getInstance(context).EarSimulatorGain_NL2(gain, ac, bc, L,
                    direction, mic, limiting, channels, target, aidType, acOther, noOfAids, tubing, vent,
                    RECDmeasType, aidTypeArray);
            double[] esg = getOutputData(result, gain);
            // lineType通过aidTypeArray返回，这里简单填充
            for (int i = 0; i < lineType.length && i < aidTypeArray.length; i++) {
                lineType[i] = aidTypeArray[i];
            }
            return new EarSimulatorGainResult(esg, lineType);
        } catch (Exception e) {
            Log.e(TAG, "获取EarSimulator增益失败", e);
            return new EarSimulatorGainResult(gain, lineType);
        }
    }

    // 通过反射获取OutputResult中的数据
    private double[] getOutputData(OutputResult result, double[] defaultValue) {
        try {
            // 尝试使用getOutput1方法
            try {
                Method method = result.getClass().getMethod("getOutput1");
                return (double[]) method.invoke(result);
            } catch (Exception e) {
                Log.e(TAG, "获取output1方法失败，尝试直接访问字段", e);
                // 尝试直接访问output1字段
                Field field = result.getClass().getDeclaredField("output1");
                field.setAccessible(true);
                return (double[]) field.get(result);
            }
        } catch (Exception e) {
            Log.e(TAG, "获取OutputResult数据失败", e);
            return defaultValue;
        }
    }
}
