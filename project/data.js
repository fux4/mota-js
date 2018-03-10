data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d = 
{
    "main" : {
        "floorIds" : [ 
            "sample0", "sample1", "sample2"
        ],// 在这里按顺序放所有的楼层；其顺序直接影响到楼层传送器的顺序和上楼器/下楼器的顺序
        "pngs" : [ 
            "bg", // 在此存放所有可能使用的图片，只能是png格式，可以不写后缀名
            // 图片可以被作为背景图（的一部分），也可以直接用自定义事件进行显示。
            // 图片名不能使用中文，不能带空格或特殊字符；可以直接改名拼音就好
            // 建议对于较大的图片，在网上使用在线的“图片压缩工具(http://compresspng.com/zh/)”来进行压缩，以节省流量
            // 依次向后添加
        ],
        "animates" : [ 
            "hand", "sword", "zone", "yongchang", // "jianji", "thunder" 
            // 在此存放所有可能使用的动画，必须是animate格式，在这里不写后缀名
            // 动画必须放在animates目录下；文件名不能使用中文，不能带空格或特殊字符
            // 根据需求自行添加
        ],
        "bgms" : [ 
            'bgm.mp3', 'qianjin.mid', 'star.mid',
            // 在此存放所有的bgm，和文件名一致。第一项为默认播放项
            // 音频名不能使用中文，不能带空格或特殊字符；可以直接改名拼音就好
        ],
        "sounds" : [ 
            'floor.mp3', 'attack.ogg', 'door.ogg', 'item.ogg', 'zone.ogg'
            // 在此存放所有的SE，和文件名一致
            // 音频名不能使用中文，不能带空格或特殊字符；可以直接改名拼音就好
        ],
        "bgmRemote" : false, // 是否使用远程的背景音乐；此项一般不要开启
        "startBackground" : "bg.png",// 标题界面的背景,建议使用jpg格式以压缩背景图空间
        "startLogoStyle" : "color: black",// 标题样式:可以改变颜色，也可以隐藏标题（如果背景图自带）
        "levelChoose" : [["简单","Easy"],["普通","Normal"],["困难","Hard"],["噩梦","Hell"]],
        //难度选择:每个数组的第一个是其在标题界面显示的难度,第二个是在游戏内部传输的字符串,会显示在状态栏,修改此处后需要在project/functions中作相应更改
    },
    "firstData" : {
        "title": "魔塔样板", // 游戏名，将显示在标题页面以及切换楼层的界面中
        "name": "template", // 游戏的唯一英文标识符。由英文、数字、下划线组成，不能超过20个字符。
        "version": "Ver 1.4.1", // 当前游戏版本；版本不一致的存档不能通用。
        "floorId": "sample0", // 初始楼层ID
        "hero": { 
            "name": "阳光", // 勇士初始数据
            // 勇士名；可以改成喜欢的
            'lv': 1, // 初始等级，该项必须为正整数
            "hp": 1000, // 初始生命值
            "atk": 100, // 初始攻击
            "def": 100, // 初始防御
            "mdef": 100, // 初始魔防
            "money": 100, // 初始金币
            "experience": 0, // 初始经验
            "items": { 
                "keys": {
                    "yellowKey": 0,
                    "blueKey": 0,
                    "redKey": 0
                },
                "constants": {},
                "tools": {}
            },// 初始道具个数
            "flyRange": [], // 初始可飞的楼层；一般留空数组即可
            "loc": {"direction": "up", "x": 6, "y": 10}, // 勇士初始位置
            "flags": { 
                "poison": false, // 游戏过程中的变量或flags
                // 毒
                "weak": false, // 衰
                "curse": false, // 咒
            },
            "steps": 0, // 行走步数统计
        },
        "startText": [ 
            "Hi，欢迎来到 HTML5 魔塔样板！\n\n本样板由艾之葵制作，可以让你在不会写任何代码\n的情况下也能做出属于自己的H5魔塔！",
            "这里游戏开始时的剧情。\n定义在data.js的startText处。\n\n你可以在这里写上自己的内容。",
            "赶快来试一试吧！"
        ], // 游戏开始前剧情。如果无剧情直接留一个空数组即可。
        "shops": [ // 定义全局商店（即快捷商店）
            {
                "id": "moneyShop1", // 商店唯一ID
                "name": "贪婪之神", // 商店名称（标题）
                "icon": "blueShop", // 商店图标，在icons.js中的npc一项定义
                "textInList": "1F金币商店", // 在快捷商店栏中显示的名称
                "use": "money", // 商店所要使用的。只能是"money"或"experience"。
                "need": "20+10*times*(times+1)",  // 商店需要的金币/经验数值；可以是一个表达式，以times作为参数计算。
                // 这里用到的times为该商店的已经的访问次数。首次访问该商店时times的值为0。
                // 上面的例子是50层商店的计算公式。你也可以写任意其他的计算公式，只要以times作为参数即可。
                // 例如： "need": "25" 就是恒定需要25金币的商店； "need": "20+2*times" 就是第一次访问要20金币，以后每次递增2金币的商店。
                // 如果是对于每个选项有不同的计算公式，写 "need": "-1" 即可。可参见下面的经验商店。
                "text": "勇敢的武士啊，给我${need}金币就可以：", // 显示的文字，需手动加换行符。可以使用${need}表示上面的need值。
                "choices": [ // 商店的选项
                    {"text": "生命+800", "effect": "status:hp+=800"},
                    // 如果有多个effect以分号分开，参见下面的经验商店
                    {"text": "攻击+4", "effect": "status:atk+=4"},
                    {"text": "防御+4", "effect": "status:def+=4"},
                    {"text": "魔防+10", "effect": "status:mdef+=10"}
                    // effect只能对status和item进行操作，不能修改flag值。
                    // 必须是X+=Y的形式，其中Y可以是一个表达式，以status:xxx或item:xxx为参数
                    // 其他effect样例：
                    // "item:yellowKey+=1" 黄钥匙+1
                    // "item:pickaxe+=3" 破墙镐+3
                    // "status:hp+=2*(status:atk+status:def)" 将生命提升攻防和的数值的两倍
                ]
            },
            {
                "id": "expShop1", // 商店唯一ID
                "name": "经验之神",
                "icon": "pinkShop",
                "textInList": "1F经验商店",
                "use": "experience", // 该商店使用的是经验进行计算
                "need": "-1", // 如果是对于每个选项所需要的数值不同，这里直接写-1，然后下面选项里给定具体数值
                "text": "勇敢的武士啊，给我若干经验就可以：",
                "choices": [
                    // 在choices中写need，可以针对每个选项都有不同的需求。
                    // 这里的need同样可以以times作为参数，比如 "need": "100+20*times"
                    {"text": "等级+1", "need": "100", "effect": "status:lv+=1;status:hp+=1000;status:atk+=7;status:def+=7"},
                    // 多个effect直接以分号分开即可。如上面的意思是生命+1000，攻击+7，防御+7。
                    {"text": "攻击+5", "need": "30", "effect": "status:atk+=5"},
                    {"text": "防御+5", "need": "30", "effect": "status:def+=5"},
                ]
            }
        ],
        "levelUp": [ 
            {}, // 经验升级所需要的数值，是一个数组
            // 第一项为初始等级，可以简单留空，也可以写name

            // 每一个里面可以含有三个参数 need, name, effect
            // need为所需要的经验数值，是一个正整数。请确保need所需的依次递增
            // name为该等级的名称，也可以省略代表使用系统默认值；本项将显示在状态栏中
            // effect为本次升级所执行的操作，可由若干项组成，由分号分开
            // 其中每一项写法和上面的商店完全相同，同样必须是X+=Y的形式，Y是一个表达式，同样可以使用status:xxx或item:xxx代表勇士的某项数值/道具个数
            {"need": 20, "name": "第二级", "effect": "status:hp+=2*(status:atk+status:def);status:atk+=10;status:def+=10"}, // 先将生命提升攻防和的2倍；再将攻击+10，防御+10

            
            {"need": 40, "effect": function () {
                core.insertAction("恭喜升级！");
                core.status.hero.hp *= 2;
                core.status.hero.atk += 100;
                core.status.hero.def += 100;
            }}, // effect也允许写一个function，代表本次升级将会执行的操作

            // 依次往下写需要的数值即可
        ]
    },
    
    "values" : { // 各种数值；一些数值可以在这里设置
        /****** 角色相关 ******/
        "HPMAX": 999999, // HP上限；-1则无上限
        "lavaDamage": 100, // 经过血网受到的伤害
        "poisonDamage": 10, // 中毒后每步受到的伤害
        "weakValue": 20, // 衰弱状态下攻防减少的数值
        /****** 道具相关 ******/
        "redJewel": 3, // 红宝石加攻击的数值
        "blueJewel": 3, // 蓝宝石加防御的数值
        "greenJewel": 5, // 绿宝石加魔防的数值
        "redPotion": 100, // 红血瓶加血数值
        "bluePotion": 250, // 蓝血瓶加血数值
        "yellowPotion": 500, // 黄血瓶加血数值
        "greenPotion": 800, // 绿血瓶加血数值
        "sword0": 0, // 默认装备折断的剑的攻击力
        "shield0": 0, // 默认装备残破的盾的防御力
        "sword1": 10, // 铁剑加攻数值
        "shield1": 10, // 铁盾加防数值
        "sword2": 20, // 银剑加攻数值
        "shield2": 20, // 银盾加防数值
        "sword3": 40, // 骑士剑加攻数值
        "shield3": 40, // 骑士盾加防数值
        "sword4": 80, // 圣剑加攻数值
        "shield4": 80, // 圣盾加防数值
        "sword5": 160, // 神圣剑加攻数值
        "shield5": 160, // 神圣盾加防数值
        "moneyPocket": 500, // 金钱袋加金币的数值
        /****** 怪物相关 ******/
        'breakArmor': 0.9, // 破甲的比例（战斗前，怪物附加角色防御的x%作为伤害）
        'counterAttack': 0.1, // 反击的比例（战斗时，怪物每回合附加角色攻击的x%作为伤害，无视角色防御）
        'purify': 3, // 净化的比例（战斗前，怪物附加勇士魔防的x倍作为伤害）
        'hatred': 2, // 仇恨属性中，每杀死一个怪物获得的仇恨值
        /****** 系统相关 ******/
        'animateSpeed': 500, // 动画时间
    },
    
    "flags" : { // 系统FLAG，在游戏运行中中请不要修改它。
        /****** 状态栏相关 ******/
        "enableFloor": true, // 是否在状态栏显示当前楼层
        "enableLv": true, // 是否在状态栏显示当前等级
        "enableMDef": true, // 是否在状态栏及战斗界面显示魔防（护盾）
        "enableMoney": true, // 是否在状态栏、怪物手册及战斗界面显示金币
        "enableExperience": true, // 是否在状态栏、怪物手册及战斗界面显示经验
        "enableLevelUp": true, // 是否允许等级提升（进阶）；如果上面enableExperience为false，则此项恒视为false
        "enableDebuff": true, // 是否涉及毒衰咒；如果此项为false则不会在状态栏中显示毒衰咒的debuff
        ////// 上述的几个开关将直接影响状态栏的显示效果 //////
        /****** 道具相关 ******/
        "flyNearStair": true, // 是否需要在楼梯边使用传送器
        "pickaxeFourDirections": true, // 使用破墙镐是否四个方向都破坏；如果false则只破坏面前的墙壁
        "bombFourDirections": true, // 使用炸弹是否四个方向都会炸；如果false则只炸面前的怪物（即和圣锤等价）
        "bigKeyIsBox": false, // 如果此项为true，则视为钥匙盒，红黄蓝钥匙+1；若为false，则视为大黄门钥匙
        "equipment": false, // 剑和盾是否直接作为装备。如果此项为true，则作为装备，需要在道具栏使用，否则将直接加属性。
        "enableDeleteItem": true, // 是否允许删除（丢弃）道具
        /****** 怪物相关 ******/
        "enableAddPoint": false, // 是否支持加点
        "enableNegativeDamage": true, // 是否支持负伤害（回血）
        "hatredDecrease": true, // 是否在和仇恨怪战斗后减一半的仇恨值，此项为false则和仇恨怪不会扣减仇恨值。
        "betweenAttackCeil": false, // 夹击方式是向上取整还是向下取整。如果此项为true则为向上取整，为false则为向下取整
        /****** 系统相关 ******/
        "startDirectly": false, // 点击“开始游戏”后是否立刻开始游戏而不显示难度选择界面
        "canOpenBattleAnimate": true, // 是否允许用户开启战斗过程；如果此项为false，则下面两项均强制视为false
        "showBattleAnimateConfirm": true, // 是否在游戏开始时提供“是否开启战斗动画”的选项
        "battleAnimate": true, // 是否默认显示战斗动画；用户可以手动在菜单栏中开关
        "displayEnemyDamage": true, // 是否地图怪物显伤；用户可以手动在菜单栏中开关
        "displayExtraDamage": true, // 是否地图高级显伤（领域、夹击等）；用户可以手动在菜单栏中开关
        "enableGentleClick": true, // 是否允许轻触（获得面前物品）
        "potionWhileRouting": false, // 寻路算法是否经过血瓶；如果该项为false，则寻路算法会自动尽量绕过血瓶
        "enableViewMaps": true, // 是否支持在菜单栏中查看所有楼层的地图
        "portalWithoutTrigger": true, // 是否支持穿透。所谓穿透，即当自动寻路经过楼梯时，不触发楼层转换事件而是穿过它。
        "enableMoveDirectly": true, // 是否允许瞬间移动
    }
}