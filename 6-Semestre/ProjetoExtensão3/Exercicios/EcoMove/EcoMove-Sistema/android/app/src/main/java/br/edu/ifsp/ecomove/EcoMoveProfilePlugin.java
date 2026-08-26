package br.edu.ifsp.ecomove;

import android.content.SharedPreferences;
import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EcoMoveProfile")
public class EcoMoveProfilePlugin extends Plugin {
    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("ecomove_local_profile", Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void get(PluginCall call) {
        String key = call.getString("key");
        JSObject result = new JSObject();
        result.put("value", key == null ? null : preferences().getString(key, null));
        call.resolve(result);
    }

    @PluginMethod
    public void set(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        if (key == null || value == null) { call.reject("Key and value are required."); return; }
        preferences().edit().putString(key, value).apply();
        call.resolve();
    }
}
