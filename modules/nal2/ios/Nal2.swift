import Foundation
import React

@objc(Nal2)
class Nal2: NSObject {
    
    @objc(processData:adultChild:experience:compSpeed:tonal:gender:channels:bandWidth:selection:WBCT:haType:direction:mic:noOfAids:ac:bc:calcCh:levels:resolver:rejecter:)

    func processData(
        dateOfBirth: NSNumber,
        adultChild: NSNumber,
        experience: NSNumber,
        compSpeed: NSNumber,
        tonal: NSNumber,
        gender: NSNumber,
        channels: NSNumber,
        bandWidth: NSNumber,
        selection: NSNumber,
        WBCT: NSNumber,
        haType: NSNumber,
        direction: NSNumber,
        mic: NSNumber,
        noOfAids: NSNumber,
        ac: [NSNumber],
        bc: [NSNumber],
        calcCh: [NSNumber],
        levels: [NSNumber],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) -> Void {
            
            
            print(ac)
            print(bc)
            print(calcCh)
            print(levels)
            

            let nal2Manager = NAL2Manager.shared()
            let result = nal2Manager.runNAL2(
                dateOfBirth.int32Value,
                adultChild: adultChild.int32Value,
                experience: experience.int32Value,
                compSpeed: compSpeed.int32Value,
                tonal: tonal.int32Value,
                gender: gender.int32Value,
                channels: channels.int32Value,
                bandWidth: bandWidth.int32Value,
                selection: selection.int32Value,
                wbct: WBCT.int32Value,
                haType: haType.int32Value,
                direction: direction.int32Value,
                mic: mic.int32Value,
                noOfAids: noOfAids.int32Value,
                ac: ac,
                bc: bc,
                calcCh: calcCh,
                levels: levels
            )
            
            print("===============  NAL2 数据 =================== \n")
            
            // 将 result 转换为 [String: [Any]] 类型的字典
            var resultDictionary = [String: [Any]]()

            if let resultDict = result as? [AnyHashable: Any] {
                // 这里无需转换，因为编译器已知类型
                for (key, value) in resultDict {
                    if let arrayValue = value as? [Any] {
                        let stringKey = String(describing: key)
                        resultDictionary[stringKey] = arrayValue
                    }
                }
            }

            // 现在 resultDictionary 是一个 <String: Array> 类型的字典
            print(resultDictionary)
            
            print("\n ===============  NAL2 数据 =================== \n")
            
            // 返回结果
            resolve(resultDictionary)
            
            
        }
    
    @objc(realEarInsertionGain:bc:L:limiting:channels:direction:mic:acOther:noOfAids:resolver:rejecter:)
    func realEarInsertionGain(
        ac: [NSNumber],
        bc: [NSNumber],
        L: NSNumber,
        limiting: NSNumber,
        channels: NSNumber,
        direction: NSNumber,
        mic: NSNumber,
        acOther: [NSNumber],
        noOfAids: NSNumber,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let nal2Manager = NAL2Manager.shared()
        let result = nal2Manager.getRealEarInsertionGain(
            ac,
            bc: bc,
            l: L.int32Value,
            limiting: limiting.int32Value,
            channels: channels.int32Value,
            direction: direction.int32Value,
            mic: mic.int32Value,
            acOther: acOther,
            noOfAids: noOfAids.int32Value
        )
        
        // 构建返回结果
        let resultDict: [String: Any] = ["REIG": result]
        resolve(resultDict)
    }
}
