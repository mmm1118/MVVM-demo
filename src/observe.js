/* observe 用于给data中所有的数据天机getter setter 方便我们在获取或者设置data中数据的时候，实现一下逻辑 */

class Observer {
  constructor(data) {
    this.data = data
    this.walk(data)
  }

  /*核心方法*/

  /**
   * 遍历data中的数据，都添加上getter,setter
   * @param data
   */
  walk(data) {
    if (!data || typeof data != "object") {
      return
    }
    Object.keys(data).forEach(key => {
      //给data对象的可以设置setter,getter
      this.defineReactive(data, key, data[key])
      //如果$data[key]是复杂类型 递归walk
      this.walk(data[key])
    })
  }

  /**
   * 定义响应式的数据（数据劫持）
   * data中的每一个数据都应该维护一个dep对象
   * dep保存了所有的订阅了该数据的订阅者
   * @param obj
   * @param key
   * @param value
   * @returns {*}
   */
  defineReactive(obj, key, value) {
    let that = this
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      configurable: true, // 表示属性可以配置
      enumerable: true, // 表示这个属性可以遍历

      // 每次获取对象的这个属性的时候，就会被这个get方法给劫持到 getter
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value
      },

      // 每次设置这个对象的属性的时候，就会被set方法劫持到
      // 设置的值也会劫持到 setter
      set(newValue) {
        console.log('set方法执行了---',newValue)
        value !== newValue ? value = newValue : null
        //如果newValue也是一个对象 也要调用walk
        that.walk(value)

        //发生改变 调用wather的updata方法 (发布通知)
        dep.notify()

      }
    })
  }
}
