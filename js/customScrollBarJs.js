/* 
 * author@杰森先生（http://www.imwangfu.com）
 */
(function(){
var barCtn = document.querySelectorAll(".customBarContent");
var barNums = barCtn.length;
//皮肤选择
var barSkin ={
    bright:{
        barInner: 'custom-bar-inner',
        barOuter: 'custom-bar-outer',
        barContanier:"bar-container",
        bar:"bar"
    },
    dark:{
        barInner: 'custom-bar-inner',
        barOuter: 'custom-bar-outer',
        barContanier:"bar-container2",
        bar:"bar2"
    }
}
if (barNums > 0) {
    for (var i = 0; i < barNums; i++) {
        var skin;
        var skinName = barCtn[i].getAttribute('data-skin');
        if(skinName){
           skin = barSkin[skinName];
        }else{
           skin = barSkin['bright'];
        }
        
        var customBar = new setCustomBar(barCtn[i],skin);
        customBar.init();
    }
}
function setCustomBar(barCtn,skin) {
    this.lastY = false;//上一次位置
    this.offsetY = 0; //拖动滚动条时与滚动条顶部的偏移距
    this.barCtn = barCtn;//原滚动内容
    this.barCtnTop = 0;//滚动内容与顶部的距离
    this.barMaxTop = 0;//最大的滚动距离
    this.skin = skin;//皮肤
    this.innerElement = document.createElement("div");//更新DOM后的新滚动内容
    this.outerElement = document.createElement("div");//滚动内容与滚动条的外层容器
    this.bar = document.createElement("div");//滚动条
    this.barContanier = null;//滚动条容器
    this.barHeight = 0;//滚动条高度
    this.barCtnClientHeight = 0;//滚动条内容可视区域高度
    this.scrollHeight = barCtn.scrollHeight;//内容总高度
    this.timeStamp = 0;
    
    this.handler = function () {};//临时函数名
    //初始化
    this.init   = function(){
        this.createWrap();
        this.createBar();
        this.listenBarDrag();
        this.mouseWheel();
        this.listenBarClick();
        _this  = this ;
        window.onresize = function(){
            _this.createBar();;
        }
    }
    //把滚动内容放在新容器内包裹
    this.createWrap = function () {
        this.innerElement.innerHTML = this.barCtn.innerHTML;
        this.barCtn.innerHTML = '';
        this.barCtn.appendChild(this.innerElement);
        this.innerElement.className = this.skin.barInner;
        this.outerElement.appendChild(this.innerElement);
        this.barCtn.appendChild(this.outerElement);
        this.barCtn = this.innerElement;
        this.outerElement.className =this.skin.barOuter;
        
    }
    //创建滚动条
    this.createBar = function () {
        var viewportHeight =document.documentElement.clientHeight;
        //设置滚动内容高度
        if(this.barCtn.offsetHeight<viewportHeight){
            this.barCtnClientHeight = this.barCtn.offsetHeight;
        }else{
            this.barCtnClientHeight =viewportHeight ;
        }
        if(!this.barContanier){
            this.barContanier = document.createElement("div");
            this.barContanier.className = this.skin.barContanier;
            this.bar.className =this.skin.bar;
            this.barContanier.appendChild(this.bar);
            this.outerElement.appendChild(this.barContanier);
        }
        this.innerElement.style.height = this.barCtnClientHeight+"px";
        this.barContanier.style.height = this.barCtnClientHeight+"px";
        this.scrollHeight = this.barCtn.scrollHeight;
        this.barCtnTop = this.innerElement.offsetTop;
        var percentage = (this.barCtnClientHeight) / this.scrollHeight;
        if(percentage == 1){//不要滚动条
            this.innerElement.classList.add("custom-nobar");
            if(this.barContanier){
                this.barContanier.style.display='none';
            }
        }else{
            this.innerElement.classList.remove("custom-nobar");
            if(this.barContanier){
                this.barContanier.style.display='block';
            }
        }
        this.barHeight =Math.floor((this.barContanier.offsetHeight) * percentage);
        this.bar.style.height = this.barHeight+"px";
        this.isToEnd();
        this.barMaxTop = parseInt(this.barContanier.offsetHeight - this.barHeight);
        this.updateContent(parseInt(this.bar.offsetTop) / this.barMaxTop)
    }
    //监听鼠标拖动滚动条
    this.listenBarDrag = function () {
        var _this = this;
        this.bar.addEventListener('mousedown', function (e) {
            
            _this.timeStamp = e.timeStamp;
            _this.lastY = e.clientY;
            _this.offsetY = e.clientY - _this.bar.offsetTop - _this.barCtnTop;
            _this.bar.classList.add("active");
            //滚动时期禁用页面任何选取操作
            document.body.classList.add('dis-select');
            window.addEventListener("mousemove", _this.handler = _this.handleScroll.bind(_this), false);
            window.addEventListener("mouseup", function () {
                document.body.classList.remove('dis-select');
                _this.offsetY = 0;
                _this.bar.classList.remove("active");
                window.removeEventListener("mousemove", _this.handler);
                window.removeEventListener('mouseup', arguments.callee)
            }, false);
        }, false);
    }
    //监听滚轮点击
    this.listenBarClick = function () {
        var _this = this;
        this.barContanier.addEventListener('click', _this.turnPage.bind(_this), false)
    }
    //监听滚轮滑动
    this.mouseWheel = function () {
        var _this = this;
        this.outerElement.addEventListener("mousewheel", _this.turnPage.bind(_this), false)
        //火狐滚轮事件
        this.outerElement.addEventListener("DOMMouseScroll", _this.turnPage.bind(_this), false)
    }
    //滑轮、翻页滚动
    this.turnPage = function (event){
        event.preventDefault();
        if (event.target == this.bar) {
            return;
        }
        var e = {
            clientY : 0
        }
        var type = event.type;
        e.clientY = this.lastY;
        this.offsetY = e.clientY - this.bar.offsetTop - this.barCtnTop;
        if (type == "click" && event.clientY < this.bar.offsetTop || event.wheelDelta > 0||event.detail<0) {
            e.clientY -= 35;
        } else {
            e.clientY += 35;
        }
        this.handleScroll(e)
    }
    //更新滚动内容
    this.updateContent = function (percentage) {
       /*  var barContanierHeight = this.barCtn.offsetHeight; */
        this.barCtn.scrollTop = (this.scrollHeight - this.barCtnClientHeight) * percentage;
        return true;
    }
    //滚动
    this.handleScroll = function (event) {
        var moveY = event.clientY;
        var barTop = this.bar.offsetTop
        var disY = moveY - this.lastY;
        this.lastDirection = this.direction;
        this.lastY = event.clientY;
        //鼠标需要恢复到滚动离开两端时的位置才能滚动
        if (disY < 0 && moveY >= this.offsetY + barTop + this.barCtnTop) {
            return;
        }
        if (disY > 0 && moveY <= this.offsetY + barTop + this.barCtnTop) {
            return;
        }
        //更新滚动条高度
        this.bar.style.top = this.bar.offsetTop + disY+"px";
        this.isToEnd();
        this.updateContent(parseInt(this.bar.offsetTop) / (this.barMaxTop-4))
    }
      //滚动条是否到达两端
    this.isToEnd =function(){
        var barContanierHeight = this.barContanier.offsetHeight;
        if (this.bar.offsetTop <= 0) {
            this.bar.style.top = 0;
            return true;
        }
        if (barContanierHeight - this.barHeight - this.bar.offsetTop <= 1) {//去除下一像素边框
            this.bar.style.top = barContanierHeight - this.barHeight - 2+"px";
            return true;
        }
        return false;
    }
}
})()