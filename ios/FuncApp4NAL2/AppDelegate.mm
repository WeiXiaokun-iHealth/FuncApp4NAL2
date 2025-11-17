#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UMCommon/UMCommon.h>
#import <UMCommonLog/UMCommonLogHeaders.h>
#import <UMPush/UMPush.h>
#include<arpa/inet.h>
@interface AppDelegate()<UNUserNotificationCenterDelegate>
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  // 推送相关
  [self setupUMInfoWithOptions:launchOptions];
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

#pragma mark - 配置友盟信息
- (void)setupUMInfoWithOptions:(NSDictionary *)launchOptions{
  //友盟SDK相关
  [UMConfigure initWithAppkey:@"690d83cafcbc362934161207" channel:@"iHealth"];
  [UMCommonLogManager setUpUMCommonLogManager];
  [UMConfigure setLogEnabled:YES];
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  
  
//  [UMCommonLogManager setUpUMCommonLogManager];
//  [UMConfigure setLogEnabled:TRUE];
//  [UMConfigure initWithAppkey:@"690d83cafcbc362934161207" channel:@"iHealth"];
//  //设置为自动采集页面
//  [MobClick setAutoPageEnabled:FALSE];
}

+ (void)requestUMAuthorizationWithSuccess:(void (^)(BOOL result))successBlock fail:(void (^)(NSError *error))failBlock{
  NSLog(@"requestUMAuthorizationWithSuccess执行了");
  // Push组件基本功能配置
  UMessageRegisterEntity * entity = [[UMessageRegisterEntity alloc] init];
  entity.types = UMessageAuthorizationOptionBadge|UMessageAuthorizationOptionSound|UMessageAuthorizationOptionAlert;
  [UNUserNotificationCenter currentNotificationCenter].delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
  [UMessage registerForRemoteNotificationsWithLaunchOptions:nil Entity:entity completionHandler:^(BOOL granted, NSError * _Nullable error) {
    
      dispatch_async(dispatch_get_main_queue(), ^{
        if (granted) {
          successBlock(granted);
        }else{
          failBlock(error);
        }
      });
  }];
}

#pragma mark - 设置 token
// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  if(![deviceToken isKindOfClass:[NSData class]])return;
      
  const unsigned *tokenBytes =(const unsigned*)[deviceToken bytes];
      
  NSString*hexToken =[NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                            ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                            ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                            ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
  NSLog(@"推送相关，获取到的deviceToken:%@",hexToken);
  
  // 保存deviceToken供RN桥接使用
  self.deviceTokenString = hexToken;
  
//  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

#pragma mark - App在前台收到通知时触发
-(void)userNotificationCenter:(UNUserNotificationCenter*)center willPresentNotification:(UNNotification*)notification withCompletionHandler:(void(^)(UNNotificationPresentationOptions))completionHandler{
  
  
  NSDictionary* userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]){
    [UMessage setAutoAlert:NO];
    //必须加这句代码
    [UMessage didReceiveRemoteNotification:userInfo];
    // 处理消息数据
    [self handleRemotePushNotification:userInfo];
    
  }else{
    //应用处于前台时的本地推送接受
    UNNotificationContent *content = notification.request.content;
    NSNumber *reminderType = content.userInfo[@"reminderType"];
    BOOL isDisturb = [content.userInfo[@"isDisturb"] boolValue];
    NSString *notiType = content.userInfo[@"notiType"];
    
    
    
    NSLog(@"NotificationContent: userInfo=%@, badge=%@", content.userInfo, content.badge);
    
  }
  completionHandler(UNNotificationPresentationOptionSound|UNNotificationPresentationOptionBadge|UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner);
  
}

#pragma mark - 点击通知时触发
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  
  NSDictionary* userInfo = response.notification.request.content.userInfo;
  UNNotificationContent *content = response.notification.request.content;
  NSLog(@"Select notificationContent: userInfo=%@, badge=%@", userInfo, content.badge);
  
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]){
    //必须加这句代码
    [UMessage didReceiveRemoteNotification:userInfo];
    // 处理消息数据
    [self handleRemotePushNotification:userInfo];

  }else{
    //应用处于后台时的本地推送接受
  }
  
}

#pragma mark - 远程推送消息处理
- (void)handleRemotePushNotification:(NSDictionary *)payload {
  NSLog(@"远程推送消息: %@", payload);
  
  NSString *msgType = payload[@"message_type"];
  NSString *nickname = payload[@"nickname"];
  NSNumber *idNum = payload[@"id"];
  // body
  NSString *bodyStr = @"";
  NSDictionary *aps = payload[@"aps"];
  if ([aps isKindOfClass:NSDictionary.class]) {
    NSDictionary *alert = aps[@"alert"];
    if ([alert isKindOfClass:NSDictionary.class]) {
      NSString *body = alert[@"body"];
      if (body) {
        bodyStr = body;
      }
    }
  }
  
  NSMutableDictionary *params = [NSMutableDictionary dictionary];
  if ([msgType isEqualToString:@"invite"]) { // 亲友邀请
    params[@"type"] = @(1);
    params[@"nickname"] = nickname;
    params[@"id"] = idNum;
  }
  else {
    params[@"type"] = @(99);
    params[@"content"] = bodyStr;
  }
  if (params.allKeys.count > 0) {
    NSLog(@"发送RN参数: %@", params);
//    [NSNotificationCenter.defaultCenter postNotificationName:kNotiName_Event_Notification object:nil userInfo:params];
  }
}

@end
