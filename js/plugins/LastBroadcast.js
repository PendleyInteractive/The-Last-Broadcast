/*:
 * @plugindesc The Last Broadcast: presentation, journal and local pursuit. MV 1.6.
 * @author Codex
 * @help Maps tagged <danger> contain events tagged <stalker>.
 * Hiding needs more than 3 tiles of distance and lasts 5 seconds.
 * Capture resets the encounter only. Notes and story flags are saved by MV.
 */
(function(){
'use strict';
window.LB = {
  hidden:0, quiet:0, tick:0,
  objective:function(text){$gameSystem._lbObjective=text;},
  note:function(title,text){
    var notes=$gameSystem._lbNotes || ($gameSystem._lbNotes=[]);
    if(!notes.some(function(n){return n.title===title;}))notes.push({title:title,text:text});
  },
  showNotes:function(){SceneManager.push(Scene_LBJournal);},
  danger:function(){return $dataMap && /<danger>/.test($dataMap.note||'');},
  stalker:function(){return $gameMap.events().filter(function(e){return /<stalker>/.test(e.event().note||'');})[0];},
  distance:function(e){return Math.abs(e.x-$gamePlayer.x)+Math.abs(e.y-$gamePlayer.y);},
  resetPursuit:function(){this.pursuit={mode:'patrol',x:4,y:5,memory:0,point:0,blocked:0};},
  senses:function(e){
    var distance=this.distance(e),visible=distance<=7&&(e.x===$gamePlayer.x||e.y===$gamePlayer.y);
    if(visible&&distance>0){
      var d=e.x<$gamePlayer.x?6:e.x>$gamePlayer.x?4:e.y<$gamePlayer.y?2:8,x=e.x,y=e.y;
      for(var n=0;n<distance;n++){
        var nx=$gameMap.roundXWithDirection(x,d),ny=$gameMap.roundYWithDirection(y,d);
        if(!$gameMap.isPassable(x,y,d)||!$gameMap.isPassable(nx,ny,10-d)){visible=false;break;}
        if(n<distance-1&&$gameMap.eventsXyNt(nx,ny).some(function(other){return other!==e&&other.isNormalPriority();})){visible=false;break;}
        x=nx;y=ny;
      }
    }
    return {visible:visible,heard:distance<=5&&$gamePlayer.isMoving()&&$gamePlayer.isDashing()};
  },
  pursue:function(e){
    if(!this.pursuit)this.resetPursuit();
    var s=this.pursuit,senses=this.senses(e);
    if(senses.visible||senses.heard){
      if(s.mode==='patrol'&&window.LBHorror)LBHorror.push('alert-'+$gameMap.mapId(),senses.visible?'It has seen you. Break its line of sight.':'It heard you running. Turn a corner.','Noise',false);
      s.mode='hunt';s.x=$gamePlayer.x;s.y=$gamePlayer.y;s.memory=240;
    }else if(s.mode!=='patrol'){
      s.mode='search';s.memory--;if(s.memory<=0){s.mode='patrol';s.blocked=0;}
    }
    var route=[[4,5],[6,7],[10,8],[10,12],[16,9]];
    if(s.mode==='patrol'){
      var target=route[s.point];if(e.x===target[0]&&e.y===target[1]){s.point=(s.point+1)%route.length;target=route[s.point];}
      s.x=target[0];s.y=target[1];
    }
    e.setMoveSpeed(s.mode==='hunt'?4:3);
    if(!e.isMoving()&&this.tick%(s.mode==='hunt'?24:36)===0){
      var d=e.findDirectionTo(s.x,s.y);if(d){e.moveStraight(d);s.blocked=e.isMovementSucceeded()?0:s.blocked+1;}
      if(s.mode==='patrol'&&s.blocked>=3){s.point=(s.point+1)%route.length;s.blocked=0;}
    }
    if(this.distance(e)<=1&&!e.isMoving()&&senses.visible)this.caught();
  },
  hide:function(){
    var e=this.stalker();
    if(!this.danger() || !e){$gameMessage.add('An empty cabinet. Nothing is following me here.');return;}
    if(this.distance(e)<=3){$gameMessage.add('Too close. It saw me. Run and try another cabinet!');return;}
    this.hidden=300;$gamePlayer.setTransparent(true);
    $gameMessage.add('You fold yourself into the cabinet.\nStay still. Wait for the footsteps to pass.');
  },
  caught:function(){
    this.hidden=0;this.quiet=180;$gamePlayer.setTransparent(false);
    this.resetPursuit();
    var e=this.stalker();if(e)e.locate(e.event().x,e.event().y);
    $gameScreen.startFlash([0,0,0,255],20);
    $gamePlayer.reserveTransfer($gameMap.mapId(),10,13,8,0);
    $gameMessage.add('The voice is almost yours.\nThen the tape rewinds. You are back at the entrance.');
  }
};
var setup=Game_Map.prototype.setup;
Game_Map.prototype.setup=function(id){setup.call(this,id);LB.hidden=0;LB.quiet=180;LB.tick=0;LB.resetPursuit();$gamePlayer.setTransparent(false);};
var movable=Game_Player.prototype.canMove;
Game_Player.prototype.canMove=function(){return LB.hidden<=0 && movable.call(this);};
var saveEnabled=Game_System.prototype.isSaveEnabled;
Game_System.prototype.isSaveEnabled=function(){return saveEnabled.call(this) && !LB.danger();};
var update=Scene_Map.prototype.update;
Scene_Map.prototype.update=function(){
  update.call(this);
  if(!LB.danger() || $gameMessage.isBusy() || $gameMap.isEventRunning() || $gamePlayer.isTransferring())return;
  var e=LB.stalker();if(!e)return;
  if(LB.hidden>0){
    LB.hidden--;
    if(LB.hidden===0){$gamePlayer.setTransparent(false);e.locate(4,5);LB.quiet=180;LB.resetPursuit();}
    return;
  }
  if(LB.quiet>0){LB.quiet--;return;}
  LB.tick++;
  LB.pursue(e);
};

// Deliberately sparse menu: no irrelevant RPG combat statistics.
Window_MenuCommand.prototype.makeCommandList=function(){
  this.addCommand('Field notes','journal');this.addCommand('Evidence','item');
  this.addCommand('Options','options');this.addCommand('Save','save',$gameSystem.isSaveEnabled());this.addCommand('Return to title','gameEnd');
};
var menuCreate=Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow=function(){menuCreate.call(this);this._commandWindow.setHandler('journal',function(){SceneManager.push(Scene_LBJournal);});};
Scene_Menu.prototype.createStatusWindow=function(){};
Scene_Menu.prototype.createGoldWindow=function(){};
Scene_Menu.prototype.start=function(){Scene_MenuBase.prototype.start.call(this);};

function wrap(text,width){
 var result=[];String(text).split('\n').forEach(function(p){var line='';p.split(' ').forEach(function(word){if((line+word).length>width){result.push(line.trim());line='';}line+=word+' ';});result.push(line.trim());});return result;
}
function Scene_LBJournal(){this.initialize.apply(this,arguments);}
Scene_LBJournal.prototype=Object.create(Scene_MenuBase.prototype);Scene_LBJournal.prototype.constructor=Scene_LBJournal;
Scene_LBJournal.prototype.create=function(){
 Scene_MenuBase.prototype.create.call(this);
 this._body=new Window_Base(270,0,Graphics.boxWidth-270,Graphics.boxHeight);this.addWindow(this._body);
 this._list=new Window_LBList(0,0,270,Graphics.boxHeight);this._list.setHandler('cancel',this.popScene.bind(this));this.addWindow(this._list);this._list.activate();this._list.select(0);this._last=-1;
};
Scene_LBJournal.prototype.update=function(){
 Scene_MenuBase.prototype.update.call(this);var n=this._list.index();if(n===this._last)return;this._last=n;
 var b=this._body;b.contents.clear();b.contents.fontSize=22;
 var entries=[{title:'Current objective',text:($gameSystem._lbObjective||'Explore the house.')+'\n\nCONTROLS\nArrows: move\nEnter / Z: investigate\nShift: run\nEsc / X: menu or back\n\nCabinets provide five seconds of shelter. Hide before a pursuer reaches you.\n\nSave at a recorder, or from the menu outside pursuit rooms.'}].concat($gameSystem._lbNotes||[]);
 var entry=entries[n]||entries[0];b.changeTextColor('#d5b77b');b.drawText(entry.title,0,0,b.contents.width);b.resetTextColor();
 wrap(entry.text,36).forEach(function(line,i){b.drawText(line,0,48+i*27,b.contents.width);});
};
function Window_LBList(){this.initialize.apply(this,arguments);}
Window_LBList.prototype=Object.create(Window_Selectable.prototype);Window_LBList.prototype.constructor=Window_LBList;
Window_LBList.prototype.initialize=function(x,y,w,h){Window_Selectable.prototype.initialize.call(this,x,y,w,h);this.refresh();};
Window_LBList.prototype.maxItems=function(){return 1+($gameSystem._lbNotes||[]).length;};
Window_LBList.prototype.drawItem=function(i){var r=this.itemRectForText(i);this.contents.fontSize=18;this.drawText(i===0?'CURRENT OBJECTIVE':($gameSystem._lbNotes||[])[i-1].title,r.x,r.y,r.width);};

// Lightweight UI overlay. No generated art or external dependencies.
var sprites=Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects=function(){
 sprites.call(this);
 this._lbHud=new Sprite(new Bitmap(Graphics.width,66));this.addChild(this._lbHud);
 this._lbShade=new Sprite(new Bitmap(Graphics.width,Graphics.height));
 var ctx=this._lbShade.bitmap._context,g=ctx.createRadialGradient(Graphics.width/2,Graphics.height/2,150,Graphics.width/2,Graphics.height/2,520);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.64)');ctx.fillStyle=g;ctx.fillRect(0,0,Graphics.width,Graphics.height);this._lbShade.bitmap._setDirty();
 // Put shade below windows and HUD so instructions remain legible.
 this.addChildAt(this._lbShade,this.getChildIndex(this._windowLayer));
};
var mapUpdate=Scene_Map.prototype.update;
Scene_Map.prototype.update=function(){mapUpdate.call(this);if(!this._lbHud)return;
 this._lbHud.visible=!$gameMessage.isBusy();var text=LB.hidden>0?'HIDDEN / wait for the footsteps to pass':LB.danger()?'KEEP MOVING / Shift to run / cabinets offer shelter':($gameSystem._lbObjective||'Find the cassette.');
 if(this._lbHudText===text)return;this._lbHudText=text;var b=this._lbHud.bitmap;b.clear();b.fillRect(0,0,Graphics.width,64,'rgba(8,14,19,0.88)');b.fontSize=13;b.textColor='#d5b77b';b.drawText('THE LAST BROADCAST   /   '+$gameMap.displayName().toUpperCase(),20,5,Graphics.width-40,20);b.fontSize=17;b.textColor='#e5e5dc';b.drawText(text,20,28,Graphics.width-40,26);
};
Scene_Title.prototype.createBackground=function(){
 this._backSprite1=new Sprite(new Bitmap(Graphics.width,Graphics.height));this.addChild(this._backSprite1);
 var b=this._backSprite1.bitmap;b.fillAll('#0b141c');
 for(var y=0;y<Graphics.height;y+=4)b.fillRect(0,y,Graphics.width,1,'rgba(190,207,207,0.035)');
 var ctx=b._context;ctx.strokeStyle='rgba(180,143,86,0.18)';ctx.lineWidth=1;
 for(var r=50;r<650;r+=45){ctx.beginPath();ctx.arc(680,180,r,0,Math.PI*2);ctx.stroke();}b._setDirty();
 b.fontFace='Georgia';b.textColor='#d6be8c';b.fontSize=16;b.drawText('A S H W A T E R   /   0 0 : 0 0',65,95,650,32);
 b.fontSize=58;b.textColor='#eee9df';b.drawText('THE LAST',60,155,690,80);b.drawText('BROADCAST',60,225,690,80);
 b.fontFace='GameFont';b.fontSize=19;b.textColor='#9eacae';b.drawText('Some voices should never be forgotten.',65,320,650,40);
 b.fontSize=14;b.drawText('PLAYABLE CAMPAIGN PROTOTYPE',65,Graphics.height-40,650,24);
 this._backSprite2=new Sprite(new Bitmap(1,1));this.addChild(this._backSprite2);
};
Scene_Title.prototype.drawGameTitle=function(){};
Scene_Title.prototype.centerSprite=function(){};
Scene_Title.prototype.playTitleMusic=function(){AudioManager.stopBgm();AudioManager.stopMe();AudioManager.playBgs({name:'Darkness',volume:22,pitch:80,pan:0});};

// Reset transient pursuit state on new game and load, so a hide/chase in progress never leaks into another save.
LB.reset=function(){this.hidden=0;this.quiet=180;this.tick=0;this.resetPursuit();if($gamePlayer)$gamePlayer.setTransparent(false);};
var lbNewGame=DataManager.setupNewGame;DataManager.setupNewGame=function(){lbNewGame.call(this);LB.reset();};
var lbExtract=DataManager.extractSaveContents;DataManager.extractSaveContents=function(contents){lbExtract.call(this,contents);LB.reset();};
})();
