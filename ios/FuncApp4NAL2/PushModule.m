//
//  PushModule.m
//  HearingAidMobile
//
//  友盟推送模块 - iOS实现
//

#import "PushModule.h"
#import <UMPush/UMessage.h>
#import "AppDelegate.h"

@implementation PushModule

RCT_EXPORT_MODULE(PushModule);

/**
 * 通过SDK接口获取deviceToken
 */
RCT_EXPORT_METHOD(getPushDeviceToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"PushModule getPushDeviceToken");
    
    // 从AppDelegate获取保存的deviceToken
    AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSString *deviceToken = appDelegate.deviceTokenString;
    
    if (deviceToken && deviceToken.length > 0) {
        NSLog(@"获取到deviceToken: %@", deviceToken);
        resolve(deviceToken);
    } else {
        NSLog(@"deviceToken未获取到，返回空字符串");
        resolve(@"");
    }
}

#pragma mark - 请求通知
RCT_EXPORT_METHOD(requestUMAuthorizationWithSuccess:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [AppDelegate requestUMAuthorizationWithSuccess:^(BOOL result) {
      resolve(@(result));
    } fail:^(NSError *error) {
      reject(@"request_failed", @"Request for notification permission failed", error);
    }];
  });
  
}

// 在主线程执行，避免UI线程警告
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
