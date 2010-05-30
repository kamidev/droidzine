Activity.evalAssetFile("DroidZineDSL.js");

var Intent = Packages.android.content.Intent;
var WindowManager = Packages.android.view.WindowManager;
var Window = Packages.android.view.Window;
var ActivityInfo = Packages.android.content.pm.ActivityInfo;
var Log = Packages.android.util.Log;
var Menu = Packages.android.view.Menu;
var Toast = Packages.android.widget.Toast;
var AlertDialog = Packages.android.app.AlertDialog;
var ArrayAdapter = Packages.android.widget.ArrayAdapter;
var Intent = Packages.android.content.Intent;
var DroidScriptIO = Packages.comikit.droidzine.DroidScriptIO;
var ListView = Packages.android.widget.ListView;
var EditText = Packages.android.widget.EditText;
var TextView = Packages.android.widget.TextView;
var Typeface = Packages.android.graphics.Typeface;
var Color = Packages.android.graphics.Color;
var lang = Packages.java.lang;
var android = Packages.android;
var ProgressDialog = Packages.android.app.ProgressDialog;
var Thread = Packages.java.lang.Thread;
var Button = Packages.android.widget.Button;
var Vibrator = Packages.android.os.Vibrator;

var DEFAULT_FANZINE = "http://www.droidzine.org/issue1/comics/urls.txt"
var DEFAULT_FANZINE_TITLE = "Droidzine issue 1" 
var ANOTHER_FANZINE = "http://www.droidzine.org/issue1/comics/urls2.txt"
var ANOTHER_FANZINE_TITLE = "Droidzine issue 1 (short version)" 

function onCreate(bundle)
{
        Log.i("***Opening progress dialog", "");           
        var progress = ProgressDialog.show(Activity, "DroidZine issue 1", "Getting comics...");
        new Thread(function() {
            var fanzine = getFanzine(DEFAULT_FANZINE);  
            var listView = createListView(fanzine);
            Activity.runOnUiThread(function() {   
                  Activity.setContentView(listView);
                  // Close progress dialog
                  Log.i("***CLosing progress dialog", "");
                  progress.dismiss();
             });
        }).start();  
}

function getFanzine(url)
{
    // Get list of comics
    var urlList = DroidScriptIO.create().readStringFromFileOrUrl(url);
    var urls = urlList.split("\n");
    var comicsList = lang.reflect.Array.newInstance(lang.String, urls.length);
    
    // Get individual comics
    var urlList = [];
    for (var i = 0; i < urls.length; ++i) 
    {
        Log.i("***Reading", urls[i]);
        var script = stripDroidZineTags(
            DroidScriptIO.create().readStringFromFileOrUrl(urls[i]));
        Log.i("***DSLScript", script);
        var thePage = Activity.eval(script);
        comicsList[i] = thePage.title + " by " + thePage.author;
        urlList.push(urls[i]);
    }
    
    return { urlList : urlList, comicsList : comicsList };
}

// List to hold the items in the listview.
// First item is a graphic image presenting the program.
function createListView(fanzine)
{
    var listView = new ListView(Activity);
    
    listView.setAdapter(createListViewArrayAdapter(
       fanzine.comicsList,
       function(position, convertView) {
           var view = convertView;
           if (null == convertView) {
               view = new TextView(Activity);
               view.hapticFeedbackEnabled = true;
               view.setPadding(25, 15, 25, 15);
               var font = Typeface.create(
                   Typeface.SANS_SERIF,
                   Typeface.BOLD);
               view.setTypeface(font);
               view.setTextSize(20);
               if (position % 2 == 0)
               {
                   view.setBackgroundColor(Color.rgb(255, 150, 150));
               }
               else
               {
                   view.setBackgroundColor(Color.rgb(255, 100, 100));
               }
               view.setTextColor(Color.rgb(255, 255, 255));
               // It is also possible to put actions on list items
               //view.setOnClickListener(function () {
               //    view.setText("You Clicked Me!"); })
           }
           view.setText(fanzine.comicsList[position]);
           return view; 
       }));
       
      listView.setOnItemClickListener(function(parent, view, position, id) {
        var intent = new Intent();
        var vibrator = new Vibrator();
        intent.setClassName(Activity, "comikit.droidzine.DroidScriptActivity");
        intent.putExtra("ScriptAsset", "DroidZineView.js");
        intent.putExtra("Url", fanzine.urlList[position]);
        Log.i("***Opening progress dialog", "");           
        var progress = ProgressDialog.show(Activity, fanzine.comicsList[position], "Opening comic...");
        vibrator.vibrate(50);      
        new Thread(function() {
        Activity.runOnUiThread(function() {   
            Activity.startActivity(intent);
            // Close progress dialog
                  Log.i("***CLosing progress dialog", "");
                  progress.dismiss();
             });
        }).start();  
    });
    
    return listView;
}

function stripDroidZineTags(data)
{
    var beginTag = "DROIDZINE_BEGIN";
    var endTag = "DROIDZINE_END";
    var beginIndex = data.indexOf(beginTag);
    var endIndex = data.indexOf(endTag);
    
    if (beginIndex > -1 && endIndex > -1) 
    {
        return data.substring(beginIndex + beginTag.length, endIndex);
    }
}

function onCreateOptionsMenu(menu)
{
    // We create the menu dynamically instead!
    return true;
}

function onPrepareOptionsMenu(menu)
{
    OptionsMenuItems = 
        [["Open Fanzine", function() { openFanzine(); }],
         ["About", function() { showToast(
             "DroidZine App by Jonas Beckman & Mikael Kindborg, GTUG Hackathon Stockholm May 1, 2010"); }]
        ];
    menu.clear();
    menuAddItems(menu, OptionsMenuItems);
    
    return true;
}

function onOptionsItemSelected(item)
{
    menuDispatch(item, OptionsMenuItems);
    return true;
}

function menuAddItems(menu, items)
{
    for (var i = 0; i < items.length; ++i)
    {
        menu.add(Menu.NONE, Menu.FIRST + i, Menu.NONE, items[i][0]);
    }
}

function menuDispatch(item, items)
{
    var i = item.getItemId() - Menu.FIRST;
    items[i][1]();;
}

function showToast(message)
{
    Toast.makeText(
        Activity,
        message,
        Toast.LENGTH_SHORT).show();
}

function openFanzine()
{
    var input = new EditText(Activity);
    input.setText(ANOTHER_FANZINE); //Default to short version of current fanzine
    
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle("Get another fanzine");
    dialog.setMessage("Enter URL");
    dialog.setView(input);
    dialog.setPositiveButton("Open", function() {
        var fanzineUrl = input.getText().toString();
        
        Log.i("***Opening progress dialog", "");           
        var progress = ProgressDialog.show(Activity, "New Fanzine", "Loading comics...");
        new Thread(function() {
            var fanzine = getFanzine(fanzineUrl);
            
            Activity.runOnUiThread(function() {
                var listView = createListView(fanzine); 
                Activity.setContentView(listView);
                
                Log.i("***CLosing progress dialog", "");
                // Close progress dialog
                progress.dismiss();
            });
        }).start();
    });
    dialog.setNegativeButton("Cancel", function() {
    });
    dialog.show();
}

//Creates a custom ListAdapter
//items - a JavaScript array
//viewFun - a function called to handle the creation
//of views for the elements in the list
function createListViewArrayAdapter(items, viewFun)
{
    var Boolean = Packages.java.lang.Boolean;
    var Integer = Packages.java.lang.Integer;
    var Long = Packages.java.lang.Long;
    var observer;
    
    var handler = {
       areAllItemsEnabled: function() {
           return Boolean.TRUE; },
       isEnabled: function(position) {
           return Boolean.TRUE; },
       getCount: function() {
           return Integer.valueOf(items.length); },
       getItem: function(position) {
           return items[position]; },
       getItemId: function(position) {
           return Long.valueOf(position); },
       getItemViewType: function(position) {
           return Integer.valueOf(0); },
       getView: function(position, convertView, parent) {
           return viewFun(position, convertView); },
       getViewTypeCount: function(position) {
           return Integer.valueOf(1); },
       hasStableIds: function(position) {
           return Boolean.TRUE; },
       isEmpty : function(position) {
           return 0 == items.length; },
       // We can only have one observer!
       registerDataSetObserver : function(theObserver) {
           observer = theObserver; },
       unregisterDataSetObserver : function(theObserver) {
           observer = null; },
    };
    
    return createInstance(Packages.android.widget.ListAdapter, handler);
}

//Helper functions

function createInstance(javaInterface, object)
{
    var Class = Packages.java.lang.Class;
    var ClassLoader = Packages.java.lang.ClassLoader;
    var Array = Packages.java.lang.reflect.Array;
    var Proxy = Packages.java.lang.reflect.Proxy;
    
    // Convert a Java array to a JavaScript array
    function javaArrayToJsArray(javaArray)
    {
       var jsArray = [];
       for (i = 0; i < javaArray.length; ++i) {
           jsArray[i] = javaArray[i];
       }
       return jsArray;
    }
    
    var interfaces = Array.newInstance(Class, 1);
    interfaces[0] = javaInterface;
    var obj = Proxy.newProxyInstance(
       ClassLoader.getSystemClassLoader(),
       interfaces,
       // Note, args is a Java array
       function(proxy, method, args) {
           // Convert Java array to JavaScript array
           return object[method.getName()].apply(
               null,
               javaArrayToJsArray(args));
       });
    return obj;
}
