package com.elijanaru.undertheskin;

import android.graphics.Color;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The space behind the status and navigation bars shows the window itself: keep it the app's black.
        getWindow().getDecorView().setBackgroundColor(Color.parseColor("#050605"));
    }
}
