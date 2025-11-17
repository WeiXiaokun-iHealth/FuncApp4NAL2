//
//  NAL2Manager.m
//  react-native-nal2
//
//  Created by 魏晓堃 on 6/19/25.
//

#import "NAL2Manager.h"
#import <NAL_NL2/NAL-NL2.h>

struct Client
{
    int dateOfBirth;
    int adultChild;
    int gender;
    int tonal;
    int experience;
};

@implementation NAL2Manager


+ (instancetype)sharedManager {
    static NAL2Manager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (NSDictionary *)runNAL2:(int)dateOfBirth adultChild:(int)adultChild experience:(int)experience compSpeed:(int)compSpeed tonal:(int)tonal gender:(int)gender channels:(int)channels bandWidth:(int)bandWidth selection:(int)selection WBCT:(int)WBCT haType:(int)haType direction:(int)direction mic:(int)mic noOfAids:(int)noOfAids ac:(NSArray *)ac bc:(NSArray *)bc calcCh:(NSArray *)calcCh levels:(NSArray *)levels {
    
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    
    Client client;
    
    int limiting = 1;
    int numAids = 1;
    
    double CFArray[19];
    double MPO[19];
    int freqInCh[19];
    int bandwidth = 0;
    
    double ct[19];
    double data[19];
    
    size_t length;
    double *acArr = convertNSArrayToDoubleArray(ac, &length);
    int *calcChArr = convertNSArrayToIntArray(calcCh, &length);
    
    client.dateOfBirth = dateOfBirth;
    client.adultChild = adultChild;
    client.gender = gender;
    client.tonal = tonal;
    client.experience = experience;
    
    SetAdultChild(client.adultChild, client.dateOfBirth);
    SetExperience(client.experience);
    SetCompSpeed(compSpeed);
    SetTonalLanguage(client.tonal);
    SetGender(client.gender);
    
    CrossOverFrequencies_NL2(CFArray, channels, acArr, acArr, freqInCh);
    setBWC(channels, CFArray);
    CompressionThreshold_NL2(ct, bandwidth, selection, WBCT, haType, direction, mic, calcChArr);
    
    NSArray *CFArray_NS = convertDoubleArrayToNSArray(CFArray, length);
    [result setObject:CFArray_NS forKey:@"cfArray"];
    
    getMPO_NL2(MPO, haType, acArr, acArr, channels, limiting);
    NSArray *MPOArray_NS = convertDoubleArrayToNSArray(MPO, length);
    [result setObject:MPOArray_NS forKey:@"mpo"];

    for (NSNumber *levelNum in levels) {
        int level = [levelNum intValue];
        RealEarAidedGain_NL2(data, acArr, acArr, level, limiting, channels, direction, mic, acArr, numAids);
        NSMutableArray *array = [NSMutableArray array];
        for (int i = 0; i < 19 ; i++) {
            double d = data[i];
            [array addObject:@(d)];
        }
        NSString *levelStr = [NSString stringWithFormat:@"%d", level];
        [result setObject:array forKey:levelStr];
    }
    
    return result;
}

- (NSArray *)getRealEarInsertionGain:(NSArray *)ac bc:(NSArray *)bc L:(int)L limiting:(int)limiting channels:(int)channels direction:(int)direction mic:(int)mic acOther:(NSArray *)acOther noOfAids:(int)noOfAids {
    
    double reig[channels];
    
    size_t length;
    double *acArr = convertNSArrayToDoubleArray(ac, &length);
    double *bcArr = convertNSArrayToDoubleArray(bc, &length);
    double *acOtherArr = convertNSArrayToDoubleArray(acOther, &length);
    
    // 调用NAL2 SDK的RealEarInsertionGain_NL2函数
    RealEarInsertionGain_NL2(reig, acArr, bcArr, L, limiting, channels, direction, mic, acOtherArr, noOfAids);
    
    // 将结果转换为NSArray
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:channels];
    for (int i = 0; i < channels; i++) {
        [result addObject:@(reig[i])];
    }
    
    // 清理动态分配的内存
    delete[] acArr;
    delete[] bcArr;
    delete[] acOtherArr;
    
    return [result copy];
}


extern "C" {
    double* convertNSArrayToDoubleArray(NSArray *array, size_t *outLength) {
        if (!array || array.count == 0) {
            if (outLength) *outLength = 0;
            return nullptr;
        }
        
        size_t length = array.count;
        double *result = new double[length];
        
        for (NSUInteger i = 0; i < length; i++) {
            NSNumber *number = array[i];
            if ([number isKindOfClass:[NSNumber class]]) {
                result[i] = [number doubleValue];
            } else {
                // 处理非NSNumber元素的情况，这里简单设为0
                result[i] = 0.0;
            }
        }
        
        if (outLength) *outLength = length;
        return result;
    }
    
    int* convertNSArrayToIntArray(NSArray *array, size_t *outLength) {
        if (!array || array.count == 0) {
            if (outLength) *outLength = 0;
            return nullptr;
        }
        
        size_t length = array.count;
        int *result = new int[length];
        
        for (NSUInteger i = 0; i < length; i++) {
            NSNumber *number = array[i];
            if ([number isKindOfClass:[NSNumber class]]) {
                result[i] = [number intValue];
            } else {
                // 处理非NSNumber元素，这里简单设为0
                result[i] = 0;
            }
        }
        
        if (outLength) *outLength = length;
        return result;
    }
    
    NSArray* convertDoubleArrayToNSArray(const double *array, size_t length) {
        if (!array || length == 0) {
            return [NSArray array]; // 返回空数组
        }
        
        NSMutableArray *mutableArray = [NSMutableArray arrayWithCapacity:length];
        for (size_t i = 0; i < length; i++) {
            NSNumber *number = [NSNumber numberWithDouble:array[i]];
            [mutableArray addObject:number];
        }
        
        // 返回不可变副本
        return [mutableArray copy];
    }
}

@end
