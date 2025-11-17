#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Nal2, NSObject)

RCT_EXTERN_METHOD(processData:(nonnull NSNumber *)dateOfBirth
                  adultChild:(nonnull NSNumber *)adultChild
                  experience:(nonnull NSNumber *)experience
                  compSpeed:(nonnull NSNumber *)compSpeed
                    tonal:(nonnull NSNumber *)tonal
                   gender:(nonnull NSNumber *)gender
                 channels:(nonnull NSNumber *)channels
                 bandWidth:(nonnull NSNumber *)bandWidth
                 selection:(nonnull NSNumber *)selection
                     WBCT:(nonnull NSNumber *)WBCT
                   haType:(nonnull NSNumber *)haType
                 direction:(nonnull NSNumber *)direction
                     mic:(nonnull NSNumber *)mic
                 noOfAids:(nonnull NSNumber *)noOfAids
                       ac:(nonnull NSArray *)ac
                       bc:(nonnull NSArray *)bc
                    calcCh:(nonnull NSArray *)calcCh
                    levels:(nonnull NSArray *)levels
                    resolver:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(realEarInsertionGain:(nonnull NSArray *)ac
                       bc:(nonnull NSArray *)bc
                        L:(nonnull NSNumber *)L
                 limiting:(nonnull NSNumber *)limiting
                 channels:(nonnull NSNumber *)channels
                direction:(nonnull NSNumber *)direction
                      mic:(nonnull NSNumber *)mic
                  acOther:(nonnull NSArray *)acOther
                 noOfAids:(nonnull NSNumber *)noOfAids
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)


+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
