import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapacitorShareTargetPlugin)
public class CapacitorShareTargetPlugin: CAPPlugin, CAPBridgedPlugin {
    private let pluginVersion: String = "8.0.13"
    public let identifier = "CapacitorShareTargetPlugin"
    public let jsName = "CapacitorShareTarget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        super.load()

        // Check if the app was launched from a share extension
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleOpenURL(_:)),
            name: .capacitorOpenURL,
            object: nil
        )

        // Check for shared data on app launch
        checkForSharedContent()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func handleOpenURL(_ notification: Notification) {
        guard let object = notification.object as? [String: Any],
              let url = object["url"] as? URL else {
            return
        }

        // Handle share extension URL scheme
        // Support both "capacitor://share" and custom schemes with "/share" or "://share" paths
        if (url.scheme == "capacitor" && url.host == "share") || url.host == "share" || url.path == "/share" {
            checkForSharedContent()
        }
    }

    private func checkForSharedContent() {
        // Get app group ID from configuration or use placeholder
        let appGroupId = getConfigValue("appGroupId") as? String ?? "group.YOUR_APP_GROUP_ID"
        
        // Warn if placeholder is still being used
        if appGroupId == "group.YOUR_APP_GROUP_ID" {
            CAPLog.print("⚠️ ShareTarget: Using placeholder app group ID. Please configure 'appGroupId' in capacitor.config to receive share events.")
        }
        
        // Get shared content from UserDefaults (set by share extension)
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return
        }
        
        // Try multiple possible keys for compatibility
        // Users may use "share-target-data" or "SharedData"
        let possibleKeys = ["share-target-data", "SharedData"]
        var sharedData: [String: Any]?
        var usedKey: String?
        
        for key in possibleKeys {
            if let data = userDefaults.dictionary(forKey: key) {
                sharedData = data
                usedKey = key
                break
            }
        }
        
        guard let data = sharedData, let key = usedKey else {
            return
        }
        
        // Parse shared data
        var shareEvent: [String: Any] = [:]
        
        // Get title
        shareEvent["title"] = data["title"] as? String ?? ""
        
        // Get texts - handle both array of strings and array of dictionaries
        var texts: [String] = []
        if let sharedTexts = data["texts"] as? [String] {
            texts = sharedTexts
        } else if let sharedTexts = data["texts"] as? [[String: Any]] {
            // Handle case where texts is array of dictionaries with "value" key
            texts = sharedTexts.compactMap { $0["value"] as? String }
        }
        shareEvent["texts"] = texts
        
        // Get files
        var files: [[String: Any]] = []
        if let sharedFiles = data["files"] as? [[String: Any]] {
            files = sharedFiles
        }
        shareEvent["files"] = files
        
        // Clear the shared data
        userDefaults.removeObject(forKey: key)
        userDefaults.synchronize()
        
        // Notify listeners
        notifyListeners("shareReceived", data: shareEvent)
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.pluginVersion])
    }
}
