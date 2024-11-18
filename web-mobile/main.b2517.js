window.boot = function () {
  var settings = window._CCSettings;
  window._CCSettings = undefined;
  var onProgress = null;
  
  var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
  var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
  var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
  function setLoadingDisplay () {
      // Loading splash scene
      var splash = document.getElementById('splash');
      var progressBar = splash.querySelector('.progress-bar span');
      onProgress = function (finish, total) {
          var percent = 100 * finish / total;
          if (progressBar) {
              progressBar.style.width = percent.toFixed(2) + '%';
          }
      };
      splash.style.display = 'block';
      progressBar.style.width = '0%';

      cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
          splash.style.display = 'none';
      });
  }


   
    /**  ----------------- 渠道配置begin----------------- */
    window.LOG_SWITCH = true
    window.GG_CHANNEL_ID = 2000000
    window.PACKAGE_TAG ="default"  //包标签
    // window.envConf =   { apiUrl: "https://client.rucslot.top",}
    /**  ----------------- 渠道配置end----------------- */


  var onStart = function () {

      cc.view.enableRetina(true);
      cc.view.resizeWithBrowserSize(true);

      if (cc.sys.isBrowser) {
          setLoadingDisplay();
      }

      if (cc.sys.isMobile) {
          if (settings.orientation === 'landscape') {
              cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
          }
          else if (settings.orientation === 'portrait') {
              cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
          }
          cc.view.enableAutoFullScreen([
              cc.sys.BROWSER_TYPE_BAIDU,
              cc.sys.BROWSER_TYPE_BAIDU_APP,
              cc.sys.BROWSER_TYPE_WECHAT,
              cc.sys.BROWSER_TYPE_MOBILE_QQ,
              cc.sys.BROWSER_TYPE_MIUI,
              cc.sys.BROWSER_TYPE_HUAWEI,
              cc.sys.BROWSER_TYPE_UC,
          ].indexOf(cc.sys.browserType) < 0);
      }

      // Limit downloading max concurrent task to 2,
      // more tasks simultaneously may cause performance draw back on some android system / browsers.
      // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
      if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
          cc.assetManager.downloader.maxConcurrency = 2;
          cc.assetManager.downloader.maxRequestsPerFrame = 2;
      }

      var launchScene = settings.launchScene;
      var bundle = cc.assetManager.bundles.find(function (b) {
          return b.getSceneInfo(launchScene);
      });
      
      bundle.loadScene(launchScene, null, onProgress,
          function (err, scene) {
              if (!err) {
                  cc.director.runSceneImmediate(scene);
                  if (cc.sys.isBrowser) {
                      // show canvas
                      var canvas = document.getElementById('GameCanvas');
                      canvas.style.visibility = '';
                      var div = document.getElementById('GameDiv');
                      if (div) {
                          div.style.backgroundImage = '';
                      }
                      console.log('Success to load scene: ' + launchScene);
                  }
              }
          }
      );

  };

  var option = {
      id: 'GameCanvas',
      debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
      showFPS: settings.debug,
      frameRate: 60,
      groupList: settings.groupList,
      collisionMatrix: settings.collisionMatrix,
  };

  cc.assetManager.init({ 
      bundleVers: settings.bundleVers,
      remoteBundles: settings.remoteBundles,
      server: settings.server
  });
  
  var bundleRoot = [INTERNAL];
  settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

  var count = 0;
  function cb (err) {
      if (err) return console.error(err.message, err.stack);
      count++;
      if (count === bundleRoot.length + 1) {
          cc.assetManager.loadBundle(MAIN, function (err) {
              if (!err) cc.game.run(option, onStart);
          });
      }
  }

  cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x;}), cb);

  for (var i = 0; i < bundleRoot.length; i++) {
      cc.assetManager.loadBundle(bundleRoot[i], cb);
  }
};

if (window.jsb) {
  var isRuntime = (typeof loadRuntime === 'function');
  if (isRuntime) {
      require('src/settings.30a82.js');
      require('src/cocos2d-runtime.js');
      if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
          require('src/physics.js');
      }
      require('jsb-adapter/engine/index.js');
  }
  else {
      require('src/settings.30a82.js');
      require('src/cocos2d-jsb.js');
      if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
          require('src/physics.js');
      }
      require('jsb-adapter/jsb-engine.js');
  }

  cc.macro.CLEANUP_IMAGE_CACHE = true;
  window.boot();
}


//telegram登录
window.CallWithTelegramLogin = function (callback) {
  
  window["Telegram"].Login.auth({ bot_id: '6633645126', request_access: 'write', embed: 1 }, (data) => {
    if (!data) {
      console.warn("tg login failed")
      return
    }

    const userId = data.id
    callback?.(userId)
    
    JSBridgeMgr.telegramLoginCallBack("login_success", userId, "");
})
}

//vkid登录
window.CallWithVKIDLogin = function() {


  if ('VKIDSDK' in window) {
    const VKID = window.VKIDSDK;

    VKID.Config.init({
      app: 52591725,
      redirectUrl: 'https://client.rucslot.top', //这里修改成当前地址
      responseMode: VKID.ConfigResponseMode.Callback,
      source: VKID.ConfigSource.LOWCODE,
    });

  }

  const VKID = window.VKIDSDK;

  const floatingOneTap = new VKID.FloatingOneTap();

  floatingOneTap.render({
    appName: 'slots',
    showAlternativeLogin: true
  })
  .on(VKID.WidgetEvents.ERROR, vkidOnError)
  .on(VKID.FloatingOneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
    const code = payload.code;
    const deviceId = payload.device_id;

    VKID.Auth.exchangeCode(code, deviceId)
      .then(vkidOnSuccess)
      .catch(vkidOnError);
  });

  function vkidOnSuccess(data) {
    floatingOneTap.close();
    console.warn("xxxxxxxxxx success:",data)
    const userId = data.user_id
    console.warn("xxxxxxxxxx success:",data)
    JSBridgeMgr.vkLoginCallBack("login_success", userId, "");
    // Обработка полученного результата
  }

  function vkidOnError(error) {
    // Обработка ошибки
    console.warn("xxxxxxxxxx error:",data)
  }

  // const floatingOneTap = new VKID.FloatingOneTap();
  //   floatingOneTap.render({
  //     appName: 'Royal Games',
  //   });

}

// vkid登录成功，重定向携带code, device_id，loadscene时获取再调用此函数获取用户id
window.CallWithVKIDGetUserInfo = function(code, device_id, callback) {

  VKID.Auth.exchangeCode(code, device_id).then( (data) => {
      console.warn("exchange code recevice:", data)

      if(data) {
        const userId = data.user_id
        callback?.()
        JSBridgeMgr.vkLoginCallBack("login_success", userId, "");
      }

    //   "refresh_token": "vk2.a.K_oOE8ydv-kRH4x0XHArZcZa6hu4CaDROkHuoytk91E2xpuDNdR3CcxvrwhMr8AHckAAqsYC-0CfkQmduWVewkf_rbRBBFnOJg3B2bGpT4GgZyjsbMCEuUh_KAaNJtk4Pu_YmVI-Ex0uTQkgXFDzdTP4B8NVrGGOn8A7kglAa_vi5e9kjf5ozxxXY9NNNKyMbtctqoAmBP9v9HH_a2Es4hNokaJ_JDTmz5S6fAvq2xM",
    // "access_token": "vk2.a.shrlxpQQHaTNPTtyXsf8VlIAfU9MQnbcs96_As1PczCZZnI-ye7vLhI5bIwsQH_dAmkRYdhcIWlpLIhlz80E2n7DUDnWu7B0n5KAQE_hWC1htrbAW77EtM_s5WSlJ65tvyfC_WO54N-emv4Hpg5lTHIohwnAy_ortHEpgxdzSGouy0XQTORxzAeVikldv7Bm5jVw4F7yHMcOICRD6rV0dCsfUmM3TnocpOGh_F2dSjpoiTvWcJGA2-c30j0vDeF7",
    // "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpaXMiOiJWSyIsInN1YiI6ODgwNTQ1MDYyLCJhcHAiOjUyNTkxNzI1LCJleHAiOjE3NjE0NTk1NTgsImlhdCI6MTczMDM1NTU1OCwianRpIjoyMX0.X40X6-YVr-nM5HeuVzO56ZHgisWuhL7jISmzLC6vyq8WG0100U3zrmrfdAxSjZan4baQQDWEFyl4jFKLmxTZ3dPpY6fWgAAxr0V1ysWIhy7gGlAGx7tb5t7JceX5Q29bOvH1ldsVVqz5bULUu9LDXBwoy6IH86mLG48EO4VEZ1ueB8t-MoWQwJru4pXLVwgu5Lv9EgJbzp7qBNuOl5f2nf0QqBTsnDU_N6TG10Ryfj6DFGu64y0SNUhCG4U-NZrjmRF9AOGQ4-EtkU_STjUpTYkYD1ZDtT0FWG_U-nNp7P73HXcIfsTJbbcWdNvRoWL7aZnwkqcVCeuiW4YSFff7F68LideNq8-OzqCvbsN5my7iTT_M2jRP1dYVQmXRbqPzJgL9pgd_nGHTuFwVf4ccnyo_BH4BF_cjVA5klJJH7_CfhTPrczdMDb7EEePTN-i8asWq_pm46K8ovKTs9ch8EuXnSsL_l81MS0LI5sL7hTelcIGK4zc1-emT9RUoE2NqMon5GVIiQLC_PED8OPDfR8l2jLE4MMDrJxXS_acbUxKA70W9FX4Bnwha1oQjd47mFHV4zcI5Mzh1lwu4-F48eWnIezHbGo70nOtzEgyf9fkaw7oY7XAkFOUStGBXd5CHwZLopolGCkTlmclkFn-_bWJ4m312FWmwJpzvau6bAOY",
    // "token_type": "Bearer",
    // "expires_in": 3600,
    // "user_id": 880545062,
    // "state": "rUQ9bMDpXS9xAjbCQwlwOPfcMcZRMv2pijY5TXEjH03Gzt4I",
    // "scope": "vkid.personal_info"

      // VKID.Auth.userInfo(data.access_token).then((user) => {
      //   console.warn("user info:",user)
      // })
    })
}


  window.CallWithGoogleLogin = function() {

    const loginCallback = function(data) {

      console.warn("data:", JSON.stringify(data))
      var base64Url = data.credential.split('.')[1];
      var base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
      console.log(JSON.parse(window.atob(base64)));
      const profile = JSON.parse(window.atob(base64))
      const name = profile.name
      const id = profile.sub
      console.warn(`id:${id}, name:${name}`)

      JSBridgeMgr.googleLoginCallBack("login_success", data.credential, id, name);

      console.warn("login callback", JSON.stringify(data))
    }

    
    google.accounts.id.initialize({
      client_id: '429076104897-dmfcrf7tko8th73o0mlf4uhcaer1602u.apps.googleusercontent.com',
      // client_id: '260846013237-0o0j4hbtiu0tthsg2ca58s8svno4p4i7.apps.googleusercontent.com',
      callback: loginCallback
    });

    google.accounts.id.prompt((notification) => {

       const reason = notification.getNotDisplayedReason()
        console.warn("reason:", reason)
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn("isNotDisplayed:", notification.isNotDisplayed())
          console.warn("isSkippedMoment:", notification.isSkippedMoment())
        }
    });

  };

  // var FbIsInit = false;
  // var FbFirst = false;
  // var accessToken = null;
  // function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
  //   FbIsInit = true;
  //   console.log('statusChangeCallback');
  //   console.log(response);                   // The current login status of the person.
  //   if (response.status === 'connected') {   // Logged into your webpage and Facebook.
  //     accessToken = response.authResponse.accessToken;
  //     window.JSBridgeMgr&&window.JSBridgeMgr.loginCallBack("login_success",accessToken,"","145817531469753");
  //   } else {                                 // Not logged into your webpage or we are unable to tell.
  //     //document.getElementById('status').innerHTML = 'Please log ' +
  //     //  'into this webpage.';
  //   if(FbFirst)facebookLogin();
  //   else window.JSBridgeMgr&&window.JSBridgeMgr.loginCallBack("login_fail",null,"","145817531469753");
  //   FbFirst = false;
  //   }
  // }


  // // function checkLoginState() {               // Called when a person is finished with the Login Button.
  // //   FB.getLoginStatus(function(response) {   // See the onlogin handler
  // //     statusChangeCallback(response);
  // //   });
  // // }

  // // window.facebookLogin = function(){
  // //   console.log("facebookLogin >>>>>>>>>>>>>>>>>>>>>>>");
  // //   if(accessToken)window.JSBridgeMgr&&window.JSBridgeMgr.loginCallBack("login_success",accessToken,"","145817531469753");
  // //   else{
  // //     if(FbIsInit)FB.login(checkLoginState);
  // //     else {
  // //       FbFirst = true;
  // //       fbAsyncInit();
  // //     }
  // //   }
  // // };
  
  // // window.facebookLogout = function(){
  // //   console.log("facebookLogout >>>>>> ");
  // //   FB.logout(function(response) {
  // //     console.log("facebookLogout success >>>>>> ");
  // //     // user is now logged out
  // //     accessToken = null;
  // //   });
  // // }

  // //   window.fbAsyncInit = function() {
  // // //console.log("fbAsyncInit >>>>>>>>>>>>>>>>>>>>>>>");
  // //   FB.init({
  // //     appId      : '145817531469753',
  // //     cookie     : true,                     // Enable cookies to allow the server to access the session.
  // //     xfbml      : true,                     // Parse social plugins on this webpage.
  // //     version    : 'v8.0'           // Use this Graph API version for this call.
  // //   });

  
  // //   FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
  // //     statusChangeCallback(response);        // Returns the login status.
  // //   });
  // };
  