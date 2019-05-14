/* 定义一个类，用于创造vue实例*/
class Vue {
  constructor(options = {}) {
    //给vue实例增加属性
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    //通过observe监视data数据
    new Observer(this.$data)

    //把data中的数据代理到vm上
    this.proxy(this.$data)

    //把methods的数据代理到vm上
    this.proxy(this.$methods)

    //如果指定了el参数，对el进行解析
    if (this.$el) {
      //compile 负责解析模板的内容
      //  需要：模板、数据
      let c = new Compile(this.$el, this)

    }
  }

  /**
   *使用proxy代理 将this.$data上的数据代理到this上
   * @param data
   */
  proxy(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(v) {
          if(data[key] == v) return
          data[key] = v
        }
      })
    })
  }

}
