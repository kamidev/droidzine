package comikit.droidzine;

import android.content.Intent;
import android.os.Bundle;

public class DroidZineApp extends DroidScriptActivity
{ 
    @Override
    public void onCreate(Bundle bubble)
    {
        Intent intent = getIntent();
        intent.putExtra("ScriptAsset", "DroidZineApp.js");
        super.onCreate(bubble);
    }
}
