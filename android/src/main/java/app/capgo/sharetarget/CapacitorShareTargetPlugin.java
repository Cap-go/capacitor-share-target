package app.capgo.sharetarget;

import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Log;
import android.webkit.MimeTypeMap;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;

@CapacitorPlugin(name = "CapacitorShareTarget")
public class CapacitorShareTargetPlugin extends Plugin {

    private static final String TAG = "CapacitorShareTarget";
    private static final String PLUGIN_VERSION = "7.0.0";

    @Override
    public void load() {
        super.load();
        handleIntent(getActivity().getIntent());
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) || Intent.ACTION_SEND_MULTIPLE.equals(action)) {
            try {
                JSObject shareData = new JSObject();

                // Get title
                String title = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                if (title == null) {
                    title = intent.getStringExtra(Intent.EXTRA_TITLE);
                }
                shareData.put("title", title != null ? title : "");

                // Get texts
                JSArray texts = new JSArray();
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (sharedText != null) {
                    texts.put(sharedText);
                }
                shareData.put("texts", texts);

                // Get files
                JSArray files = new JSArray();
                if (Intent.ACTION_SEND.equals(action)) {
                    Uri fileUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                    if (fileUri != null) {
                        JSObject fileData = getFileData(fileUri);
                        if (fileData != null) {
                            files.put(fileData);
                        }
                    }
                } else if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
                    ArrayList<Uri> fileUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                    if (fileUris != null) {
                        for (Uri fileUri : fileUris) {
                            JSObject fileData = getFileData(fileUri);
                            if (fileData != null) {
                                files.put(fileData);
                            }
                        }
                    }
                }
                shareData.put("files", files);

                // Notify listeners
                notifyListeners("shareReceived", shareData);
                Log.d(TAG, "Share received: " + shareData.toString());
            } catch (Exception e) {
                Log.e(TAG, "Error handling shared content", e);
            }
        }
    }

    private JSObject getFileData(Uri uri) {
        try {
            JSObject fileData = new JSObject();

            // Get file name
            String fileName = getFileName(uri);
            fileData.put("name", fileName != null ? fileName : "unknown");

            // Get MIME type
            String mimeType = getActivity().getContentResolver().getType(uri);
            if (mimeType == null) {
                mimeType = getMimeTypeFromFileName(fileName);
            }
            fileData.put("mimeType", mimeType != null ? mimeType : "application/octet-stream");

            // Copy file to cache and get path
            String filePath = copyFileToCache(uri, fileName);
            fileData.put("uri", filePath != null ? filePath : uri.toString());

            return fileData;
        } catch (Exception e) {
            Log.e(TAG, "Error getting file data for URI: " + uri, e);
            return null;
        }
    }

    private String getFileName(Uri uri) {
        String fileName = null;
        String scheme = uri.getScheme();

        if ("content".equals(scheme)) {
            try (Cursor cursor = getActivity().getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex != -1) {
                        fileName = cursor.getString(nameIndex);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting file name from cursor", e);
            }
        } else if ("file".equals(scheme)) {
            fileName = new File(uri.getPath()).getName();
        }

        return fileName;
    }

    private String getMimeTypeFromFileName(String fileName) {
        if (fileName == null) {
            return null;
        }

        String extension = "";
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0) {
            extension = fileName.substring(lastDot + 1);
        }

        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase());
    }

    private String copyFileToCache(Uri uri, String fileName) {
        try {
            File cacheDir = new File(getContext().getCacheDir(), "shared_files");
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }

            if (fileName == null) {
                fileName = "shared_file_" + System.currentTimeMillis();
            }

            File outputFile = new File(cacheDir, fileName);

            try (
                InputStream inputStream = getActivity().getContentResolver().openInputStream(uri);
                FileOutputStream outputStream = new FileOutputStream(outputFile)
            ) {
                if (inputStream == null) {
                    return null;
                }

                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }

            return outputFile.getAbsolutePath();
        } catch (Exception e) {
            Log.e(TAG, "Error copying file to cache", e);
            return null;
        }
    }

    @PluginMethod
    public void getPluginVersion(PluginCall call) {
        try {
            JSObject ret = new JSObject();
            ret.put("version", PLUGIN_VERSION);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not get plugin version", e);
        }
    }
}
