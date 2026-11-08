/*:
 * @plugindesc Authored MV/Horror Soundscapes audio: room ambience, chase tension, quiet hiding and credits.
 * @author Codex
 * @help Uses installed Horror Soundscapes by ayato sound create and stock MV effects.
 * No generated audio. Required credits and distribution notes are in CREDITS.md.
 */
(function(){
'use strict';
var H=window.LBHorror;
H.audioState={map:0,mode:'',track:'',volume:-1,lastFootstep:0};
H.updateAudio=function(busy){
 var a=H.audioState,mapId=$gameMap.mapId();
 if(a.map!==mapId){a.map=mapId;a.mode='';a.track='';a.volume=-1;a.lastFootstep=$gameParty.steps();}
 var mode=LB.hidden>0?'hidden':LB.danger()&&LB.quiet===0&&LB.pursuit&&LB.pursuit.mode==='hunt'?'chase':'room';
 var room=$dataMap.bgs||{},name=mode==='chase'?'HS_HeartBeat':room.name;
 var volume=mode==='chase'?33:room.volume||20;
 if(mode==='hidden')volume=6;else if(busy)volume=Math.round(volume*0.55);else if(H.cue)volume=Math.round(volume*0.65);
 if(a.track!==name){AudioManager.playBgs({name:name,volume:volume,pitch:100,pan:0});a.track=name;}
 else if(a.volume!==volume&&AudioManager._bgsBuffer){AudioManager._currentBgs.volume=volume;AudioManager.updateBgsParameters(AudioManager._currentBgs);}
 a.mode=mode;a.volume=volume;
 var steps=$gameParty.steps();
 if(steps!==a.lastFootstep){
  a.lastFootstep=steps;
  if(!busy&&!LB.hidden&&$gamePlayer.isDashing()&&steps%2===0)H.sound('Move3',12,78,0);
 }
};
// Stereo positioning is restrained so captions still carry essential cues.
H.sound=function(name,volume,pitch,pan){AudioManager.playSe({name:name,volume:volume===undefined?35:volume,pitch:pitch||100,pan:pan||0});};
Scene_Title.prototype.playTitleMusic=function(){AudioManager.stopBgm();AudioManager.stopMe();AudioManager.playBgs({name:'HS_Night',volume:23,pitch:100,pan:0});};

function Scene_LBCredits(){this.initialize.apply(this,arguments);}
Scene_LBCredits.prototype=Object.create(Scene_MenuBase.prototype);Scene_LBCredits.prototype.constructor=Scene_LBCredits;
Scene_LBCredits.prototype.create=function(){
 Scene_MenuBase.prototype.create.call(this);
 var w=new Window_Base(55,65,Graphics.boxWidth-110,Graphics.boxHeight-130);this.addWindow(w);w.contents.fontSize=22;
 var lines=['THE LAST BROADCAST','','Horror Soundscapes','[Copyright](C) ayato sound create','','Artwork, fonts and stock sound effects','RPG Maker MV / respective rights holders','','No AI-generated artwork or audio assets.','','Press Esc / X or Enter to return.'];
 lines.forEach(function(line,i){w.changeTextColor(i===0?'#d5b77b':'#e3e3db');w.drawText(line,0,18+i*31,w.contents.width,'center');});
};
Scene_LBCredits.prototype.update=function(){Scene_MenuBase.prototype.update.call(this);if(Input.isTriggered('cancel')||Input.isTriggered('ok')||TouchInput.isCancelled()||TouchInput.isTriggered())this.popScene();};
var titleList=Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList=function(){titleList.call(this);this.addCommand('Credits','lbCredits');};
var titleWindow=Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow=function(){titleWindow.call(this);this._commandWindow.setHandler('lbCredits',function(){SceneManager.push(Scene_LBCredits);});};
})();
