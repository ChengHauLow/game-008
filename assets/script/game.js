// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
        knifeNode: cc.Node,
        knifePrefab: cc.Prefab,
        loseNode:cc.Node,
        winNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.canThrow = true;
        this.targetNode.zIndex = 1;
        this.targetRotation = 2;
        this.knifeNodeArr = [];
        this.knifeThrow = 0;
        this.knifeDrop = 0;

        setInterval(() => {
            this.changeSpeed();
        }, 2000);

        this.node.on('touchstart', this.throwKnife, this);
    },
    onDestroy () {
        this.node.off('touchstart', this.throwKnife, this);
    },

    randomNo(min, max){
        return Math.floor(Math.random() * (max - min)) + min;
    },

    changeSpeed(){
        let dir = Math.random() > 0.8 ? 1 : -1;
        let speed = 1 + Math.random()*3;
        this.targetRotation = dir * speed;
    },

    throwKnife(){
        // console.log(this.randomNo(0, 10));
        if(this.randomNo(0, 10) == 9){
            this.targetNode.runAction(cc.sequence(
                cc.moveTo(0.5, cc.v2(this.targetNode.x + this.randomNo(-100, 100), this.targetNode.y)),
                cc.moveTo(0.5, cc.v2(this.targetNode.x, this.targetNode.y)),
                cc.callFunc(()=>{
                    console.log('Wohoo');
                })
            ))
        }
        if(this.canThrow){
            this.canThrow = false;
            this.knifeThrow += 1;
            console.log(this.knifeThrow);
            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.15, cc.v2(this.knifeNode.x, this.targetNode.y-this.targetNode.width/2)),
                cc.callFunc(()=>{
                    let isHit = false;
                    let gap = 10;

                    for(let knifeNode of this.knifeNodeArr){
                        if(Math.abs(knifeNode.angle) < gap || Math.abs(360 - knifeNode.angle) < gap){
                            isHit = true;
                            break;
                        }
                    }

                    if(this.knifeDrop == 0 && this.knifeThrow == 10){
                        this.targetRotation = 0;
                        this.winNode.runAction(cc.sequence(
                            cc.moveTo(0.25, cc.v2(360, this.winNode.y)),
                            cc.callFunc(()=>{
                                setTimeout(()=>{
                                    cc.director.loadScene('game-008');
                                }, 500)
                            })
                            
                        ))
                    }else if((this.knifeThrow + this.knifeDrop) >= 10){
                        this.targetRotation = 0;
                        this.winNode.runAction(cc.sequence(
                            cc.moveTo(0.25, cc.v2(360, this.winNode.y)),
                            cc.callFunc(()=>{
                                setTimeout(()=>{
                                    cc.director.loadScene('game-008');
                                }, 500)
                            })
                        ))
                    }else if(isHit){
                        this.knifeDrop += 1;
                        this.knifeNode.runAction(cc.sequence(
                            cc.spawn(
                                cc.moveTo(0.25, cc.v2(this.knifeNode.x+180, -cc.winSize.height)),
                                cc.rotateTo(0.25, 30)
                            ),
                            cc.callFunc(()=>{

                                if((this.knifeThrow + this.knifeDrop) == 10){
                                    this.canThrow = false;
                                    this.targetRotation = 0;
                                    this.winNode.runAction(cc.sequence(
                                        cc.moveTo(0.25, cc.v2(360, this.winNode.y)),
                                        cc.callFunc(()=>{
                                            setTimeout(()=>{
                                                cc.director.loadScene('game-008');
                                            }, 500)
                                        })
                                    ))
                                }else{
                                    this.knifeDrop += 1;
                                    let knifeNode = cc.instantiate(this.knifePrefab);
                                    knifeNode.setPosition(this.knifeNode.position);
                                    this.node.addChild(knifeNode);
                                    this.knifeNode.setPosition(cc.v2(0, -300));
                                    this.knifeNode.runAction(cc.sequence(
                                        cc.rotateTo(0, 0),
                                        cc.callFunc(()=>{
                                            this.canThrow = true;
                                        })
                                    ))
                                }
                                
                            })
                        ))
                    }else{
                        let knifeNode = cc.instantiate(this.knifePrefab);
                        knifeNode.setPosition(this.knifeNode.position);
                        this.node.addChild(knifeNode);
                        this.knifeNode.setPosition(cc.v2(0, -300));
    
                        this.knifeNodeArr.push(knifeNode);
    
                        this.canThrow = true;
                    }

                })
            ))
        }
    },

    update (dt) {
        this.targetNode.angle = (this.targetNode.angle + this.targetRotation) % 360;

        for(let knifeNode of this.knifeNodeArr){

            // Set the angle same with the target, follow the rotation of target.
            knifeNode.angle = (knifeNode.angle + this.targetRotation) % 360;

            // Let the knife rotate around the half of the radius of target
            let rad = Math.PI * (knifeNode.angle - 90) / 180;
            let r = this.targetNode.width / 2;
            knifeNode.x = this.targetNode.x + r * Math.cos(rad);
            knifeNode.y = this.targetNode.y + r * Math.sin(rad);
        }
    },
});
