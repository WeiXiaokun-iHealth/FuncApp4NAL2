//
//  AnalysisModule.m
//  HearingAidMobile
//
//  友盟统计模块 - iOS实现
//

#import "AnalysisModule.h"
#import <UMCommon/UMCommon.h>


@implementation AnalysisModule

RCT_EXPORT_MODULE(AnalysisModule);

/**
 * 统计用户账号信息
 */
RCT_EXPORT_METHOD(onProfileSignIn:(NSString *)uid)
{
    NSLog(@"AnalysisModule onProfileSignIn, uid: %@", uid);
    [MobClick profileSignInWithPUID:uid];
}

/**
 * 设置用户属性（用户属性设置一定要在账号统计调用后即userProfileSignIn。）
 * - Parameter value:小于256字节
 * - Parameter key: 小于128字节，允许：英文([a-z;A-Z])、数字(0-9)、下划线 进行定义，使用其中一种或者几种都可以。 不允许：不能以“数字”、"_"开头
 */
RCT_EXPORT_METHOD(userProfile:(NSString *)key value:(id)value)
{
    NSLog(@"AnalysisModule userProfile, key: %@, value: %@", key, value);
    [MobClick userProfile:value to:key];
}

/**
 * 用户退出账号时需要调用
 */
RCT_EXPORT_METHOD(onProfileSignOff)
{
    NSLog(@"AnalysisModule onProfileSignOff");
    [MobClick profileSignOff];
}

/**
 * 统计页面开始
 * 统计页面必须配对调用onPageStart和onPageEnd两个函数来完成自动统计，若只调用某一个函数不会生成有效数据
 */
RCT_EXPORT_METHOD(onPageStart:(NSString *)pageName)
{
    NSLog(@"AnalysisModule onPageStart pageName: %@", pageName);
    [MobClick beginLogPageView:pageName];
}

/**
 * 统计页面结束
 */
RCT_EXPORT_METHOD(onPageEnd:(NSString *)pageName)
{
    NSLog(@"AnalysisModule onPageEnd pageName: %@", pageName);
    [MobClick endLogPageView:pageName];
}

/**
 * 事件统计(免费：100个，专业版500个，尊享版：2000)
 */
RCT_EXPORT_METHOD(onEventObject:(NSString *)eventID map:(NSDictionary *)map)
{
    NSLog(@"AnalysisModule onEventObject eventID: %@", eventID);
    [MobClick event:eventID attributes:map];
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
