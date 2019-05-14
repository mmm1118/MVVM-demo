/*watcher 模块负责把compile 模块 与observe 模块连接起来（桥梁）*/

class Watcher {
  /**
   * @param vm:当前vm实例
   * @param expr：data中数据的名字
   * @param cb：一旦数据发生了改变，需要调用cb
   */
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    //this 表示新创建的watcher对象 存储到dep.target 属性上
    Dep.target = this

    //把expr的旧值储存起来
    this.oldValue = this.getVMValue(vm, expr)

    //清空dep.target
    Dep.target = null

  }

  /**
   * 对外暴露的方法，用于更新页面
   * 对比新旧的值 改变就调用cb
   */
  updata() {
    let oldValue = this.oldValue
    let newValue = this.getVMValue(this.vm, this.expr)
    if (oldValue != newValue) {
      this.cb(newValue, oldValue)
    }
  }

  /**
   * 获取VM中的数据 （主要解决对象中的数据）
   * @param vm
   * @param expr
   * @returns {*}
   */
  getVMValue(vm, expr) {
    let data = vm.$data

    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data
  }
}

/* dep 对象用于管理所有的订阅者和通知这些订阅者*/

class Dep {
  constructor() {
    //用于管理订阅者
    this.subs = []
  }

  //添加订阅者
  addSub(watcher) {
    this.subs.push(watcher)
  }

  //通知 发布
  notify() {
    //通知所有的订阅者，调用watcher的update方法
    this.subs.forEach(sub => {
      sub.updata()
    })
  }
}
