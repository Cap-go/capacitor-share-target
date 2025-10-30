import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Represents a file shared to the application.
 *
 * @since 0.1.0
 */
export interface SharedFile {
  /**
   * The URI of the shared file. On Android/iOS this will be a file path or data URL.
   * On web this will be a cached URL accessible via fetch.
   *
   * @since 0.1.0
   */
  uri: string;

  /**
   * The name of the shared file, with or without extension.
   *
   * @since 0.1.0
   */
  name: string;

  /**
   * The MIME type of the shared file.
   *
   * @since 0.1.0
   */
  mimeType: string;
}

/**
 * Event data received when content is shared to the application.
 *
 * @since 0.1.0
 */
export interface ShareReceivedEvent {
  /**
   * The title of the shared content.
   *
   * @since 0.1.0
   */
  title: string;

  /**
   * Array of text content shared to the application.
   *
   * @since 0.1.0
   */
  texts: string[];

  /**
   * Array of files shared to the application.
   *
   * @since 0.2.0
   */
  files: SharedFile[];
}

/**
 * Capacitor Share Target Plugin interface.
 *
 * This plugin allows your application to receive content shared from other apps.
 * Users can share text, URLs, and files to your app from other applications.
 *
 * @since 0.1.0
 */
export interface CapacitorShareTargetPlugin {
  /**
   * Listen for shareReceived event.
   *
   * Registers a listener that will be called when content is shared to the application
   * from another app. The callback receives event data containing title, texts, and files.
   *
   * @since 0.1.0
   * @param eventName The event name. Must be 'shareReceived'.
   * @param listenerFunc Callback function invoked when content is shared to the app.
   * @returns {Promise<PluginListenerHandle>} A promise that resolves to a listener handle that can be used to remove the listener.
   *
   * @example
   * ```typescript
   * const listener = await CapacitorShareTarget.addListener('shareReceived', (event) => {
   *   console.log('Title:', event.title);
   *   console.log('Texts:', event.texts);
   *   event.files?.forEach(file => {
   *     console.log(`File: ${file.name} (${file.mimeType})`);
   *   });
   * });
   *
   * // To remove the listener:
   * await listener.remove();
   * ```
   */
  addListener(
    eventName: 'shareReceived',
    listenerFunc: (event: ShareReceivedEvent) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Remove all listeners for this plugin.
   *
   * @since 0.1.0
   * @returns {Promise<void>} A promise that resolves when all listeners have been removed.
   *
   * @example
   * ```typescript
   * await CapacitorShareTarget.removeAllListeners();
   * ```
   */
  removeAllListeners(): Promise<void>;

  /**
   * Get the native Capacitor plugin version.
   *
   * Returns the current version of the native plugin implementation.
   *
   * @since 0.1.0
   * @returns {Promise<{ version: string }>} A promise that resolves with an object containing the version string.
   * @throws An error if something went wrong retrieving the version.
   *
   * @example
   * ```typescript
   * const { version} = await CapacitorShareTarget.getPluginVersion();
   * console.log('Plugin version:', version);
   * ```
   */
  getPluginVersion(): Promise<{ version: string }>;
}
