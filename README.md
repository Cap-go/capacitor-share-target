# @capgo/capacitor-share-target

Capacitor plugin to receive shared content from other apps.

## Install

```bash
npm install @capgo/capacitor-share-target
npx cap sync
```

## Configuration

### Android

Add the following to your `AndroidManifest.xml` inside the `<activity>` tag to allow your app to receive shared content:

```xml
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/*" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="image/*" />
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.SEND_MULTIPLE" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="image/*" />
</intent-filter>
```

You can customize the `mimeType` to match the types of content you want to receive (e.g., `text/*`, `image/*`, `video/*`, `*/*`).

### iOS

For iOS, you need to create a Share Extension to receive shared content. This requires additional setup:

1. In Xcode, go to File > New > Target
2. Select "Share Extension" and click Next
3. Name it (e.g., "ShareExtension") and click Finish
4. Configure the Share Extension to save data to a shared App Group
5. Update the `YOUR_APP_GROUP_ID` in the iOS plugin code

For detailed instructions, see the [iOS Share Extension documentation](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller).

## Usage

```typescript
import { CapacitorShareTarget } from '@capgo/capacitor-share-target';

// Listen for shared content
CapacitorShareTarget.addListener('shareReceived', (event) => {
  console.log('Title:', event.title);
  console.log('Texts:', event.texts);

  event.files?.forEach(file => {
    console.log(`File: ${file.name}`);
    console.log(`Type: ${file.mimeType}`);
    console.log(`URI: ${file.uri}`);
  });
});
```

## API

<docgen-index>

* [`addListener('shareReceived', ...)`](#addlistenersharereceived-)
* [`removeAllListeners()`](#removealllisteners)
* [`getPluginVersion()`](#getpluginversion)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Capacitor Share Target Plugin interface.

This plugin allows your application to receive content shared from other apps.
Users can share text, URLs, and files to your app from other applications.

### addListener('shareReceived', ...)

```typescript
addListener(eventName: 'shareReceived', listenerFunc: (event: ShareReceivedEvent) => void) => Promise<PluginListenerHandle>
```

Listen for shareReceived event.

Registers a listener that will be called when content is shared to the application
from another app. The callback receives event data containing title, texts, and files.

| Param              | Type                                                                                  | Description                                                  |
| ------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **`eventName`**    | <code>'shareReceived'</code>                                                          | The event name. Must be 'shareReceived'.                     |
| **`listenerFunc`** | <code>(event: <a href="#sharereceivedevent">ShareReceivedEvent</a>) =&gt; void</code> | Callback function invoked when content is shared to the app. |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 0.1.0

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

Remove all listeners for this plugin.

**Since:** 0.1.0

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the native Capacitor plugin version.

Returns the current version of the native plugin implementation.

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

**Since:** 0.1.0

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### ShareReceivedEvent

Event data received when content is shared to the application.

| Prop        | Type                      | Description                                      | Since |
| ----------- | ------------------------- | ------------------------------------------------ | ----- |
| **`title`** | <code>string</code>       | The title of the shared content.                 | 0.1.0 |
| **`texts`** | <code>string[]</code>     | Array of text content shared to the application. | 0.1.0 |
| **`files`** | <code>SharedFile[]</code> | Array of files shared to the application.        | 0.2.0 |


#### SharedFile

Represents a file shared to the application.

| Prop           | Type                | Description                                                                                                                             | Since |
| -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`uri`**      | <code>string</code> | The URI of the shared file. On Android/iOS this will be a file path or data URL. On web this will be a cached URL accessible via fetch. | 0.1.0 |
| **`name`**     | <code>string</code> | The name of the shared file, with or without extension.                                                                                 | 0.1.0 |
| **`mimeType`** | <code>string</code> | The MIME type of the shared file.                                                                                                       | 0.1.0 |

</docgen-api>

## Example

Here's a complete example of handling shared content in your app:

```typescript
import { CapacitorShareTarget } from '@capgo/capacitor-share-target';
import { Capacitor } from '@capacitor/core';

export class ShareService {
  async initialize() {
    // Only add listener on native platforms
    if (Capacitor.isNativePlatform()) {
      await CapacitorShareTarget.addListener('shareReceived', this.handleSharedContent);
    }
  }

  private handleSharedContent(event: ShareReceivedEvent) {
    console.log('Received shared content!');

    // Handle shared text
    if (event.texts.length > 0) {
      console.log('Shared text:', event.texts[0]);
      // Process the shared text (e.g., URL, note, etc.)
    }

    // Handle shared files
    if (event.files.length > 0) {
      event.files.forEach(async (file) => {
        console.log(`Processing file: ${file.name}`);

        if (file.mimeType.startsWith('image/')) {
          // Handle image files
          await this.processImage(file.uri);
        } else if (file.mimeType.startsWith('video/')) {
          // Handle video files
          await this.processVideo(file.uri);
        }
      });
    }
  }

  private async processImage(uri: string) {
    // Your image processing logic here
  }

  private async processVideo(uri: string) {
    // Your video processing logic here
  }

  async cleanup() {
    await CapacitorShareTarget.removeAllListeners();
  }
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
