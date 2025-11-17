//
//  NAL2Manager.h
//  react-native-nal2
//
//  Created by 魏晓堃 on 6/19/25.
//

#import <Foundation/Foundation.h>


NS_ASSUME_NONNULL_BEGIN

@interface NAL2Manager : NSObject

+ (instancetype)sharedManager;

- (NSDictionary *)runNAL2:(int)dateOfBirth
    adultChild:(int)adultChild
     experience:(int)experience
      compSpeed:(int)compSpeed
          tonal:(int)tonal
         gender:(int)gender
       channels:(int)channels
      bandWidth:(int)bandWidth
      selection:(int)selection
           WBCT:(int)WBCT
         haType:(int)haType
      direction:(int)direction
            mic:(int)mic
       noOfAids:(int)noOfAids
             ac:(NSArray *)ac
             bc:(NSArray *)bc
         calcCh:(NSArray *)calcCh
         levels:(NSArray *)levels;

- (NSArray *)getRealEarInsertionGain:(NSArray *)ac
                                  bc:(NSArray *)bc
                                   L:(int)L
                            limiting:(int)limiting
                            channels:(int)channels
                           direction:(int)direction
                                 mic:(int)mic
                             acOther:(NSArray *)acOther
                            noOfAids:(int)noOfAids;

@end

NS_ASSUME_NONNULL_END
