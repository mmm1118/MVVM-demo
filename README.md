# MVVM框架介绍
  - M（Model，模型层 ），
  - V（View，视图层），
  - VM（ViewModel，视图模型，V与M连接的桥梁）
  - MVVM框架实现了数据双向绑定
    1. 当M层数据进行修改时，VM层会监测到变化，并且通知V层进行相应的修改
    2. 修改V层则会通知M层数据进行修改
    3. MVVM框架实现了视图与模型层的相互解耦

![MVVM](https://img-blog.csdnimg.cn/20190514173135299.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3ptMDYyMDExMTg=,size_16,color_FFFFFF,t_70)

## 几种双向数据绑定的方式
 1 发布-订阅者模式（backbone.js）
   - 一般通过pub、sub的方式来实现数据和视图的绑定，但是使用起来比较麻烦
   
 2 脏值检查(angular.js)
   - angular.js 是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图。类似于通过定时器轮训检测数据是否发生了改变。
   
 3 数据劫持 
   - vue.js 则是采用数据劫持结合发布者-订阅者模式的方式。通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。(vuejs不兼容IE8以下的版本)

## Vue实现思路
  1. [实现一个Compiler模板解析器，能够对模版中的指令和插值表达式进行解析,并且赋予不同的操作](https://github.com/mmm1118/MVVM-demo/blob/master/src/compile.js)
  2. [实现一个Observer数据监听器，能够对数据对象的所有属性进行监听](https://github.com/mmm1118/MVVM-demo/blob/master/src/observe.js)
  3. [实现一个Watcher观察者，将Compile的解析结果，与Observer所观察的对象连接起来，建立关系，在Observer观察到对象数据变化时，接收通知，同时更新DOM](https://github.com/mmm1118/MVVM-demo/blob/master/src/watcher.js)
  4. [创建一个公共的入口对象，接收初始化的配置并且协调上面三个模块，也就是vue](https://github.com/mmm1118/MVVM-demo/blob/master/src/vue.js)
  5. [html中使用](https://github.com/mmm1118/MVVM-demo/blob/master/index.html)


![MVVM](https://img-blog.csdnimg.cn/20190514173210964.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3ptMDYyMDExMTg=,size_16,color_FFFFFF,t_70)


new Vue > compile > 指令 表达式 解析(new Watcher -订阅数据变化 ) > observe 数据劫持（简体数据改变 new Dep > addSub(watcher存储起来)> 数据改变就通知dep.notify）> watcher 接受到通知 触发updata  更新视图 
 多个watcher 怎么管理？> 使用发布订阅者模式> 有watcher就存储起来 > 数据改变调用updata通知所有的订阅者更新数据

## 发布-订阅者模式，也叫观察者模式
 > 它定义了一种一对多的依赖关系，即当一个对象的状态发生改变的时候，所有依赖于它的对象都会得到通知并自动更新，解决了主体对象与观察者之间功能的耦合。

例子：微信公众号
 - 订阅者：只需要要订阅微信公众号
 - 发布者(公众号):发布新文章的时候，推送给所有订阅者
 - 优点：解耦合(订阅者不用每次去查看公众号是否有新的文章
发布者不用关心谁订阅了它，只要给所有订阅者推送即可)
---
