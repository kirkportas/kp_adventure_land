// "use strict";

// Note this is Kirk's Screeps logger, lightly modified for use in Adventureland.
/* README
 * To use this Logger, place these 3 lines at the *very top* of main.js, before any prototype extensions
 *
     let Logger = require('Logger');
     Logger._.init();
     Logger.ACTIVE=true;
 * Import it in any file that needs logging with:
     let Logger = require('Logger');
 * To use Logger, call functionEnter(stringMessage) and functionExit(stringMessage, cpuUsedNumber) before and
 * after some piece of functionality. For example:
    var missionMsg = 'Running <missionName>: <some useful info> in room <roomname>!';
    Logger.functionEnter(missionMsg);
      timeMission = Game.cpu.getUsed();
        var initSuccess = false;        // Don't run() if init() throws error.
        Logger.log('This logger call is made *inside* a function black and will be indented');
        try { mission.init(); initSuccess = true; } catch(err) { Logger.log('Mission init() error, missionMsg: '+missionMsg+' -- err: '+err); }
        try { if (initSuccess) mission.run();  } catch(err) { Logger.log('Mission run() error, missionMsg: '+missionMsg+' -- err: '+err); }
        var nestedFeatureMsg = "Running <subActivity>";
        Logger.functionEnter(nestedFeatureMsg);
          var timeSubActivity = Game.cpu.getUsed();
          Logger.log('This 2nd logger call will get *nested* and *indented* further!');
          // If no Logger call is made inside this nested FunctionEnter scope, the block won't be output.
        Logger.functionExit(nestedFeatureMsg, Game.cpu.getUsed() - timeSubActivity);
      timeMission = Game.cpu.getUsed() - timeMission;
    Logger.functionExit(missionMsg, timeMission);  // the
* This will output Logged code that looks like:
    [4:07:44 PM][shard0]--> Running <missionName>: <some useful info> in room <roomname>!
    [4:07:44 PM][shard0] This logger call is made *inside* a function black and will be indented
    [4:07:44 PM][shard0]  --> Running <subActivity>
    [4:07:44 PM][shard0]    This 2nd logger call will get *nested* and *indented* further!
    [4:07:44 PM][shard0]  <-- Running <subActivity>
    [4:07:44 PM][shard0]<-- Running <missionName>: <some useful info> in room <roomname>! [0.05]
 *
 */


//## Description:
// The Logger only shows a 'block' if Logger.log calls are made within that block.
var Logger = class Logger {

    /**
     * Get the singleton object
     * @return {Logger}
     */
    static get _ () {
       if (Logger._singleton === undefined)
            Logger._ = new Logger();
       return Logger._singleton;
    }

    /**
     * Set the singleton object
     * @param {Logger}
     */
    static set _ (singleton) {
        Logger._singleton = singleton;
    }

    /**
     * Instantiate the Logger
     * @constructor
     * @this {Logger}
     */
    constructor () {
        Logger.ACTIVE = true;
        Logger.MODULES = {
            // ROOM:          false,
            // ROOMPOSITION:   false,
        };

        // Logger.indentation = ["", "  ", "    ", "      ", "        ", "          ", "            ", "              ", "                ", "                ", "                  ", "                    ", "                      ", "                        ", "                          ", "                            ", "                              ", "                                ", "                                  ", "                                    ", "                                      ", "                                        "];
        Logger.indentation = ["", "  ", "    ", "      ", "        ", "          ", "            ", "              ", "                ", "                  "];

        Logger.level = 0;

        Logger.logStack = [];
        Logger.logStackEnterLevel = [];
        Logger.logStackShowLevel = [];
    }

    /**
     * Apply the wrapper to selected functions
     */
    init () {
        if (Logger.ACTIVE && this._init !== true) {
            this._init = true;
            var methods = [];
            if (Logger.MODULES.ROOM) {
                // this.wrap('Room', Room, 'find');
                // this.wrap('Room', Room, 'findPath');
            }
        }
    }

    /**
     * wrap function of class c
     * @param {String} class name
     * @param {Object} class object
     * @param {String} method name
     */
    wrap (LoggerName, c, method, tReqBoundary = 5) {
        if (Logger.ACTIVE) {
            var f = c.prototype[method];
            c.prototype[method] = function() {
                Logger.functionEnter(LoggerName + '.' + method);

                var tStart      = Game.cpu.getUsed();

                try {
                    var returnValue = f.apply(this, arguments);
                } catch (e) {
                    Logger.logDebug(e);
                    Logger.logError(e.stack);
                }
                var tReq        = Game.cpu.getUsed() - tStart;

                if ( tReq >= tReqBoundary ) Logger.logStackShowLevel[Logger.level - 1] = true;
                Logger.functionExit(LoggerName + '.' + method,  + tReq);

                return returnValue;
            };
        }
    }

    /**
     * log a message
     * @param {String} msg
     */
    static functionEnter (name) {
        if (!Logger.ACTIVE) { return; }
        Logger.log( '--> ' + name, true, false );
        Logger.level ++;
    }

    /**
     * log a message
     * @param {String} msg
     */
    static functionExit (name, tReq) {
        if (!Logger.ACTIVE) { return; }
        Logger.level --;
        Logger.log( '<-- ' + name  + ' [' + tReq.toFixed(2) + '] ', false, true);
    }

    // Override methods to ensure a logstack never builds.
    // As a result the # of "game_log()" calls will be 0
    // static functionEnter (name) { }
    // static functionExit (name, tReq) { }

    static logPrintStack () {
        if (!Logger.ACTIVE) { return; }
        for ( let i = 0; i < Logger.logStack.length; i ++ ) {
            game_log(Logger.logStack[i]);
            console.log(Logger.logStack[i]);
        }
        Logger.logStack = [];
    }

    /**
     * log a message. Will only log a 'block' if .log() calls are made inside that block
     * @param {String} msg
     */
    static log (msg, enter = false, exit = false) {
        if (!Logger.ACTIVE) { return; }
        if ( enter ) {
            Logger.logStack.push( Logger.logMessage(msg) );
            Logger.logStackEnterLevel[Logger.level] = Logger.logStack.length;
            Logger.logStackShowLevel[Logger.level] = false;
        } else if ( exit ) {
            if ( Logger.logStackShowLevel[Logger.level] ) {
                Logger.logStack.push( Logger.logMessage(msg) );
                Logger.logPrintStack ();
                if (Logger.level > 0 ) Logger.logStackShowLevel[Logger.level - 1] = true;
            } else {
                for ( let i = Logger.logStack.length - 1; i >= Logger.logStackEnterLevel[Logger.level] - 1; i --) {
                    Logger.logStack.pop();
                }
            }
        } else {
            Logger.logStack.push( Logger.logMessage(msg) );
            Logger.logStackShowLevel[Logger.level - 1] = true;
        }
    }

    /**
     * log a message
     * @param {String} msg
     */
    static logError (msg) {
        if (!Logger.ACTIVE) { return; }
        Logger.log( 'ERROR: ' + msg );
    }

    /**
     * log a object
     * @param {String} obj
     */
    static logDebug (obj) {
        if (!Logger.ACTIVE) { return; }
        Logger.log( 'DEBUG: ' + JSON.stringifyOnce(obj) );
    }

    static logMessage (msg) {
        if (!Logger.ACTIVE) { return; }
        if (Logger.indentation[Logger.level] === undefined) {
            console.log('Logger error line 161');
            console.log(`Logger.level: ${Logger.level}`);
            if (Logger.level <0) {
                Logger.level+=5;
                console.log(`Logger.level +5`);

            }
        }
        return Logger.indentation[Logger.level] + msg;
    }

};

JSON.stringifyOnce = function(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value){
        if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
        return 'object too long';
        }
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index){
            if(obj===value){
                printedObjIndex = index;
            }
        });

        if ( key == ''){ //root element
             printedObjects.push(obj);
            printedObjectKeys.push("root");
             return value;
        }

        else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
            if ( printedObjectKeys[printedObjIndex] == "root"){
                return "(pointer to root)";
            }else{
                return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
            }
        }else{

            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if(replacer){
                return replacer(key, value);
            }else{
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
};

// module.exports = Logger;