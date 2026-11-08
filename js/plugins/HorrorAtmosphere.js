/*:
 * @plugindesc The Last Broadcast — MV artwork, sound design, lighting and discovery-driven scares.
 * @author Codex
 * @help Requires LastBroadcast above this plugin. No external dependencies.
 * Options > Reduced effects disables visual interference and apparitions.
 * All character artwork comes from the installed RPG Maker MV assets.
 * Audio: installed RPG Maker MV and Horror Soundscapes assets.
 */
(function(){
'use strict';
var H=window.LBHorror={frame:0,cue:null,queue:[],lastStep:0,enteredSteps:0,roomFrames:0};
H.sound=function(name,volume,pitch){AudioManager.playSe({name:name,volume:volume||35,pitch:pitch||100,pan:0});};
H.push=function(key,text,sound,apparition){
 if(!$gameSystem)return;
 var seen=$gameSystem._lbHorrorSeen||($gameSystem._lbHorrorSeen={});
 if(seen[key])return;seen[key]=true;H.queue.push({text:text,sound:sound,apparition:!!apparition,left:240});
};
H.safe=function(){return $gameMap.mapId()===12;};
var switchSet=Game_Switches.prototype.setValue;
Game_Switches.prototype.setValue=function(id,value){
 var changed=value&&!this.value(id);switchSet.call(this,id,value);
 if(!changed||!$gameMap)return;
 var cues={2:['Someone knocks from inside the wall.','Knock',false],5:['The second cup is still warm.','Noise',true],9:['A chair scrapes in the empty classroom.','Door4',false],13:['Bare feet. The bed behind you was empty.','Knock',true],19:['The tape keeps turning after you press STOP.','Noise',false],22:['For a moment, your reflection stays behind.','Door4',true],26:['This time, let her finish.','Wind4',false]};
 if(cues[id])H.push('discovery-'+id,cues[id][0],cues[id][1],cues[id][2]);
};
var setup=Game_Map.prototype.setup;
Game_Map.prototype.setup=function(id){setup.call(this,id);H.cue=null;H.queue=[];H.roomFrames=0;H.lastStep=$gameParty.steps();H.enteredSteps=H.lastStep;
 if($gameScreen)$gameScreen.startTint(id===12?[-12,-8,-4,35]:[-37,-29,-13,115],30);
};
ConfigManager.lbReducedEffects=false;
var makeConfig=ConfigManager.makeData;ConfigManager.makeData=function(){var d=makeConfig.call(this);d.lbReducedEffects=this.lbReducedEffects;return d;};
var applyConfig=ConfigManager.applyData;ConfigManager.applyData=function(d){applyConfig.call(this,d);this.lbReducedEffects=!!d.lbReducedEffects;};
var addOptions=Window_Options.prototype.addGeneralOptions;Window_Options.prototype.addGeneralOptions=function(){addOptions.call(this);this.addCommand('Reduced effects','lbReducedEffects');};

var create=Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects=function(){
 create.call(this);
 if(this._lbShade)this._lbShade.visible=false;
 this._horrorMask=new Sprite(new Bitmap(Graphics.width,Graphics.height));
 this.addChildAt(this._horrorMask,this.getChildIndex(this._windowLayer));
 var ghostCharacter=new Game_Character();ghostCharacter.setImage('Monster',6);ghostCharacter.setDirection(2);
 this._horrorGhost=new Sprite_Character(ghostCharacter);this._horrorGhost.opacity=0;
 this.addChildAt(this._horrorGhost,this.getChildIndex(this._horrorMask));
 this._horrorCaption=new Sprite(new Bitmap(Graphics.width,60));this._horrorCaption.y=Graphics.height-75;this.addChildAt(this._horrorCaption,this.getChildIndex(this._windowLayer));
 this._horrorCaptionKey='';
};
function light(ctx,x,y,r){var g=ctx.createRadialGradient(x,y,12,x,y,r);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(0.45,'rgba(0,0,0,0.85)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
var update=Scene_Map.prototype.update;
Scene_Map.prototype.update=function(){
 update.call(this);if(!this._horrorMask)return;H.frame++;H.roomFrames++;
 var busy=$gameMessage.isBusy()||$gameMap.isEventRunning()||$gamePlayer.isTransferring();
 if(!busy&&!H.safe()){
  if(!H.cue&&H.queue.length){H.cue=H.queue.shift();H.sound(H.cue.sound,38,92);}
  if(H.cue&&--H.cue.left<=0)H.cue=null;
  var steps=$gameParty.steps()-H.enteredSteps,mid=$gameMap.mapId();
  if(steps>=5){
   if(mid===2&&$gameSwitches.value(5))H.push('street-after-bell','Every radio on the street says her name wrong.','Noise',false);
   if(mid===5)H.push('classroom','The bell rings. Something under a desk answers.','Knock',false);
   if(mid===11)H.push('not-your-home','The furniture is familiar. None of the doors are.','Wind4',true);
  }
 }
 if(H.updateAudio)H.updateAudio(busy);
 var pulse=!ConfigManager.lbReducedEffects&&H.cue&&H.cue.left>200?0.10*Math.sin(H.frame/4):0;
 if(H.frame%3===0){
  var b=this._horrorMask.bitmap,ctx=b._context;b.clear();ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='rgba(2,6,12,'+(H.safe()?0.20:LB.danger()?0.78:0.61+Math.max(0,pulse))+')';ctx.fillRect(0,0,b.width,b.height);
  ctx.globalCompositeOperation='destination-out';
  light(ctx,$gamePlayer.screenX(),$gamePlayer.screenY()-23,LB.danger()?158:205);
  if(!LB.danger())$gameMap.events().forEach(function(e){if(/Save \/ recorder/.test(e.event().name))light(ctx,e.screenX(),e.screenY()-20,115);});
  ctx.globalCompositeOperation='source-over';
  if(H.cue&&!ConfigManager.lbReducedEffects){ctx.fillStyle='rgba(160,183,182,0.055)';for(var y=H.frame%5;y<b.height;y+=5)ctx.fillRect(0,y,b.width,1);}
  b._setDirty();
 }
 var ghost=H.cue&&H.cue.apparition&&!ConfigManager.lbReducedEffects&&!busy&&H.cue.left>165&&H.cue.left<220;
 this._horrorGhost.opacity=ghost?Math.min(145,(H.cue.left-165)*5):0;
 this._horrorGhost.x=Math.max(100,Math.min(Graphics.width-100,$gamePlayer.screenX()+175));this._horrorGhost.y=Math.max(200,$gamePlayer.screenY()-70);
 var caption=!busy&&H.cue?H.cue.text:LB.hidden>0?'Do not answer if it uses your voice.':'';
 if(caption!==this._horrorCaptionKey){this._horrorCaptionKey=caption;var cb=this._horrorCaption.bitmap;cb.clear();if(caption){cb.fillRect(45,5,Graphics.width-90,46,'rgba(0,0,0,0.87)');cb.fontSize=18;cb.textColor='#c7c9c1';cb.drawText(caption,60,10,Graphics.width-120,34,'center');}}
};
var titleCommands=Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow=function(){titleCommands.call(this);this._commandWindow.x=65;this._commandWindow.y=405;};
Scene_Title.prototype.playTitleMusic=function(){AudioManager.stopBgm();AudioManager.stopMe();AudioManager.playBgs({name:'HS_Night',volume:30,pitch:100,pan:0});};

// Drop queued scare cues on new game and load so a stale caption never carries into another save.
var hNewGame=DataManager.setupNewGame;DataManager.setupNewGame=function(){hNewGame.call(this);H.cue=null;H.queue=[];};
var hExtract=DataManager.extractSaveContents;DataManager.extractSaveContents=function(contents){hExtract.call(this,contents);H.cue=null;H.queue=[];};
})();
