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

    public double[] getRealEarAidedGain(double[] data, double[] acDouble, double[] bcDouble, int level, int limiting,
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

    public double[] getRealEarInsertionGain(double[] reig, double[] ac, double[] bc, int L, int limiting, int channels,
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
