function events() {

}

events.prototype.init = function () {
    this.events = {
        'battle': function (data, core, callback) {
            core.battle(data.event.id, data.x, data.y);
            if (core.isset(callback))
                callback();
        },
        'getItem': function (data, core, callback) {
            core.getItem(data.event.id, 1, data.x, data.y);
            if (core.isset(callback))
                callback();
        },
        'openDoor': function (data, core, callback) {
            core.openDoor(data.event.id, data.x, data.y, true);
            if (core.isset(callback))
                callback();
        },
        'changeFloor': function (data, core, callback) {
            var heroLoc = {};
            if (core.isset(data.event.data.loc))
                heroLoc = {'x': data.event.data.loc[0], 'y': data.event.data.loc[1]};
            if (core.isset(data.event.data.direction))
                heroLoc.direction = data.event.data.direction;
            core.changeFloor(data.event.data.floorId, data.event.data.stair,
                heroLoc, data.event.data.time, callback);
        },
        'passNet': function (data, core, callback) {
            core.events.passNet(data);
            if (core.isset(callback))
                callback();
        },
        "changeLight": function (data, core, callback) {
            core.events.changeLight(data.x, data.y);
            if (core.isset(callback))
                callback();
        },
        'action': function (data, core, callback) {
            core.events.doEvents(data.event.data, data.x, data.y);
            if (core.isset(callback)) callback();
        }
    }
}

// 初始化
events.prototype.getEvents = function (eventName) {
    if (eventName == undefined) {
        return this.events;
    }
    return this.events[eventName];
}

main.instance.events = new events();



////// 游戏开始事件 //////
events.prototype.startGame = function (hard) {

    if (core.status.isStarting) return;
    core.status.isStarting = true;

    core.hideStartAnimate(function() {
        core.drawText(core.clone(core.firstData.startText), function() {
            if (core.flags.showBattleAnimateConfirm) { // 是否提供“开启战斗动画”的选择项
                core.status.event.selection = core.flags.battleAnimate ? 0 : 1;
                core.ui.drawConfirmBox("你想开启战斗动画吗？\n之后可以在菜单栏中开启或关闭。\n（强烈建议新手开启此项）", function () {
                    core.flags.battleAnimate = true;
                    core.setLocalStorage('battleAnimate', true);
                    core.startGame(hard);
                    core.events.setInitData(hard);
                }, function () {
                    core.flags.battleAnimate = false;
                    core.setLocalStorage('battleAnimate', false);
                    core.startGame(hard);
                    core.events.setInitData(hard);
                });
            }
            else {
                core.startGame(hard);
                core.events.setInitData(hard);
            }
        });
    })
}

////// 简单难度设置初始福利 //////
events.prototype.setInitData = function (hard) {
    if (hard=='Easy') { // 简单难度
        core.setFlag('hard', 1); // 可以用flag:hard来获得当前难度
        // 可以在此设置一些初始福利，比如设置初始生命值可以调用：
        // core.setStatus("hp", 10000);
    }
    if (hard=='Normal') { // 普通难度
        core.setFlag('hard', 2); // 可以用flag:hard来获得当前难度
    }
    if (hard=='Hard') { // 困难难度
        core.setFlag('hard', 3); // 可以用flag:hard来获得当前难度
    }
}

////// 游戏结束事件 //////
events.prototype.win = function(reason) {
    // 获胜
    core.waitHeroToStop(function() {
        core.removeGlobalAnimate(0,0,true);
        core.clearMap('all'); // 清空全地图
        core.drawText([
            "\t[结局2]恭喜通关！你的分数是${status:hp}。"
        ], function () {
            core.restart();
        })
    });
}

events.prototype.lose = function(reason) {
    // 失败
    core.waitHeroToStop(function() {
        core.drawText([
            "\t[结局1]你死了。\n如题。"
        ], function () {
            core.restart();
        });
    })
}

////// 转换楼层结束的事件 //////
events.prototype.afterChangeFloor = function (floorId) {
    if (!core.isset(core.status.event.id) && !core.hasFlag("visited_"+floorId)) {
        this.doEvents(core.floors[floorId].firstArrive);
        core.setFlag("visited_"+floorId, true);
    }

    // 播放BGM
    if (floorId == 'sample0') {
        core.playBgm('bgm.mp3');
    }
    if (floorId == 'sample1') {
        core.playBgm('star.mid');
    }
    if (floorId == 'sample2') {
        core.playBgm('qianjin.mid');
    }
}

////// 实际事件的处理 //////
events.prototype.doEvents = function (list, x, y, callback) {
    // 停止勇士
    core.waitHeroToStop(function() {
        if (!core.isset(list)) return;
        if (!(list instanceof Array)) {
            list = [list];
        }
        core.lockControl();
        core.status.event = {'id': 'action', 'data': {
            'list': core.clone(list), 'x': x, 'y': y, 'callback': callback
        }}
        core.events.doAction();
    });
}

events.prototype.doAction = function() {
    // 清空boxAnimate和UI层
    clearInterval(core.interval.boxAnimate);
    core.clearMap('ui', 0, 0, 416, 416);
    core.setAlpha('ui', 1.0);

    // 事件处理完毕
    if (core.status.event.data.list.length==0) {
        if (core.isset(core.status.event.data.callback))
            core.status.event.data.callback();
        core.ui.closePanel(false);
        return;
    }

    var data = core.status.event.data.list.shift();
    core.status.event.data.current = data;

    var x=core.status.event.data.x, y=core.status.event.data.y;

    // 不同种类的事件

    // 如果是文字：显示
    if (typeof data == "string") {
        core.status.event.data.type='text';
        core.ui.drawTextBox(data);
        return;
    }
    core.status.event.data.type=data.type;
    switch (data.type) {
        case "text": // 文字/对话
            core.ui.drawTextBox(data.data);
            break;
        case "tip":
            core.drawTip(core.replaceText(data.text));
            core.events.doAction();
            break;
        case "show": // 显示
            if (core.isset(data.time) && data.time>0 && (!core.isset(data.floorId) || data.floorId==core.status.floorId)) {
                core.animateBlock(data.loc[0],data.loc[1],'show', data.time, function () {
                    core.addBlock(data.loc[0],data.loc[1],data.floorId);
                    core.events.doAction();
                });
            }
            else {
                core.addBlock(data.loc[0],data.loc[1],data.floorId)
                this.doAction();
            }
            break;
        case "hide": // 消失
            var toX=x, toY=y, toId=core.status.floorId;
            if (core.isset(data.loc)) {
                toX=data.loc[0]; toY=data.loc[1];
            }
            if (core.isset(data.floorId)) toId=data.floorId;
            core.removeBlock(toX,toY,toId)
            if (core.isset(data.time) && data.time>0 && toId==core.status.floorId) {
                core.animateBlock(toX,toY,'hide',data.time, function () {
                    core.events.doAction();
                });
            }
            else this.doAction();
            break;
        case "move": // 移动事件
            if (core.isset(data.loc)) {
                x=data.loc[0];
                y=data.loc[1];
            }
            core.moveBlock(x,y,data.steps,data.time,data.immediateHide,function() {
                core.events.doAction();
            })
            break;
        case "moveHero":
            core.eventMoveHero(data.steps,data.time,function() {
                core.events.doAction();
            });
            break;
        case "changeFloor": // 楼层转换
            var heroLoc = {"x": data.loc[0], "y": data.loc[1]};
            if (core.isset(data.direction)) heroLoc.direction=data.direction;
            core.changeFloor(data.floorId||core.status.floorId, null, heroLoc, data.time, function() {
                core.lockControl();
                core.events.doAction();
            });
            break;
        case "changePos": // 直接更换勇士位置，不切换楼层
            core.clearMap('hero', 0, 0, 416, 416);
            if (core.isset(data.loc)) {
                core.setHeroLoc('x', data.loc[0]);
                core.setHeroLoc('y', data.loc[1]);
            }
            if (core.isset(data.direction)) core.setHeroLoc('direction', data.direction);
            core.drawHero(core.getHeroLoc('direction'), core.getHeroLoc('x'), core.getHeroLoc('y'), 'stop');
            this.doAction();
            break;
        case "setFg": // 颜色渐变
            core.setFg(data.color, data.time, function() {
                core.events.doAction();
            });
            break;
        case "openDoor": // 开一个门，包括暗墙
            var floorId=data.floorId || core.status.floorId;
            var block=core.getBlock(data.loc[0], data.loc[1], floorId);
            if (block!=null) {
                if (floorId==core.status.floorId)
                    core.openDoor(block.block.event.id, block.block.x, block.block.y, false, function() {
                        core.events.doAction();
                    })
                else {
                    core.removeBlock(block.block.x,block.block.y,floorId);
                    this.doAction();
                }
                break;
            }
            this.doAction();
            break;
        case "openShop": // 打开一个全局商店
            core.events.openShop(data.id);
            break;
        case "disableShop": // 禁用一个全局商店
            core.events.disableQuickShop(data.id);
            this.doAction();
            break;
        case "battle": // 强制战斗
            core.battle(data.id,null,null,true,function() {
                core.events.doAction();
            })
            break;
        case "trigger": // 触发另一个事件；当前事件会被立刻结束。需要另一个地点的事件是有效的
            var toX=data.loc[0], toY=data.loc[1];
            var block=core.getBlock(toX, toY);
            if (block!=null) {
                block = block.block;
                if (core.isset(block.event) && block.event.trigger=='action') {
                    // 触发
                    core.status.event.data.list = core.clone(block.event.data);
                    core.status.event.data.x=block.x;
                    core.status.event.data.y=block.y;
                }
            }
            this.doAction();
            break;
        case "playSound":
            core.playSound(data.name);
            this.doAction();
            break;
        case "playBgm":
            core.playBgm(data.name);
            this.doAction();
            break
        case "pauseBgm":
            core.pauseBgm();
            this.doAction();
            break
        case "resumeBgm":
            core.resumeBgm();
            this.doAction();
            break
        case "setValue":
            try {
                var value=core.calValue(data.value);
                // 属性
                if (data.name.indexOf("status:")==0) {
                    value=parseInt(value);
                    core.setStatus(data.name.substring(7), value);
                }
                // 道具
                if (data.name.indexOf("item:")==0) {
                    value=parseInt(value);
                    var itemId=data.name.substring(5);
                    if (value>core.itemCount(itemId)) // 效果
                        core.getItem(itemId,value-core.itemCount(itemId));
                    else core.setItem(itemId, value);
                }
                // flag
                if (data.name.indexOf("flag:")==0) {
                    core.setFlag(data.name.substring(5), value);
                }
            }
            catch (e) {console.log(e)}
            if (core.status.hero.hp<=0) {
                core.status.hero.hp=0;
                core.updateStatusBar();
                core.events.lose('damage');
            }
            else {
                core.updateStatusBar();
                this.doAction();
            }
            break;
        case "if": // 条件判断
            if (core.calValue(data.condition))
                core.events.insertAction(data["true"])
            else
                core.events.insertAction(data["false"])
            this.doAction();
            break;
        case "choices": // 提供选项
            core.ui.drawChoices(data.text, data.choices);
            break;
        case "win":
            core.events.win(data.reason);
            break;
        case "lose":
            core.events.lose(data.reason);
            break;
        case "function":
            var func = data["function"];
            if (core.isset(func)) {
                if ((typeof func == "string") && func.indexOf("function")==0) {
                    eval('('+func+')()');
                }
                else if (func instanceof Function)
                    func();
            }
            this.doAction();
            break;
        case "update":
            core.updateStatusBar();
            this.doAction();
            break;
        case "sleep": // 等待多少毫秒
            setTimeout(function () {
                core.events.doAction();
            }, data.time);
            break;
        case "revisit": // 立刻重新执行该事件
            var block=core.getBlock(x,y); // 重新获得事件
            if (block!=null) {
                block = block.block;
                if (core.isset(block.event) && block.event.trigger=='action') {
                    core.status.event.data.list = core.clone(block.event.data);
                }
            }
            this.doAction();
            break;
        case "exit": // 立刻结束事件
            core.status.event.data.list = [];
            core.events.doAction();
            break;
        default:
            core.status.event.data.type='text';
            core.ui.drawTextBox("\t[警告]出错啦！\n"+data.type+" 事件不被支持...");
    }
    return;
}

////// 往当前事件列表之前添加一个或多个事件 //////
events.prototype.insertAction = function (action) {
    if (core.status.event.id == null) {
        this.doEvents(action);
    }
    else {
        core.unshift(core.status.event.data.list, action)
    }
}

////// 打开商店 //////
events.prototype.openShop = function(shopId, needVisited) {
    var shop = core.status.shops[shopId];
    shop.times = shop.times || 0;
    shop.visited = shop.visited || false;
    if (needVisited && !shop.visited) {
        if (shop.times==0) core.drawTip("该商店尚未开启");
        else core.drawTip("该商店已失效");
        return;
    }
    shop.visited = true;

    var selection = core.status.event.selection;
    core.ui.closePanel();
    core.lockControl();
    // core.status.event = {'id': 'shop', 'data': {'id': shopId, 'shop': shop}};
    core.status.event.id = 'shop';
    core.status.event.data = {'id': shopId, 'shop': shop};
    core.status.event.selection = selection;

    // 拼词
    var content = "\t["+shop.name+","+shop.icon+"]";
    var times = shop.times, need=eval(shop.need);

    content = content + shop.text.replace(/\${([^}]+)}/g, function (word, value) {
        return eval(value);
    });

    var use = shop.use=='experience'?'经验':'金币';

    var choices = [];
    for (var i=0;i<shop.choices.length;i++) {
        var choice = shop.choices[i];
        var text = choice.text;
        if (core.isset(choice.need))
            text += "（"+eval(choice.need)+use+"）"
        choices.push(text);
    }
    choices.push("离开");
    core.ui.drawChoices(content, choices);
}

events.prototype.disableQuickShop = function (shopId) {
    core.status.shops[shopId].visited = false;
}

////// 降低难度 //////

events.prototype.decreaseHard = function() {
    core.drawTip("本塔不支持降低难度！");
    /*
    if (core.status.hard == 0) {
        core.drawTip("当前已是难度0，不能再降低难度了");
        return;
    }
    var add = 100, x=core.status.hard;
    while (x<10) {
        x++; add*=2;
    }
    core.ui.drawConfirmBox("本次操作可生命+" + add + "，确定吗？", function () {
        core.status.hero.hp += add;
        core.status.hard--;
        core.updateStatusBar();
        core.ui.closePanel();
        core.drawTip("降低难度成功，生命+" + add);
    }, function () {
        core.ui.drawSettings(false);
    });
    */
}

////// 能否使用快捷商店 //////
events.prototype.canUseQuickShop = function(shopIndex) {
    if (core.isset(core.floors[core.status.floorId].canUseQuickShop) && !core.isset(core.floors[core.status.floorId].canUseQuickShop))
        return '当前不能使用快捷商店。';

    return null;
}

////// 尝试使用道具 //////
events.prototype.useItem = function(itemId) {
    core.ui.closePanel(false);

    if (itemId=='book') {
        core.openBook(false);
        return;
    }
    if (itemId=='fly') {
        core.useFly(false);
        return;
    }
    if (itemId=='centerFly') {
        core.status.usingCenterFly= true;
        var fillstyle = 'rgba(255,0,0,0.5)';
        if (core.canUseItem('centerFly')) fillstyle = 'rgba(0,255,0,0.5)';
        core.fillRect('ui',(12-core.getHeroLoc('x'))*32,(12-core.getHeroLoc('y'))*32,32,32,fillstyle);
        core.drawTip("请确认当前中心对称飞行器的位置");
        return;
    }

    if (core.canUseItem(itemId))core.useItem(itemId);
    else core.drawTip("当前无法使用"+core.material.items[itemId].name);
}

////// 加点 //////
events.prototype.addPoint = function (enemy) {
    var point = enemy.point;
    if (!core.isset(point) || point<=0) return [];

    // 加点，返回一个choices事件
    return [
        {"type": "choices",
            "choices": [
                {"text": "生命+"+(200*point), "action": [
                    {"type": "setValue", "name": "status:hp", "value": "status:hp+"+(200*point)}
                ]},
                {"text": "攻击+"+(1*point), "action": [
                    {"type": "setValue", "name": "status:atk", "value": "status:atk+"+(1*point)}
                ]},
                {"text": "防御+"+(2*point), "action": [
                    {"type": "setValue", "name": "status:def", "value": "status:def+"+(2*point)}
                ]},
            ]
        }
    ];

}

/****** 打完怪物 ******/
events.prototype.afterBattle = function(enemyId,x,y,callback) {

    // 毒衰咒的处理
    var special = core.material.enemys[enemyId].special;
    // 中毒
    if (core.enemys.hasSpecial(special, 12) && !core.hasFlag('poison')) {
        core.setFlag('poison', true);
    }
    // 衰弱
    if (core.enemys.hasSpecial(special, 13) && !core.hasFlag('weak')) {
        core.setFlag('weak', true);
        core.status.hero.atk-=core.values.weakValue;
        core.status.hero.def-=core.values.weakValue;
    }
    // 诅咒
    if (core.enemys.hasSpecial(special, 14) && !core.hasFlag('curse')) {
        core.setFlag('curse', true);
    }
    // 仇恨属性：减半
    if (core.enemys.hasSpecial(special, 17)) {
        core.setFlag('hatred', parseInt(core.getFlag('hatred', 0)/2));
    }
    // 自爆
    if (core.enemys.hasSpecial(special, 19)) {
        core.status.hero.hp = 1;
    }
    // 增加仇恨值
    core.setFlag('hatred', core.getFlag('hatred',0)+core.values.hatred);
    core.updateStatusBar();


    // 事件的处理
    var todo = [];
    // 如果不为阻击，且该点存在，且有事件
    if (!core.enemys.hasSpecial(special, 18) && core.isset(x) && core.isset(y)) {
        var event = core.floors[core.status.floorId].afterBattle[x+","+y];
        if (core.isset(event)) {
            // 插入事件
            core.unshift(todo, event);
        }
    }
    // 如果有加点
    var point = core.material.enemys[enemyId].point;
    if (core.isset(point) && point>0) {
        core.unshift(todo, core.events.addPoint(core.material.enemys[enemyId]));
    }

    // 如果事件不为空，将其插入
    if (todo.length>0) {
        this.insertAction(todo);
    }

    // 如果已有事件正在处理中
    if (core.status.event.id == null) {
        core.continueAutomaticRoute();
    }
    if (core.isset(callback)) callback();

}

/****** 开完门 ******/
events.prototype.afterOpenDoor = function(doorId,x,y,callback) {

    var todo = [];
    if (core.isset(x) && core.isset(y)) {
        var event = core.floors[core.status.floorId].afterOpenDoor[x+","+y];
        if (core.isset(event)) {
            core.unshift(todo, event);
        }
    }

    if (todo.length>0) {
        this.insertAction(todo);
    }

    if (core.status.event.id == null) {
        core.continueAutomaticRoute();
    }
    if (core.isset(callback)) callback();
}

/****** 经过路障 ******/
events.prototype.passNet = function (data) {
    // 有鞋子
    if (core.hasItem('shoes')) return;
    if (data.event.id=='lavaNet') { // 血网
        core.status.hero.hp -= core.values.lavaDamage;
        if (core.status.hero.hp<=0) {
            core.status.hero.hp=0;
            core.updateStatusBar();
            core.events.lose('lava');
            return;
        }
        core.drawTip('经过血网，生命-'+core.values.lavaDamage);
    }
    if (data.event.id=='poisonNet') { // 毒网
        if (core.hasFlag('poison')) return;
        core.setFlag('poison', true);
    }
    if (data.event.id=='weakNet') { // 衰网
        if (core.hasFlag('weak')) return;
        core.setFlag('weak', true);
        core.status.hero.atk-=core.values.weakValue;
        core.status.hero.def-=core.values.weakValue;
    }
    if (data.event.id=='curseNet') { // 咒网
        if (core.hasFlag('curse')) return;
        core.setFlag('curse', true);
    }
    core.updateStatusBar();
}

events.prototype.changeLight = function(x, y) {
    var block = core.getBlock(x, y);
    if (block==null) return;
    var index = block.index;
    block = block.block;
    if (block.event.id != 'light') return;
    // 改变为dark
    block.id = 166;
    block.event = {'cls': 'terrains', 'id': 'darkLight', 'noPass': true};
    // 更新地图
    core.canvas.event.clearRect(x * 32, y * 32, 32, 32);
    var blockIcon = core.material.icons[block.event.cls][block.event.id];
    core.canvas.event.drawImage(core.material.images[block.event.cls], 0, blockIcon * 32, 32, 32, block.x * 32, block.y * 32, 32, 32);
    this.afterChangeLight(x,y);
}

// 改变灯后的事件
events.prototype.afterChangeLight = function(x,y) {

}

// 使用炸弹/圣锤后的事件
events.prototype.afterUseBomb = function () {


}

// 存档事件前一刻的处理
events.prototype.beforeSaveData = function(data) {

}

// 读档事件后，载入事件前，对数据的处理
events.prototype.afterLoadData = function(data) {

}


/******************************************/
/*********** 界面上的点击事件 ***************/
/******************************************/

events.prototype.keyDownCtrl = function () {
    if (core.status.event.id=='text') {
        core.drawText();
        return;
    }
    if (core.status.event.id=='action' && core.status.event.data.type=='text') {
        this.doAction();
        return;
    }
}

events.prototype.clickConfirmBox = function (x,y) {
    if ((x == 4 || x == 5) && y == 7 && core.isset(core.status.event.data.yes))
        core.status.event.data.yes();
    if ((x == 7 || x == 8) && y == 7 && core.isset(core.status.event.data.no))
        core.status.event.data.no();
}

events.prototype.keyUpConfirmBox = function (keycode) {
    if (keycode==37) {
        core.status.event.selection=0;
        core.ui.drawConfirmBox(core.status.event.ui, core.status.event.data.yes, core.status.event.data.no);
    }

    if (keycode==39) {
        core.status.event.selection=1;
        core.ui.drawConfirmBox(core.status.event.ui, core.status.event.data.yes, core.status.event.data.no);
    }

    if (keycode==13 || keycode==32 || keycode==67) {
        if (core.status.event.selection==0 && core.isset(core.status.event.data.yes)) {
            core.status.event.selection=null;
            core.status.event.data.yes();
        }
        if (core.status.event.selection==1 && core.isset(core.status.event.data.no)) {
            core.status.event.selection=null;
            core.status.event.data.no();
        }
    }
}

// 正在处理事件时的点击操作...
events.prototype.clickAction = function (x,y) {

    if (core.status.event.data.type=='text') {
        // 文字
        this.doAction();
        return;
    }
    if (core.status.event.data.type=='choices') {
        // 选项
        var data = core.status.event.data.current;
        var choices = data.choices;
        if (choices.length==0) return;
        if (x >= 5 && x <= 7) {
            var topIndex = 6 - parseInt((choices.length - 1) / 2);
            if (y>=topIndex && y<topIndex+choices.length) {
                this.insertAction(choices[y-topIndex].action);
                this.doAction();
            }
        }
    }
}

events.prototype.keyDownAction = function (keycode) {
    if (core.status.event.data.type=='choices') {
        var data = core.status.event.data.current;
        var choices = data.choices;
        if (choices.length>0) {
            if (keycode==38) {
                core.status.event.selection--;
                if (core.status.event.selection<0) core.status.event.selection=0;
                core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
            }
            if (keycode==40) {
                core.status.event.selection++;
                if (core.status.event.selection>=choices.length) core.status.event.selection=choices.length-1;
                core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
            }
        }
    }
}

events.prototype.keyUpAction = function (keycode) {
    if (core.status.event.data.type=='text' && (keycode==13 || keycode==32 || keycode==67)) {
        this.doAction();
        return;
    }
    if (core.status.event.data.type=='choices') {
        var data = core.status.event.data.current;
        var choices = data.choices;
        if (choices.length>0) {
            if (keycode==13 || keycode==32 || keycode==67) {
                this.insertAction(choices[core.status.event.selection].action);
                this.doAction();
            }
        }
    }
}

// 怪物手册
events.prototype.clickBook = function(x,y) {
    // 上一页
    if ((x == 3 || x == 4) && y == 12) {
        core.ui.drawEnemyBook(core.status.event.data - 1);
    }
    // 下一页
    if ((x == 8 || x == 9) && y == 12) {
        core.ui.drawEnemyBook(core.status.event.data + 1);
    }
    // 返回
    if (x>=10 && x<=12 && y==12) {
        core.ui.closePanel(true);
    }
    return;
}

events.prototype.keyDownBook = function (keycode) {
    if (keycode==37 || keycode==38) core.ui.drawEnemyBook(core.status.event.data - 1);
    else if (keycode==39 || keycode==40) core.ui.drawEnemyBook(core.status.event.data + 1);
    return;
}

events.prototype.keyUpBook = function (keycode) {
    if (keycode==27 || keycode==88) {
        core.ui.closePanel(true);
        return;
    }
}

events.prototype.clickFly = function(x,y) {
    if ((x==10 || x==11) && y==9) core.ui.drawFly(core.status.event.data-1);
    if ((x==10 || x==11) && y==5) core.ui.drawFly(core.status.event.data+1);
    if (x>=5 && x<=7 && y==12) core.ui.closePanel();
    if (x>=0 && x<=9 && y>=3 && y<=11) {
        var index=core.status.hero.flyRange.indexOf(core.status.floorId);
        var stair=core.status.event.data<index?"upFloor":"downFloor";
        var floorId=core.status.event.data;
        core.changeFloor(core.status.hero.flyRange[floorId], stair);
        core.ui.closePanel();
    }
    return;
}

events.prototype.keyDownFly = function (keycode) {
    if (keycode==37 || keycode==38) core.ui.drawFly(core.status.event.data+1);
    else if (keycode==39 || keycode==40) core.ui.drawFly(core.status.event.data-1);
    return;
}

events.prototype.keyUpFly = function (keycode) {
    if (keycode==71 || keycode==27 || keycode==88)
        core.ui.closePanel();
    if (keycode==13 || keycode==32 || keycode==67)
        this.clickFly(5,5);
    return;
}

// 商店
events.prototype.clickShop = function(x,y) {
    var shop = core.status.event.data.shop;
    var choices = shop.choices;
    if (x >= 5 && x <= 7) {
        var topIndex = 6 - parseInt(choices.length / 2);
        if (y>=topIndex && y<topIndex+choices.length) {
            //this.insertAction(choices[y-topIndex].action);
            //this.doAction();
            var money = core.getStatus('money'), experience = core.getStatus('experience');
            var times = shop.times, need = eval(shop.need);
            var use = shop.use;
            var use_text = use=='money'?"金币":"经验";

            var choice = choices[y-topIndex];
            if (core.isset(choice.need))
                need = eval(choice.need);

            if (need > eval(use)) {
                core.drawTip("你的"+use_text+"不足");
                return;
            }

            eval(use+'-='+need);

            core.setStatus('money', money);
            core.setStatus('experience', experience);

            // 更新属性
            choice.effect.split(";").forEach(function (t) {
                core.doEffect(t);
            });
            core.updateStatusBar();
            shop.times++;
            this.openShop(core.status.event.data.id);
        }
        // 离开
        else if (y==topIndex+choices.length) {
            core.status.boxAnimateObjs = [];
            core.setBoxAnimate();
            if (core.status.event.data.fromList)
                core.ui.drawQuickShop();
            else core.ui.closePanel();
        }
    }
}

events.prototype.keyDownShop = function (keycode) {
    var shop = core.status.event.data.shop;
    var choices = shop.choices;
    if (keycode==38) {
        core.status.event.selection--;
        if (core.status.event.selection<0) core.status.event.selection=0;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
    if (keycode==40) {
        core.status.event.selection++;
        if (core.status.event.selection>choices.length) core.status.event.selection=choices.length;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
}

events.prototype.keyUpShop = function (keycode) {
    if (keycode==27 || keycode==88) {
        if (core.status.event.data.fromList) {
            core.status.boxAnimateObjs = [];
            core.setBoxAnimate();
            core.ui.drawQuickShop();
        }
        else
            core.ui.closePanel();
        return;
    }
    var shop = core.status.event.data.shop;
    var choices = shop.choices;
    if (keycode==13 || keycode==32 || keycode==67) {
        var topIndex = 6 - parseInt(choices.length / 2);
        this.clickShop(6, topIndex+core.status.event.selection);
    }
    return;
}

// 快捷商店
events.prototype.clickQuickShop = function(x, y) {
    var shopList = core.status.shops, keys = Object.keys(shopList);
    if (x >= 5 && x <= 7) {
        var topIndex = 6 - parseInt(keys.length / 2);
        if (y>=topIndex && y<topIndex+keys.length) {
            var reason = core.events.canUseQuickShop(y-topIndex);
            if (core.isset(reason)) {
                core.drawText(reason);
                return;
            }
            this.openShop(keys[y - topIndex], true);
            if (core.status.event.id=='shop')
                core.status.event.data.fromList = true;
        }
        // 离开
        else if (y==topIndex+keys.length)
            core.ui.closePanel();
    }
}

events.prototype.keyDownQuickShop = function (keycode) {
    var shopList = core.status.shops, keys = Object.keys(shopList);
    if (keycode==38) {
        core.status.event.selection--;
        if (core.status.event.selection<0) core.status.event.selection=0;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
    if (keycode==40) {
        core.status.event.selection++;
        if (core.status.event.selection>keys.length) core.status.event.selection=keys.length;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
}

events.prototype.keyUpQuickShop = function (keycode) {
    if (keycode==27 || keycode==75 || keycode==88) {
        core.ui.closePanel();
        return;
    }
    var shopList = core.status.shops, keys = Object.keys(shopList);
    if (keycode==13 || keycode==32 || keycode==67) {
        var topIndex = 6 - parseInt(keys.length / 2);
        this.clickQuickShop(6, topIndex+core.status.event.selection);
    }
    return;
}

// 工具栏
events.prototype.clickToolbox = function(x,y) {
    // 返回
    if (x>=10 && x<=12 && y==12) {
        core.ui.closePanel(false);
        return;
    }
    var index=0;
    if (y==4||y==5||y==9||y==10) index=parseInt(x/2);
    else index=6+parseInt(x/2);
    if (y>=9) index+=100;
    this.clickToolboxIndex(index);
}

events.prototype.clickToolboxIndex = function(index) {
    var items = null;
    var ii=index;
    if (ii<100)
        items = Object.keys(core.status.hero.items.tools).sort();
    else {
        ii-=100;
        items = Object.keys(core.status.hero.items.constants).sort();
    }
    if (items==null) return;
    if (ii>=items.length) return;
    var itemId=items[ii];
    if (itemId==core.status.event.data) {
        core.events.useItem(itemId);
    }
    else {
        core.ui.drawToolbox(index);
    }
}

events.prototype.keyDownToolbox = function (keycode) {
    if (!core.isset(core.status.event.data)) return;

    var tools = Object.keys(core.status.hero.items.tools).sort();
    var constants = Object.keys(core.status.hero.items.constants).sort();
    var index=core.status.event.selection;

    if (keycode==37) { // left
        if ((index>0 && index<100) || index>100) {
            this.clickToolboxIndex(index-1);
            return;
        }
        if (index==100 && tools.length>0) {
            this.clickToolboxIndex(tools.length-1);
            return;
        }
    }
    if (keycode==38) { // up
        if ((index>5 && index<100) || index>105) {
            this.clickToolboxIndex(index-6);
            return;
        }
        if (index>=100 && index<=105) {
            if (tools.length>6) {
                this.clickToolboxIndex(Math.min(tools.length-1, index-100+6));
            }
            else if (tools.length>0) {
                this.clickToolboxIndex(Math.min(tools.length-1, index-100));
            }
            return;
        }
    }
    if (keycode==39) { // right
        if ((index<tools.length-1) || (index>=100 && index<constants.length+100)) {
            this.clickToolboxIndex(index+1);
            return;
        }
        if (index==tools.length-1 && constants.length>0) {
            this.clickToolboxIndex(100);
            return;
        }
    }
    if (keycode==40) { // down
        if (index<=5) {
            if (tools.length>6) {
                this.clickToolboxIndex(Math.min(tools.length-1, index+6));
            }
            else if (constants.length>0) {
                this.clickToolboxIndex(100+Math.min(constants.length-1, index));
            }
            return;
        }
        if (index>5 && index<100 && constants.length>0) {
            this.clickToolboxIndex(100+Math.min(constants.length-1, index-6));
            return;
        }
        if (index>=100 && index<=105 && constants.length>6) {
            this.clickToolboxIndex(Math.min(100+constants.length-1, index+6));
            return;
        }
    }
}

events.prototype.keyUpToolbox = function (keycode) {
    if (keycode==84 || keycode==27 || keycode==88) {
        core.ui.closePanel();
        return;
    }
    if (!core.isset(core.status.event.data)) return;

    if (keycode==13 || keycode==32 || keycode==67) {
        this.clickToolboxIndex(core.status.event.selection);
        return;
    }
}

// 存读档
events.prototype.clickSL = function(x,y) {
    // 上一页
    if ((x == 3 || x == 4) && y == 12) {
        core.ui.drawSLPanel(core.status.event.data - 6);
    }
    // 下一页
    if ((x == 8 || x == 9) && y == 12) {
        core.ui.drawSLPanel(core.status.event.data + 6);
    }
    // 返回
    if (x>=10 && x<=12 && y==12) {
        core.ui.closePanel(false);
        if (!core.isPlaying()) {
            core.showStartAnimate();
        }
        return;
    }

    var page=parseInt((core.status.event.data-1)/6);
    var index=6*page+1;
    if (y>=1 && y<=4) {
        if (x>=1 && x<=3) core.doSL(index, core.status.event.id);
        if (x>=5 && x<=7) core.doSL(index+1, core.status.event.id);
        if (x>=9 && x<=11) core.doSL(index+2, core.status.event.id);
    }
    if (y>=7 && y<=10) {
        if (x>=1 && x<=3) core.doSL(index+3, core.status.event.id);
        if (x>=5 && x<=7) core.doSL(index+4, core.status.event.id);
        if (x>=9 && x<=11) core.doSL(index+5, core.status.event.id);
    }
}

events.prototype.keyDownSL = function(keycode) {
    if (keycode==37) { // left
        core.ui.drawSLPanel(core.status.event.data - 1);
        return;
    }
    if (keycode==38) { // up
        core.ui.drawSLPanel(core.status.event.data - 3);
        return;
    }
    if (keycode==39) { // right
        core.ui.drawSLPanel(core.status.event.data + 1);
        return;
    }
    if (keycode==40) { // down
        core.ui.drawSLPanel(core.status.event.data + 3);
        return;
    }
    if (keycode==33) { // PAGEUP
        core.ui.drawSLPanel(core.status.event.data - 6);
        return;
    }
    if (keycode==34) { // PAGEDOWN
        core.ui.drawSLPanel(core.status.event.data + 6);
        return;
    }
}

events.prototype.keyUpSL = function (keycode) {
    if (keycode==27 || keycode==88 || (core.status.event.id == 'save' && keycode==83) || (core.status.event.id == 'load' && keycode==68)) {
        core.ui.closePanel();
        if (!core.isPlaying()) {
            core.showStartAnimate();
        }
        return;
    }
    if (keycode==13 || keycode==32 || keycode==67) {
        core.doSL(core.status.event.data, core.status.event.id);
        return;
    }
}

events.prototype.clickSwitchs = function (x,y) {
    if (x<5 || x>7) return;
    var choices = [
        "背景音乐", "背景音效", "战斗动画", "怪物显伤", "领域显伤", "返回主菜单"
    ];
    var topIndex = 6 - parseInt((choices.length - 1) / 2);
    if (y>=topIndex && y<topIndex+choices.length) {
        var selection = y-topIndex;
        switch (selection) {
            case 0:
                core.musicStatus.bgmStatus = !core.musicStatus.bgmStatus;
                if (core.musicStatus.bgmStatus)
                    core.resumeBgm();
                else
                    core.pauseBgm();
                core.setLocalStorage('bgmStatus', core.musicStatus.bgmStatus);
                core.ui.drawSwitchs();
                break;
            case 1:
                core.musicStatus.soundStatus = !core.musicStatus.soundStatus;
                core.setLocalStorage('soundStatus', core.musicStatus.soundStatus);
                core.ui.drawSwitchs();
                break;
            case 2:
                if (!core.flags.canOpenBattleAnimate) {
                    core.drawTip("本塔不能开启战斗动画！");
                }
                else {
                    core.flags.battleAnimate=!core.flags.battleAnimate;
                    core.setLocalStorage('battleAnimate', core.flags.battleAnimate);
                    core.ui.drawSwitchs();
                }
                break;
            case 3:
                core.flags.displayEnemyDamage=!core.flags.displayEnemyDamage;
                core.updateFg();
                core.setLocalStorage('enemyDamage', core.flags.displayEnemyDamage);
                core.ui.drawSwitchs();
                break;
            case 4:
                core.flags.displayExtraDamage=!core.flags.displayExtraDamage;
                core.updateFg();
                core.setLocalStorage('extraDamage', core.flags.displayExtraDamage);
                core.ui.drawSwitchs();
                break;
            case 5:
                core.status.event.selection=0;
                core.ui.drawSettings(false);
                break;
        }
    }
}

events.prototype.keyDownSwitchs = function (keycode) {
    var choices = [
        "背景音乐", "背景音效", "战斗动画", "怪物显伤", "领域显伤", "返回主菜单"
    ];
    if (keycode==38) {
        core.status.event.selection--;
        if (core.status.event.selection<0) core.status.event.selection=0;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
    if (keycode==40) {
        core.status.event.selection++;
        if (core.status.event.selection>=choices.length) core.status.event.selection=choices.length-1;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
}

events.prototype.keyUpSwitchs = function (keycode) {
    if (keycode==27 || keycode==88) {
        core.status.event.selection=0;
        core.ui.drawSettings(false);
        return;
    }
    var choices = [
        "背景音乐", "背景音效", "战斗动画", "怪物显伤", "领域显伤", "返回主菜单"
    ];
    if (keycode==13 || keycode==32 || keycode==67) {
        var topIndex = 6 - parseInt((choices.length - 1) / 2);
        this.clickSwitchs(6, topIndex+core.status.event.selection);
    }
}


// 菜单栏
events.prototype.clickSettings = function (x,y) {
    if (x<5 || x>7) return;
    var choices = [
        "系统设置", "快捷商店", "同步存档", "重新开始", "操作帮助", "关于本塔", "返回游戏"
    ];
    var topIndex = 6 - parseInt((choices.length - 1) / 2);
    if (y>=topIndex && y<topIndex+choices.length) {
        var selection = y-topIndex;

        switch (selection) {
            case 0:
                core.status.event.selection=0;
                core.ui.drawSwitchs();
                break;
            case 1:
                core.status.event.selection=0;
                core.ui.drawQuickShop();
                break;
            case 2:
                core.status.event.selection=0;
                core.ui.drawSyncSave();
                break;
            case 3:
                core.status.event.selection=1;
                core.ui.drawConfirmBox("你确定要重新开始吗？", function () {
                    core.ui.closePanel();
                    core.restart();
                }, function () {
                    core.status.event.selection=3;
                    core.ui.drawSettings(false);
                });
                break;
            case 4:
                core.ui.drawHelp();
                break;
            case 5:
                core.ui.drawAbout();
                break;
            case 6:
                core.ui.closePanel();
                break;
        }
    }
    return;
}

events.prototype.keyDownSettings = function (keycode) {
    var choices = [
        "系统设置", "快捷商店", "同步存档", "重新开始", "操作帮助", "关于本塔", "返回游戏"
    ];
    if (keycode==38) {
        core.status.event.selection--;
        if (core.status.event.selection<0) core.status.event.selection=0;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
    if (keycode==40) {
        core.status.event.selection++;
        if (core.status.event.selection>=choices.length) core.status.event.selection=choices.length-1;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
}

events.prototype.keyUpSettings = function (keycode) {
    if (keycode==27 || keycode==88) {
        core.ui.closePanel();
        return;
    }
    var choices = [
        "系统设置", "快捷商店", "同步存档", "重新开始", "操作帮助", "关于本塔", "返回游戏"
    ];
    if (keycode==13 || keycode==32 || keycode==67) {
        var topIndex = 6 - parseInt((choices.length - 1) / 2);
        this.clickSettings(6, topIndex+core.status.event.selection);
    }
}

events.prototype.clickSyncSave = function (x,y) {
    if (x<5 || x>7) return;
    var choices = [
        "同步存档到服务器", "从服务器加载存档", "清空本地存档", "返回主菜单"
    ];
    var topIndex = 6 - parseInt((choices.length - 1) / 2);
    if (y>=topIndex && y<topIndex+choices.length) {
        var selection = y-topIndex;
        switch (selection) {
            case 0:
                core.syncSave("save");
                break;
            case 1:
                core.syncSave("load");
                break;
            case 2:
                core.status.event.selection=1;
                core.ui.drawConfirmBox("你确定要清空所有本地存档吗？", function() {
                    localStorage.clear();
                    core.drawText("\t[操作成功]你的本地所有存档已被清空。");
                }, function() {
                    core.status.event.selection=2;
                    core.ui.drawSyncSave(false);
                })
                break;
            case 3:
                core.status.event.selection=2;
                core.ui.drawSettings(false);
                break;

        }
    }
    return;
}

events.prototype.keyDownSyncSave = function (keycode) {
    var choices = [
        "同步存档到服务器", "从服务器加载存档", "清空本地存档", "返回主菜单"
    ];
    if (keycode==38) {
        core.status.event.selection--;
        if (core.status.event.selection<0) core.status.event.selection=0;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
    if (keycode==40) {
        core.status.event.selection++;
        if (core.status.event.selection>=choices.length) core.status.event.selection=choices.length-1;
        core.ui.drawChoices(core.status.event.ui.text, core.status.event.ui.choices);
    }
}

events.prototype.keyUpSyncSave = function (keycode) {
    if (keycode==27 || keycode==88) {
        core.status.event.selection=2;
        core.ui.drawSettings(false);
        return;
    }
    var choices = [
        "同步存档到服务器", "从服务器加载存档", "清空本地存档", "返回主菜单"
    ];
    if (keycode==13 || keycode==32 || keycode==67) {
        var topIndex = 6 - parseInt((choices.length - 1) / 2);
        this.clickSyncSave(6, topIndex+core.status.event.selection);
    }
}

events.prototype.clickAbout = function () {
    if (core.isPlaying())
        core.ui.closePanel(false);
    else
        core.showStartAnimate();
}

/*********** 点击事件 END ***************/
