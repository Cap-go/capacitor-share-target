// Fixture: Cap 9 removed iOS APIs (executable-looking samples for the scanner).
func cap9PositiveIosFixture(bridge: CAPBridgeProtocol, call: CAPPluginCall) {
    _ = getConfigValue("k")
    _ = call.hasOption("k")
    _ = CAPNotifications.didBecomeActive
    _ = getPluginConfigValue("id", "key")
    let _: PluginCallErrorData = [:]
    JSDate.toString(Date())
    _ = getPortablePath(host: "h", uri: "u")
    _ = CAPBridge.statusBarTappedNotification
    _ = CapacitorBridge.httpsInterceptorStartIdentifier
    _ = cordovaConfiguration
    _ = bridge.getWebView()
    _ = bridge.isSimulator()
    _ = bridge.isDevMode()
    _ = bridge.getStatusBarVisible()
    bridge.setStatusBarVisible(true)
    _ = bridge.getStatusBarStyle()
    bridge.setStatusBarStyle(.default)
    bridge.setStatusBarAnimation(.fade)
    _ = bridge.getUserInterfaceStyle()
    _ = bridge.getLocalUrl()
    _ = bridge.getSavedCall("id")
    bridge.releaseCall(callbackId: "id")
    bridge.presentVC(vc, animated: true, completion: nil)
    bridge.dismissVC(animated: true, completion: nil)
    bridge.modulePrint("tag", "msg")
}
