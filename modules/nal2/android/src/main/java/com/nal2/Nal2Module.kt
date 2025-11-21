package com.nal2

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import org.json.JSONArray
import org.json.JSONObject

class Nal2Module(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val nal2Manager = Nal2Manager.getInstance(reactContext)

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "Nal2"
  }

  @ReactMethod
  fun dllVersion(promise: Promise) {
    try {
      val version = nal2Manager.getDllVersion()
      val versionMap = Arguments.createMap()
      versionMap.putInt("major", version[0])
      versionMap.putInt("minor", version[1])

      Log.d("Nal2Module", "DLL版本: major=${version[0]}, minor=${version[1]}")
      promise.resolve(versionMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用dllVersion失败", e)
      promise.reject("NAL2_ERROR", "调用dllVersion失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun realEarInsertionGain(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {

    try {
      // 准备输出数组 - REIG固定为19个元素（third-octaves）
      val reig = DoubleArray(19)

      // 转换输入数组
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      Log.d(
              "Nal2Module",
              "调用RealEarInsertionGain_NL2: AC=${acDouble.joinToString()}, L=$L, channels=$channels"
      )

      // 调用NAL2 Manager
      val result =
              nal2Manager.getRealEarInsertionGain(
                      reig,
                      acDouble,
                      bcDouble,
                      L,
                      limiting,
                      channels,
                      direction,
                      mic,
                      acOtherDouble,
                      noOfAids
              )

      // 构建返回结果
      val writableMap = Arguments.createMap()
      val reigArray = Arguments.createArray()
      result.forEach { reigArray.pushDouble(it) }
      writableMap.putArray("REIG", reigArray)

      Log.d("Nal2Module", "RealEarInsertionGain_NL2成功: REIG=${result.joinToString()}")
      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用RealEarInsertionGain_NL2失败", e)
      promise.reject("NAL2_ERROR", "调用RealEarInsertionGain_NL2失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun crossOverFrequencies(channels: Int, ac: ReadableArray, bc: ReadableArray, promise: Promise) {
    try {
      val cfArr = DoubleArray(19)
      val freqInCh = IntArray(19)
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }

      val result =
              nal2Manager.getCrossOverFrequencies(cfArr, channels, acDouble, bcDouble, freqInCh)

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用CrossOverFrequencies失败", e)
      promise.reject("NAL2_ERROR", "调用CrossOverFrequencies失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun compressionThreshold(
          WBCT: Int,
          aidType: Int,
          direction: Int,
          mic: Int,
          calcCh: ReadableArray,
          promise: Promise
  ) {
    try {
      val ct = DoubleArray(19)
      val calcChArray = IntArray(calcCh.size()) { calcCh.getInt(it) }

      nal2Manager.setCompressionThreshold(ct, 0, 1, WBCT, aidType, direction, mic, calcChArray)

      val resultArray = Arguments.createArray()
      ct.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用CompressionThreshold失败", e)
      promise.reject("NAL2_ERROR", "调用CompressionThreshold失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setBWC(
          channels: Int,
          crossOver: ReadableArray,
          bandwidth: Int,
          selection: Int,
          promise: Promise
  ) {
    try {
      val crossOverDouble = DoubleArray(crossOver.size()) { crossOver.getDouble(it) }
      nal2Manager.setBWC(channels, crossOverDouble)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setBWC失败", e)
      promise.reject("NAL2_ERROR", "调用setBWC失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setAdultChild(adultChild: Int, dateOfBirth: Int, promise: Promise) {
    try {
      nal2Manager.setAdultChild(adultChild, dateOfBirth)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setAdultChild失败", e)
      promise.reject("NAL2_ERROR", "调用setAdultChild失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setExperience(experience: Int, promise: Promise) {
    try {
      nal2Manager.setExperience(experience)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setExperience失败", e)
      promise.reject("NAL2_ERROR", "调用setExperience失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setCompSpeed(compSpeed: Int, promise: Promise) {
    try {
      nal2Manager.setCompSpeed(compSpeed)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setCompSpeed失败", e)
      promise.reject("NAL2_ERROR", "调用setCompSpeed失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setTonalLanguage(tonal: Int, promise: Promise) {
    try {
      nal2Manager.setTonalLanguage(tonal)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setTonalLanguage失败", e)
      promise.reject("NAL2_ERROR", "调用setTonalLanguage失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setGender(gender: Int, promise: Promise) {
    try {
      nal2Manager.setGender(gender)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setGender失败", e)
      promise.reject("NAL2_ERROR", "调用setGender失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getRECDhIndiv(
          RECDmeasType: Int,
          dateOfBirth: Int,
          aidType: Int,
          tubing: Int,
          coupler: Int,
          fittingDepth: Int,
          promise: Promise
  ) {
    try {
      val result =
              nal2Manager.getRECDhIndiv(
                      RECDmeasType,
                      dateOfBirth,
                      aidType,
                      tubing,
                      coupler,
                      fittingDepth
              )
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getRECDhIndiv失败", e)
      promise.reject("NAL2_ERROR", "调用getRECDhIndiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getRECDhIndiv9(
          RECDmeasType: Int,
          dateOfBirth: Int,
          aidType: Int,
          tubing: Int,
          coupler: Int,
          fittingDepth: Int,
          promise: Promise
  ) {
    try {
      val result =
              nal2Manager.getRECDhIndiv9(
                      RECDmeasType,
                      dateOfBirth,
                      aidType,
                      tubing,
                      coupler,
                      fittingDepth
              )
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getRECDhIndiv9失败", e)
      promise.reject("NAL2_ERROR", "调用getRECDhIndiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getRECDtIndiv(
          RECDmeasType: Int,
          dateOfBirth: Int,
          aidType: Int,
          tubing: Int,
          vent: Int,
          earpiece: Int,
          coupler: Int,
          fittingDepth: Int,
          promise: Promise
  ) {
    try {
      val result =
              nal2Manager.getRECDtIndiv(
                      RECDmeasType,
                      dateOfBirth,
                      aidType,
                      tubing,
                      vent,
                      earpiece,
                      coupler,
                      fittingDepth
              )
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getRECDtIndiv失败", e)
      promise.reject("NAL2_ERROR", "调用getRECDtIndiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getRECDtIndiv9(
          RECDmeasType: Int,
          dateOfBirth: Int,
          aidType: Int,
          tubing: Int,
          vent: Int,
          earpiece: Int,
          coupler: Int,
          fittingDepth: Int,
          promise: Promise
  ) {
    try {
      val result =
              nal2Manager.getRECDtIndiv9(
                      RECDmeasType,
                      dateOfBirth,
                      aidType,
                      tubing,
                      vent,
                      earpiece,
                      coupler,
                      fittingDepth
              )
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getRECDtIndiv9失败", e)
      promise.reject("NAL2_ERROR", "调用getRECDtIndiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setRECDhIndiv(recdh: ReadableArray, promise: Promise) {
    try {
      val recdhDouble = DoubleArray(recdh.size()) { recdh.getDouble(it) }
      nal2Manager.setRECDhIndiv(recdhDouble)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setRECDhIndiv失败", e)
      promise.reject("NAL2_ERROR", "调用setRECDhIndiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setRECDhIndiv9(recdh: ReadableArray, promise: Promise) {
    try {
      val recdhDouble = DoubleArray(recdh.size()) { recdh.getDouble(it) }
      nal2Manager.setRECDhIndiv9(recdhDouble)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setRECDhIndiv9失败", e)
      promise.reject("NAL2_ERROR", "调用setRECDhIndiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setRECDtIndiv(recdt: ReadableArray, promise: Promise) {
    try {
      val recdtDouble = DoubleArray(recdt.size()) { recdt.getDouble(it) }
      nal2Manager.setRECDtIndiv(recdtDouble)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setRECDtIndiv失败", e)
      promise.reject("NAL2_ERROR", "调用setRECDtIndiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setRECDtIndiv9(recdt: ReadableArray, promise: Promise) {
    try {
      val recdtDouble = DoubleArray(recdt.size()) { recdt.getDouble(it) }
      nal2Manager.setRECDtIndiv9(recdtDouble)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setRECDtIndiv9失败", e)
      promise.reject("NAL2_ERROR", "调用setRECDtIndiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun centerFrequencies(channels: Int, promise: Promise) {
    try {
      // CFArray是输出参数，SDK内部会填充
      val cfArrayDouble = DoubleArray(19)
      val result = nal2Manager.getCenterFrequencies(channels, cfArrayDouble)

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushInt(it) }

      Log.d("Nal2Module", "centerFrequencies成功: channels=$channels, result size=${result.size}")
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用centerFrequencies失败", e)
      e.printStackTrace()
      promise.reject("NAL2_ERROR", "调用centerFrequencies失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun compressionRatio(
          channels: Int,
          centreFreq: ReadableArray,
          ac: ReadableArray,
          bc: ReadableArray,
          direction: Int,
          mic: Int,
          limiting: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {
    try {
      // CR数组固定为19个元素（third-octave frequencies），是输出参数
      val crDouble = DoubleArray(19)

      Log.d(
              "Nal2Module",
              "CompressionRatio输入: channels=$channels, centreFreq.size=${centreFreq.size()}, ac.size=${ac.size()}, bc.size=${bc.size()}, acOther.size=${acOther.size()}"
      )

      // centreFreq可能是Int数组或Double数组，需要兼容处理
      val centreFreqInt =
              IntArray(centreFreq.size()) { i ->
                val value = centreFreq.getDynamic(i)
                when {
                  value.type == com.facebook.react.bridge.ReadableType.Number -> {
                    // 尝试获取整数，如果是浮点数则转换
                    try {
                      value.asInt()
                    } catch (e: Exception) {
                      value.asDouble().toInt()
                    }
                  }
                  else -> 0
                }
              }

      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      Log.d(
              "Nal2Module",
              "转换后: centreFreqInt.size=${centreFreqInt.size}, centreFreq=${centreFreqInt.joinToString()}, ac.size=${acDouble.size}, bc.size=${bcDouble.size}, acOther.size=${acOtherDouble.size}"
      )

      val result =
              nal2Manager.getCompressionRatio(
                      crDouble,
                      channels,
                      centreFreqInt,
                      acDouble,
                      bcDouble,
                      direction,
                      mic,
                      limiting,
                      acOtherDouble,
                      noOfAids
              )

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }

      Log.d("Nal2Module", "CompressionRatio_NL2成功: CR=${result.joinToString()}")
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用compressionRatio失败", e)
      e.printStackTrace()
      promise.reject("NAL2_ERROR", "调用compressionRatio失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getMPO(
          mpo: ReadableArray,
          type: Int,
          ac: ReadableArray,
          bc: ReadableArray,
          channels: Int,
          limiting: Int,
          promise: Promise
  ) {
    try {
      val mpoDouble = DoubleArray(mpo.size()) { mpo.getDouble(it) }
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }

      Log.d("Nal2Module", "调用getMPO_NL2: type=$type, channels=$channels, limiting=$limiting")

      val result = nal2Manager.getMPO(mpoDouble, type, acDouble, bcDouble, channels, limiting)

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }

      Log.d("Nal2Module", "getMPO_NL2成功: MPO=${result.joinToString()}")
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getMPO失败", e)
      promise.reject("NAL2_ERROR", "调用getMPO失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun realEarAidedGain(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {
    try {
      val data = DoubleArray(19)
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }

      val result =
              nal2Manager.getRealEarAidedGain(
                      data,
                      acDouble,
                      bcDouble,
                      L,
                      limiting,
                      channels,
                      direction,
                      mic,
                      noOfAids
              )

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用realEarAidedGain失败", e)
      promise.reject("NAL2_ERROR", "调用realEarAidedGain失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun tccCouplerGain(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          target: Int,
          aidType: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          tubing: Int,
          vent: Int,
          RECDmeasType: Int,
          promise: Promise
  ) {
    try {
      val gain = DoubleArray(19)
      val lineType = IntArray(19)
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getTccCouplerGain(
                      gain,
                      acDouble,
                      bcDouble,
                      L,
                      limiting,
                      channels,
                      direction,
                      mic,
                      target,
                      aidType,
                      acOtherDouble,
                      noOfAids,
                      tubing,
                      vent,
                      RECDmeasType,
                      lineType
              )

      // 返回对象包含TccGain和lineType
      val writableMap = Arguments.createMap()
      val tccGainArray = Arguments.createArray()
      result.TccGain.forEach { tccGainArray.pushDouble(it) }
      val lineTypeArray = Arguments.createArray()
      result.lineType.forEach { lineTypeArray.pushInt(it) }

      writableMap.putArray("TccGain", tccGainArray)
      writableMap.putArray("lineType", lineTypeArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用tccCouplerGain失败", e)
      promise.reject("NAL2_ERROR", "调用tccCouplerGain失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun earSimulatorGain(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          direction: Int,
          mic: Int,
          limiting: Int,
          channels: Int,
          target: Int,
          aidType: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          tubing: Int,
          vent: Int,
          RECDmeasType: Int,
          promise: Promise
  ) {
    try {
      val gain = DoubleArray(19)
      val lineType = IntArray(19)
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getEarSimulatorGain(
                      gain,
                      acDouble,
                      bcDouble,
                      L,
                      direction,
                      mic,
                      limiting,
                      channels,
                      target,
                      aidType,
                      acOtherDouble,
                      noOfAids,
                      tubing,
                      vent,
                      RECDmeasType,
                      lineType
              )

      // 返回对象包含ESG和lineType
      val writableMap = Arguments.createMap()
      val esgArray = Arguments.createArray()
      result.ESG.forEach { esgArray.pushDouble(it) }
      val lineTypeArray = Arguments.createArray()
      result.lineType.forEach { lineTypeArray.pushInt(it) }

      writableMap.putArray("ESG", esgArray)
      writableMap.putArray("lineType", lineTypeArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用earSimulatorGain失败", e)
      promise.reject("NAL2_ERROR", "调用earSimulatorGain失败: ${e.message}", e)
    }
  }

  // 数据6-18的ReactMethod接口

  @ReactMethod
  fun getRealEarInputOutputCurve(
          ac: ReadableArray,
          bc: ReadableArray,
          graphFreq: Int,
          startLevel: Int,
          finishLevel: Int,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          target: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getRealEarInputOutputCurve(
                      acDouble,
                      bcDouble,
                      graphFreq,
                      startLevel,
                      finishLevel,
                      limiting,
                      channels,
                      direction,
                      mic,
                      target,
                      acOtherDouble,
                      noOfAids
              )

      val writableMap = Arguments.createMap()
      val reioArray = Arguments.createArray()
      result.IO.forEach { reioArray.pushDouble(it) }
      val reiounlArray = Arguments.createArray()
      result.IOunl.forEach { reiounlArray.pushDouble(it) }

      writableMap.putArray("REIO", reioArray)
      writableMap.putArray("REIOunl", reiounlArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getRealEarInputOutputCurve失败", e)
      promise.reject("NAL2_ERROR", "调用getRealEarInputOutputCurve失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getTccInputOutputCurve(
          ac: ReadableArray,
          bc: ReadableArray,
          graphFreq: Int,
          startLevel: Int,
          finishLevel: Int,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          target: Int,
          aidType: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          tubing: Int,
          vent: Int,
          RECDmeasType: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getTccInputOutputCurve(
                      acDouble,
                      bcDouble,
                      graphFreq,
                      startLevel,
                      finishLevel,
                      limiting,
                      channels,
                      direction,
                      mic,
                      target,
                      aidType,
                      acOtherDouble,
                      noOfAids,
                      tubing,
                      vent,
                      RECDmeasType
              )

      val writableMap = Arguments.createMap()
      val tccIOArray = Arguments.createArray()
      result.TccIO.forEach { tccIOArray.pushDouble(it) }
      val tccIOunlArray = Arguments.createArray()
      result.TccIOunl.forEach { tccIOunlArray.pushDouble(it) }
      val lineTypeArray = Arguments.createArray()
      result.lineType.forEach { lineTypeArray.pushInt(it) }

      writableMap.putArray("TccIO", tccIOArray)
      writableMap.putArray("TccIOunl", tccIOunlArray)
      writableMap.putArray("lineType", lineTypeArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getTccInputOutputCurve失败", e)
      promise.reject("NAL2_ERROR", "调用getTccInputOutputCurve失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getEarSimulatorInputOutputCurve(
          ac: ReadableArray,
          bc: ReadableArray,
          graphFreq: Int,
          startLevel: Int,
          finishLevel: Int,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          target: Int,
          aidType: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          tubing: Int,
          vent: Int,
          RECDmeasType: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getEarSimulatorInputOutputCurve(
                      acDouble,
                      bcDouble,
                      graphFreq,
                      startLevel,
                      finishLevel,
                      limiting,
                      channels,
                      direction,
                      mic,
                      target,
                      aidType,
                      acOtherDouble,
                      noOfAids,
                      tubing,
                      vent,
                      RECDmeasType
              )

      val writableMap = Arguments.createMap()
      val esIOArray = Arguments.createArray()
      result.ESIO.forEach { esIOArray.pushDouble(it) }
      val esIOunlArray = Arguments.createArray()
      result.ESIOunl.forEach { esIOunlArray.pushDouble(it) }
      val lineTypeArray = Arguments.createArray()
      result.lineType.forEach { lineTypeArray.pushInt(it) }

      writableMap.putArray("ESIO", esIOArray)
      writableMap.putArray("ESIOunl", esIOunlArray)
      writableMap.putArray("lineType", lineTypeArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getEarSimulatorInputOutputCurve失败", e)
      promise.reject("NAL2_ERROR", "调用getEarSimulatorInputOutputCurve失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getSpeechOGram(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getSpeechOGram(
                      acDouble,
                      bcDouble,
                      L,
                      limiting,
                      channels,
                      direction,
                      mic,
                      acOtherDouble,
                      noOfAids
              )

      val writableMap = Arguments.createMap()
      val rmsArray = Arguments.createArray()
      result.Speech_rms.forEach { rmsArray.pushDouble(it) }
      val maxArray = Arguments.createArray()
      result.Speech_max.forEach { maxArray.pushDouble(it) }
      val minArray = Arguments.createArray()
      result.Speech_min.forEach { minArray.pushDouble(it) }
      val threshArray = Arguments.createArray()
      result.Speech_thresh.forEach { threshArray.pushDouble(it) }

      writableMap.putArray("Speech_rms", rmsArray)
      writableMap.putArray("Speech_max", maxArray)
      writableMap.putArray("Speech_min", minArray)
      writableMap.putArray("Speech_thresh", threshArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getSpeechOGram失败", e)
      promise.reject("NAL2_ERROR", "调用getSpeechOGram失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getAidedThreshold(
          ac: ReadableArray,
          bc: ReadableArray,
          ct: ReadableArray,
          dbOption: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val ctDouble = DoubleArray(ct.size()) { ct.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getAidedThreshold(
                      acDouble,
                      bcDouble,
                      ctDouble,
                      dbOption,
                      acOtherDouble,
                      noOfAids,
                      limiting,
                      channels,
                      direction,
                      mic
              )

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getAidedThreshold失败", e)
      promise.reject("NAL2_ERROR", "调用getAidedThreshold失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getREDDindiv(defValues: Int, promise: Promise) {
    try {
      val result = nal2Manager.getREDDindiv(defValues)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getREDDindiv失败", e)
      promise.reject("NAL2_ERROR", "调用getREDDindiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getREDDindiv9(defValues: Int, promise: Promise) {
    try {
      val result = nal2Manager.getREDDindiv9(defValues)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getREDDindiv9失败", e)
      promise.reject("NAL2_ERROR", "调用getREDDindiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getREURindiv(defValues: Int, dateOfBirth: Int, direction: Int, mic: Int, promise: Promise) {
    try {
      val result = nal2Manager.getREURindiv(defValues, dateOfBirth, direction, mic)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getREURindiv失败", e)
      promise.reject("NAL2_ERROR", "调用getREURindiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getREURindiv9(defValues: Int, dateOfBirth: Int, direction: Int, mic: Int, promise: Promise) {
    try {
      val result = nal2Manager.getREURindiv9(defValues, dateOfBirth, direction, mic)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getREURindiv9失败", e)
      promise.reject("NAL2_ERROR", "调用getREURindiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setREDDindiv(redd: ReadableArray, defValues: Int, promise: Promise) {
    try {
      val reddDouble = DoubleArray(redd.size()) { redd.getDouble(it) }
      nal2Manager.setREDDindiv(reddDouble, defValues)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setREDDindiv失败", e)
      promise.reject("NAL2_ERROR", "调用setREDDindiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setREDDindiv9(redd: ReadableArray, defValues: Int, promise: Promise) {
    try {
      val reddDouble = DoubleArray(redd.size()) { redd.getDouble(it) }
      nal2Manager.setREDDindiv9(reddDouble, defValues)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setREDDindiv9失败", e)
      promise.reject("NAL2_ERROR", "调用setREDDindiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setREURindiv(
          reur: ReadableArray,
          defValues: Int,
          dateOfBirth: Int,
          direction: Int,
          mic: Int,
          promise: Promise
  ) {
    try {
      val reurDouble = DoubleArray(reur.size()) { reur.getDouble(it) }
      nal2Manager.setREURindiv(reurDouble, defValues, dateOfBirth, direction, mic)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setREURindiv失败", e)
      promise.reject("NAL2_ERROR", "调用setREURindiv失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun setREURindiv9(
          reur: ReadableArray,
          defValues: Int,
          dateOfBirth: Int,
          direction: Int,
          mic: Int,
          promise: Promise
  ) {
    try {
      val reurDouble = DoubleArray(reur.size()) { reur.getDouble(it) }
      nal2Manager.setREURindiv9(reurDouble, defValues, dateOfBirth, direction, mic)
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用setREURindiv9失败", e)
      promise.reject("NAL2_ERROR", "调用setREURindiv9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun processData(
          dateOfBirth: Int,
          adultChild: Int,
          experience: Int,
          compSpeed: Int,
          tonal: Int,
          gender: Int,
          channels: Int,
          bandWidth: Int,
          selection: Int,
          WBCT: Int,
          haType: Int,
          direction: Int,
          mic: Int,
          noOfAids: Int,
          ac: ReadableArray,
          bc: ReadableArray,
          calcCh: ReadableArray,
          levels: ReadableArray,
          promise: Promise
  ) {

    // 将 ReadableArray 转换为 IntArray 和 DoubleArray
    val acArray = IntArray(ac.size()) { ac.getInt(it) }
    Log.d("Nal2Module", "ac: ${acArray.joinToString()}")

    val writableMap = Arguments.createMap()

    val limiting = 1

    val cfArr = DoubleArray(19)
    val freqInCh = IntArray(19)
    val ct = DoubleArray(19)
    val mpo = DoubleArray(19)

    // 转换数组
    val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
    val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
    val levelsInt = IntArray(levels.size()) { levels.getInt(it) }
    val calcChArray = IntArray(calcCh.size()) { calcCh.getInt(it) }

    try {
      // 使用Nal2Manager单例处理所有NAL2相关操作
      nal2Manager.setAdultChild(adultChild, dateOfBirth)
      nal2Manager.setExperience(experience)
      nal2Manager.setCompSpeed(compSpeed)
      nal2Manager.setTonalLanguage(tonal)
      nal2Manager.setGender(gender)

      // 获取交叉频率
      val outputData =
              nal2Manager.getCrossOverFrequencies(cfArr, channels, acDouble, bcDouble, freqInCh)
      nal2Manager.setBWC(channels, outputData)
      nal2Manager.setCompressionThreshold(
              ct,
              bandWidth,
              selection,
              WBCT,
              haType,
              direction,
              mic,
              calcChArray
      )

      val cfArray = Arguments.createArray()
      outputData.forEach { cfArray.pushDouble(it) }
      writableMap.putArray("cfArray", cfArray)

      // 获取MPO (type=1 for SSPL)
      val mpoData = nal2Manager.getMPO(mpo, 1, acDouble, bcDouble, channels, limiting)
      val mpoArray = Arguments.createArray()
      mpoData.forEach { mpoArray.pushDouble(it) }
      writableMap.putArray("mpo", mpoArray)

      // 获取各级别增益
      for (level in levelsInt) {
        val data = DoubleArray(19)
        val gainData =
                nal2Manager.getRealEarAidedGain(
                        data,
                        acDouble,
                        bcDouble,
                        level.toDouble(),
                        limiting,
                        channels,
                        direction,
                        mic,
                        noOfAids
                )

        val array = Arguments.createArray()
        gainData.forEach { array.pushDouble(it) }
        writableMap.putArray(level.toString(), array)
      }

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "处理NAL2数据时出错", e)
      promise.reject("NAL2_ERROR", "处理NAL2数据时出错: ${e.message}", e)
    }
  }

  // 数据25-33的新增ReactMethod接口

  @ReactMethod
  fun getGainAt(
          freqRequired: Int,
          targetType: Int,
          ac: ReadableArray,
          bc: ReadableArray,
          L: Double,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          bandWidth: Int,
          target: Int,
          aidType: Int,
          tubing: Int,
          vent: Int,
          RECDmeasType: Int,
          promise: Promise
  ) {
    try {
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getGainAt(
                      freqRequired,
                      targetType,
                      acDouble,
                      bcDouble,
                      L,
                      limiting,
                      channels,
                      direction,
                      mic,
                      acOtherDouble,
                      noOfAids,
                      bandWidth,
                      target,
                      aidType,
                      tubing,
                      vent,
                      RECDmeasType
              )

      promise.resolve(result)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getGainAt失败", e)
      promise.reject("NAL2_ERROR", "调用getGainAt失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getMLE(aidType: Int, direction: Int, mic: Int, promise: Promise) {
    try {
      val result = nal2Manager.getMLE(aidType, direction, mic)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getMLE失败", e)
      promise.reject("NAL2_ERROR", "调用getMLE失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getReturnValues(promise: Promise) {
    try {
      val result = nal2Manager.getReturnValues()
      val writableMap = Arguments.createMap()

      val mafArray = Arguments.createArray()
      result.MAF.forEach { mafArray.pushDouble(it) }
      val bwcArray = Arguments.createArray()
      result.BWC.forEach { bwcArray.pushDouble(it) }
      val escdArray = Arguments.createArray()
      result.ESCD.forEach { escdArray.pushDouble(it) }

      writableMap.putArray("MAF", mafArray)
      writableMap.putArray("BWC", bwcArray)
      writableMap.putArray("ESCD", escdArray)

      promise.resolve(writableMap)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getReturnValues失败", e)
      promise.reject("NAL2_ERROR", "调用getReturnValues失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getTubing(tubing: Int, promise: Promise) {
    try {
      val result = nal2Manager.getTubing(tubing)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getTubing失败", e)
      promise.reject("NAL2_ERROR", "调用getTubing失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getTubing9(tubing: Int, promise: Promise) {
    try {
      val result = nal2Manager.getTubing9(tubing)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getTubing9失败", e)
      promise.reject("NAL2_ERROR", "调用getTubing9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getVentOut(vent: Int, promise: Promise) {
    try {
      val result = nal2Manager.getVentOut(vent)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getVentOut失败", e)
      promise.reject("NAL2_ERROR", "调用getVentOut失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getVentOut9(vent: Int, promise: Promise) {
    try {
      val result = nal2Manager.getVentOut9(vent)
      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getVentOut9失败", e)
      promise.reject("NAL2_ERROR", "调用getVentOut9失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getSI(s: Int, REAG: ReadableArray, Limit: ReadableArray, promise: Promise) {
    try {
      val reagDouble = DoubleArray(REAG.size()) { REAG.getDouble(it) }
      val limitDouble = DoubleArray(Limit.size()) { Limit.getDouble(it) }

      val result = nal2Manager.getSI(s, reagDouble, limitDouble)
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getSI失败", e)
      promise.reject("NAL2_ERROR", "调用getSI失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getSII(
          nCompSpeed: Int,
          Speech_thresh: ReadableArray,
          s: Int,
          REAG: ReadableArray,
          REAGp: ReadableArray,
          REAGm: ReadableArray,
          REUR: ReadableArray,
          promise: Promise
  ) {
    try {
      val speechThreshDouble = DoubleArray(Speech_thresh.size()) { Speech_thresh.getDouble(it) }
      val reagDouble = DoubleArray(REAG.size()) { REAG.getDouble(it) }
      val reagpDouble = DoubleArray(REAGp.size()) { REAGp.getDouble(it) }
      val reagmDouble = DoubleArray(REAGm.size()) { REAGm.getDouble(it) }
      val reurDouble = DoubleArray(REUR.size()) { REUR.getDouble(it) }

      val result =
              nal2Manager.getSII(
                      nCompSpeed,
                      speechThreshDouble,
                      s,
                      reagDouble,
                      reagpDouble,
                      reagmDouble,
                      reurDouble
              )
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用getSII失败", e)
      promise.reject("NAL2_ERROR", "调用getSII失败: ${e.message}", e)
    }
  }

  /** 同步处理HTTP请求的NAL2函数调用 接收JSON字符串，解析后调用相应的NAL2函数，返回JSON结果 */
  @ReactMethod
  fun processRequestSync(requestJson: String, promise: Promise) {
    try {
      Log.d("Nal2Module", "processRequestSync: 收到请求，长度=${requestJson.length}")

      val request = JSONObject(requestJson)
      val sequenceNum = request.optInt("sequence_num", 0)
      val functionName = request.getString("function")
      val inputParams = request.getJSONObject("input_parameters")

      Log.d("Nal2Module", "processRequestSync: 函数=$functionName, 序号=$sequenceNum")

      // 构建响应
      val response = JSONObject()
      response.put("sequence_num", sequenceNum)
      response.put("function", functionName)
      response.put("return", 0)

      // 处理函数并获取输出参数
      val outputParams = processFunction(functionName, inputParams)
      response.put("output_parameters", outputParams)

      Log.d("Nal2Module", "processRequestSync: 处理完成")
      promise.resolve(response.toString())
    } catch (e: Exception) {
      Log.e("Nal2Module", "processRequestSync失败", e)

      // 返回错误响应
      try {
        val errorResponse = JSONObject()
        errorResponse.put("sequence_num", 0)
        errorResponse.put("function", "unknown")
        errorResponse.put("return", -1)

        val errorParams = JSONObject()
        errorParams.put("error", e.message ?: "Unknown error")
        errorResponse.put("output_parameters", errorParams)

        promise.resolve(errorResponse.toString())
      } catch (e2: Exception) {
        promise.reject("PROCESS_ERROR", e.message, e)
      }
    }
  }

  /** 根据函数名处理请求并返回输出参数 */
  private fun processFunction(functionName: String, params: JSONObject): JSONObject {
    val output = JSONObject()

    when (functionName) {
      "dllVersion" -> {
        val version = nal2Manager.getDllVersion()
        output.put("major", version[0])
        output.put("minor", version[1])
      }
      "CrossOverFrequencies_NL2" -> {
        val channels = params.getInt("channels")
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))

        val cfArr = DoubleArray(19)
        val freqInCh = IntArray(19)
        val result = nal2Manager.getCrossOverFrequencies(cfArr, channels, ac, bc, freqInCh)
        output.put("crossOverFreq", doubleArrayToJSONArray(result))
      }
      "CenterFrequencies" -> {
        val channels = params.getInt("channels")
        val cfArrayDouble = DoubleArray(19)
        val result = nal2Manager.getCenterFrequencies(channels, cfArrayDouble)
        output.put("centreFreq", intArrayToJSONArray(result))
      }
      "CompressionThreshold_NL2" -> {
        val ct = DoubleArray(19)
        nal2Manager.setCompressionThreshold(
                ct,
                0,
                1,
                params.getInt("WBCT"),
                params.getInt("aidType"),
                params.getInt("direction"),
                params.getInt("mic"),
                intArrayOf(1)
        )
        output.put("CT", doubleArrayToJSONArray(ct))
      }
      "setBWC" -> {
        val channels = params.getInt("channels")
        val crossOver = jsonArrayToDoubleArray(params.getJSONArray("crossOver"))
        nal2Manager.setBWC(channels, crossOver)
        output.put("success", true)
      }
      "SetAdultChild" -> {
        nal2Manager.setAdultChild(params.getInt("adultChild"), params.getInt("dateOfBirth"))
        output.put("success", true)
      }
      "SetExperience" -> {
        nal2Manager.setExperience(params.getInt("experience"))
        output.put("success", true)
      }
      "SetCompSpeed" -> {
        nal2Manager.setCompSpeed(params.getInt("compSpeed"))
        output.put("success", true)
      }
      "SetTonalLanguage" -> {
        nal2Manager.setTonalLanguage(params.getInt("tonal"))
        output.put("success", true)
      }
      "SetGender" -> {
        nal2Manager.setGender(params.getInt("gender"))
        output.put("success", true)
      }
      "GetRECDh_indiv_NL2" -> {
        val result =
                nal2Manager.getRECDhIndiv(
                        params.getInt("RECDmeasType"),
                        params.getInt("dateOfBirth"),
                        params.getInt("aidType"),
                        params.getInt("tubing"),
                        params.getInt("coupler"),
                        params.getInt("fittingDepth")
                )
        output.put("RECDh", doubleArrayToJSONArray(result))
      }
      "GetRECDh_indiv9_NL2" -> {
        val result =
                nal2Manager.getRECDhIndiv9(
                        params.getInt("RECDmeasType"),
                        params.getInt("dateOfBirth"),
                        params.getInt("aidType"),
                        params.getInt("tubing"),
                        params.getInt("coupler"),
                        params.getInt("fittingDepth")
                )
        output.put("RECDh", doubleArrayToJSONArray(result))
      }
      "GetRECDt_indiv_NL2" -> {
        val result =
                nal2Manager.getRECDtIndiv(
                        params.getInt("RECDmeasType"),
                        params.getInt("dateOfBirth"),
                        params.getInt("aidType"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("earpiece"),
                        params.getInt("coupler"),
                        params.getInt("fittingDepth")
                )
        output.put("RECDt", doubleArrayToJSONArray(result))
      }
      "GetRECDt_indiv9_NL2" -> {
        val result =
                nal2Manager.getRECDtIndiv9(
                        params.getInt("RECDmeasType"),
                        params.getInt("dateOfBirth"),
                        params.getInt("aidType"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("earpiece"),
                        params.getInt("coupler"),
                        params.getInt("fittingDepth")
                )
        output.put("RECDt", doubleArrayToJSONArray(result))
      }
      "SetRECDh_indiv_NL2" -> {
        nal2Manager.setRECDhIndiv(jsonArrayToDoubleArray(params.getJSONArray("RECDh")))
        output.put("success", true)
      }
      "SetRECDh_indiv9_NL2" -> {
        nal2Manager.setRECDhIndiv9(jsonArrayToDoubleArray(params.getJSONArray("RECDh")))
        output.put("success", true)
      }
      "SetRECDt_indiv_NL2" -> {
        nal2Manager.setRECDtIndiv(jsonArrayToDoubleArray(params.getJSONArray("RECDt")))
        output.put("success", true)
      }
      "SetRECDt_indiv9_NL2" -> {
        nal2Manager.setRECDtIndiv9(jsonArrayToDoubleArray(params.getJSONArray("RECDt")))
        output.put("success", true)
      }
      "CompressionRatio_NL2" -> {
        val cr = DoubleArray(19)
        val channels = params.getInt("channels")
        val centreFreq = jsonArrayToIntArray(params.getJSONArray("centreFreq"))
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getCompressionRatio(
                        cr,
                        channels,
                        centreFreq,
                        ac,
                        bc,
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("limiting"),
                        acOther,
                        params.getInt("noOfAids")
                )
        output.put("CR", doubleArrayToJSONArray(result))
      }
      "getMPO_NL2" -> {
        val mpo = DoubleArray(19)
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))

        val result =
                nal2Manager.getMPO(
                        mpo,
                        params.getInt("type"),
                        ac,
                        bc,
                        params.getInt("channels"),
                        params.getInt("limiting")
                )
        output.put("MPO", doubleArrayToJSONArray(result))
      }
      "RealEarInsertionGain_NL2" -> {
        val reig = DoubleArray(19)
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getRealEarInsertionGain(
                        reig,
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        acOther,
                        params.getInt("noOfAids")
                )
        output.put("REIG", doubleArrayToJSONArray(result))
      }
      "RealEarAidedGain_NL2" -> {
        val data = DoubleArray(19)
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))

        val result =
                nal2Manager.getRealEarAidedGain(
                        data,
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("noOfAids")
                )
        output.put("REAG", doubleArrayToJSONArray(result))
      }
      "TccCouplerGain_NL2" -> {
        val gain = DoubleArray(19)
        val lineType = IntArray(19)
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getTccCouplerGain(
                        gain,
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("target"),
                        params.getInt("aidType"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("RECDmeasType"),
                        lineType
                )
        output.put("TccGain", doubleArrayToJSONArray(result.TccGain))
        output.put("lineType", intArrayToJSONArray(result.lineType))
      }
      "EarSimulatorGain_NL2" -> {
        val gain = DoubleArray(19)
        val lineType = IntArray(19)
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getEarSimulatorGain(
                        gain,
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("target"),
                        params.getInt("aidType"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("RECDmeasType"),
                        lineType
                )
        output.put("ESG", doubleArrayToJSONArray(result.ESG))
        output.put("lineType", intArrayToJSONArray(result.lineType))
      }
      "RealEarInputOutputCurve_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getRealEarInputOutputCurve(
                        ac,
                        bc,
                        params.getInt("graphFreq"),
                        params.getInt("startLevel"),
                        params.getInt("finishLevel"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("target"),
                        acOther,
                        params.getInt("noOfAids")
                )
        output.put("REIO", doubleArrayToJSONArray(result.IO))
        output.put("REIOunl", doubleArrayToJSONArray(result.IOunl))
      }
      "TccInputOutputCurve_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getTccInputOutputCurve(
                        ac,
                        bc,
                        params.getInt("graphFreq"),
                        params.getInt("startLevel"),
                        params.getInt("finishLevel"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("target"),
                        params.getInt("aidType"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("RECDmeasType")
                )
        output.put("TccIO", doubleArrayToJSONArray(result.TccIO))
        output.put("TccIOunl", doubleArrayToJSONArray(result.TccIOunl))
        output.put("lineType", intArrayToJSONArray(result.lineType))
      }
      "EarSimulatorInputOutputCurve_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getEarSimulatorInputOutputCurve(
                        ac,
                        bc,
                        params.getInt("graphFreq"),
                        params.getInt("startLevel"),
                        params.getInt("finishLevel"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        params.getInt("target"),
                        params.getInt("aidType"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("RECDmeasType")
                )
        output.put("ESIO", doubleArrayToJSONArray(result.ESIO))
        output.put("ESIOunl", doubleArrayToJSONArray(result.ESIOunl))
        output.put("lineType", intArrayToJSONArray(result.lineType))
      }
      "Speech_o_Gram_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getSpeechOGram(
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        acOther,
                        params.getInt("noOfAids")
                )
        output.put("Speech_rms", doubleArrayToJSONArray(result.Speech_rms))
        output.put("Speech_max", doubleArrayToJSONArray(result.Speech_max))
        output.put("Speech_min", doubleArrayToJSONArray(result.Speech_min))
        output.put("Speech_thresh", doubleArrayToJSONArray(result.Speech_thresh))
      }
      "AidedThreshold_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val ct = jsonArrayToDoubleArray(params.getJSONArray("CT"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getAidedThreshold(
                        ac,
                        bc,
                        ct,
                        params.getInt("dbOption"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic")
                )
        output.put("AT", doubleArrayToJSONArray(result))
      }
      "GetREDDindiv" -> {
        val result = nal2Manager.getREDDindiv(params.getInt("defValues"))
        output.put("REDD", doubleArrayToJSONArray(result))
      }
      "GetREDDindiv9" -> {
        val result = nal2Manager.getREDDindiv9(params.getInt("defValues"))
        output.put("REDD", doubleArrayToJSONArray(result))
      }
      "GetREURindiv" -> {
        val result =
                nal2Manager.getREURindiv(
                        params.getInt("defValues"),
                        params.getInt("dateOfBirth"),
                        params.getInt("direction"),
                        params.getInt("mic")
                )
        output.put("REUR", doubleArrayToJSONArray(result))
      }
      "GetREURindiv9" -> {
        val result =
                nal2Manager.getREURindiv9(
                        params.getInt("defValues"),
                        params.getInt("dateOfBirth"),
                        params.getInt("direction"),
                        params.getInt("mic")
                )
        output.put("REUR", doubleArrayToJSONArray(result))
      }
      "SetREDDindiv" -> {
        nal2Manager.setREDDindiv(
                jsonArrayToDoubleArray(params.getJSONArray("REDD")),
                params.getInt("defValues")
        )
        output.put("success", true)
      }
      "SetREDDindiv9" -> {
        nal2Manager.setREDDindiv9(
                jsonArrayToDoubleArray(params.getJSONArray("REDD")),
                params.getInt("defValues")
        )
        output.put("success", true)
      }
      "SetREURindiv" -> {
        nal2Manager.setREURindiv(
                jsonArrayToDoubleArray(params.getJSONArray("REUR")),
                params.getInt("defValues"),
                params.getInt("dateOfBirth"),
                params.getInt("direction"),
                params.getInt("mic")
        )
        output.put("success", true)
      }
      "SetREURindiv9" -> {
        nal2Manager.setREURindiv9(
                jsonArrayToDoubleArray(params.getJSONArray("REUR")),
                params.getInt("defValues"),
                params.getInt("dateOfBirth"),
                params.getInt("direction"),
                params.getInt("mic")
        )
        output.put("success", true)
      }
      "GainAt_NL2" -> {
        val ac = jsonArrayToDoubleArray(params.getJSONArray("AC"))
        val bc = jsonArrayToDoubleArray(params.getJSONArray("BC"))
        val acOther = jsonArrayToDoubleArray(params.getJSONArray("ACother"))

        val result =
                nal2Manager.getGainAt(
                        params.getInt("freqRequired"),
                        params.getInt("targetType"),
                        ac,
                        bc,
                        params.getDouble("L"),
                        params.getInt("limiting"),
                        params.getInt("channels"),
                        params.getInt("direction"),
                        params.getInt("mic"),
                        acOther,
                        params.getInt("noOfAids"),
                        params.getInt("bandWidth"),
                        params.getInt("target"),
                        params.getInt("aidType"),
                        params.getInt("tubing"),
                        params.getInt("vent"),
                        params.getInt("RECDmeasType")
                )
        output.put("Gain", result)
      }
      "GetMLE" -> {
        val result =
                nal2Manager.getMLE(
                        params.getInt("aidType"),
                        params.getInt("direction"),
                        params.getInt("mic")
                )
        output.put("MLE", doubleArrayToJSONArray(result))
      }
      "ReturnValues_NL2" -> {
        val result = nal2Manager.getReturnValues()
        output.put("MAF", doubleArrayToJSONArray(result.MAF))
        output.put("BWC", doubleArrayToJSONArray(result.BWC))
        output.put("ESCD", doubleArrayToJSONArray(result.ESCD))
      }
      "GetTubing_NL2" -> {
        val result = nal2Manager.getTubing(params.getInt("tubing"))
        output.put("Tubing", doubleArrayToJSONArray(result))
      }
      "GetTubing9_NL2" -> {
        val result = nal2Manager.getTubing9(params.getInt("tubing"))
        output.put("Tubing", doubleArrayToJSONArray(result))
      }
      "GetVentOut_NL2" -> {
        val result = nal2Manager.getVentOut(params.getInt("vent"))
        output.put("VentOut", doubleArrayToJSONArray(result))
      }
      "GetVentOut9_NL2" -> {
        val result = nal2Manager.getVentOut9(params.getInt("vent"))
        output.put("VentOut", doubleArrayToJSONArray(result))
      }
      "Get_SI_NL2" -> {
        val reag = jsonArrayToDoubleArray(params.getJSONArray("REAG"))
        val limit = jsonArrayToDoubleArray(params.getJSONArray("Limit"))
        val result = nal2Manager.getSI(params.getInt("s"), reag, limit)
        output.put("SI", result)
      }
      "Get_SII" -> {
        val speechThresh = jsonArrayToDoubleArray(params.getJSONArray("Speech_thresh"))
        val reag = jsonArrayToDoubleArray(params.getJSONArray("REAG"))
        val reagp = jsonArrayToDoubleArray(params.getJSONArray("REAGp"))
        val reagm = jsonArrayToDoubleArray(params.getJSONArray("REAGm"))
        val reur = jsonArrayToDoubleArray(params.getJSONArray("REUR"))

        val result =
                nal2Manager.getSII(
                        params.getInt("nCompSpeed"),
                        speechThresh,
                        params.getInt("s"),
                        reag,
                        reagp,
                        reagm,
                        reur
                )
        output.put("SII", result)
      }
      else -> throw Exception("未知函数: $functionName")
    }

    return output
  }

  // 辅助方法：JSON数组转Double数组
  private fun jsonArrayToDoubleArray(jsonArray: JSONArray): DoubleArray {
    return DoubleArray(jsonArray.length()) { jsonArray.getDouble(it) }
  }

  // 辅助方法：JSON数组转Int数组
  private fun jsonArrayToIntArray(jsonArray: JSONArray): IntArray {
    return IntArray(jsonArray.length()) {
      // 兼容处理：可能是整数也可能是浮点数
      try {
        jsonArray.getInt(it)
      } catch (e: Exception) {
        jsonArray.getDouble(it).toInt()
      }
    }
  }

  // 辅助方法：Double数组转JSON数组
  private fun doubleArrayToJSONArray(array: DoubleArray): JSONArray {
    val jsonArray = JSONArray()
    array.forEach { jsonArray.put(it) }
    return jsonArray
  }

  // 辅助方法：Int数组转JSON数组
  private fun intArrayToJSONArray(array: IntArray): JSONArray {
    val jsonArray = JSONArray()
    array.forEach { jsonArray.put(it) }
    return jsonArray
  }
}
