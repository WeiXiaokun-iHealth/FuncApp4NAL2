package com.nal2

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

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
  fun centerFrequencies(channels: Int, cfArray: ReadableArray, promise: Promise) {
    try {
      // CenterFrequencies通常只是设置中心频率，可能不返回结果
      // 这里简单返回输入的频率数组
      promise.resolve(cfArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用CenterFrequencies失败", e)
      promise.reject("NAL2_ERROR", "调用CenterFrequencies失败: ${e.message}", e)
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
  fun compressionRatio(
          cr: ReadableArray,
          channels: Int,
          centerFreq: Int,
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
      val crDouble = DoubleArray(cr.size()) { cr.getDouble(it) }
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }
      val acOtherDouble = DoubleArray(acOther.size()) { acOther.getDouble(it) }

      val result =
              nal2Manager.getCompressionRatio(
                      crDouble,
                      channels,
                      centerFreq,
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
      promise.resolve(resultArray)
    } catch (e: Exception) {
      Log.e("Nal2Module", "调用compressionRatio失败", e)
      promise.reject("NAL2_ERROR", "调用compressionRatio失败: ${e.message}", e)
    }
  }

  @ReactMethod
  fun getMPO(
          type: Int,
          ac: ReadableArray,
          bc: ReadableArray,
          channels: Int,
          limiting: Int,
          acOther: ReadableArray,
          direction: Int,
          mic: Int,
          noOfAids: Int,
          promise: Promise
  ) {
    try {
      val mpo = DoubleArray(19)
      val acDouble = DoubleArray(ac.size()) { ac.getDouble(it) }
      val bcDouble = DoubleArray(bc.size()) { bc.getDouble(it) }

      val result = nal2Manager.getMPO(mpo, limiting, acDouble, bcDouble, channels)

      val resultArray = Arguments.createArray()
      result.forEach { resultArray.pushDouble(it) }
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

      // 获取MPO
      val mpoData = nal2Manager.getMPO(mpo, limiting, acDouble, bcDouble, channels)
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
                        level,
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
}
