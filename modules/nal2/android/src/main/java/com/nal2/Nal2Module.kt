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
  fun realEarInsertionGain(
          ac: ReadableArray,
          bc: ReadableArray,
          L: Int,
          limiting: Int,
          channels: Int,
          direction: Int,
          mic: Int,
          acOther: ReadableArray,
          noOfAids: Int,
          promise: Promise
  ) {

    try {
      // 准备输出数组
      val reig = DoubleArray(channels)

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
