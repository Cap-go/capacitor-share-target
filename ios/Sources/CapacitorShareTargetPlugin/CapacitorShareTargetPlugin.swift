import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(CapacitorShareTargetPlugin)
public class CapacitorShareTargetPlugin: CAPPlugin, CAPBridgedPlugin {
    private let pluginVersion: String = "7.0.2"
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
        if url.scheme == "capacitor" && url.host == "share" {
            checkForSharedContent()
        }
    }

    private func checkForSharedContent() {
        // Get shared content from UserDefaults (set by share extension)
        if let userDefaults = UserDefaults(suiteName: "group.YOUR_APP_GROUP_ID") {
            if let sharedData = userDefaults.dictionary(forKey: "SharedData") {
                var shareEvent: [String: Any] = [:]

                // Get title
                shareEvent["title"] = sharedData["title"] as? String ?? ""

                // Get texts
                var texts: [String] = []
                if let sharedTexts = sharedData["texts"] as? [String] {
                    texts = sharedTexts
                }
                shareEvent["texts"] = texts

                // Get files
                var files: [[String: Any]] = []
                if let sharedFiles = sharedData["files"] as? [[String: Any]] {
                    files = sharedFiles
                }
                shareEvent["files"] = files

                // Clear the shared data
                userDefaults.removeObject(forKey: "SharedData")
                userDefaults.synchronize()

                // Notify listeners
                notifyListeners("shareReceived", data: shareEvent)
            }
        }
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.pluginVersion])
    }
}
