/* compile 专门扶着解析模板内容 */

class Compile {
  /**
   *
   * @param el --new Vue传递的选择器
   * @param vm --vue实例
   */
  constructor(el, vm) {
    console.log(vm)
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    this.vm = vm
    //编译模板
    if (this.el) {
      //1. 把el中所有的子节点都放到内存中，fragment
      let fragment = this.node2fragment(this.el)
      //2. 在内存中编译fragment
      this.compile(fragment)
      //3. 把fragment一次性添加到页面
      this.el.appendChild(fragment)
    }
  }

  /*核心方法*/
  /**
   * 将节点添加到fragment 中
   * @param node
   * @returns {DocumentFragment}
   */
  node2fragment(node) {
    let fragment = document.createDocumentFragment()
    //把 el中所有的子节点挨个添加到文档碎片中
    let childNodes = node.childNodes
    this.toArray(childNodes).forEach(node => {
      //把所有的子节点都添加到fragment中
      fragment.appendChild(node)
    })
    return fragment
  }

  /**
   * 编译文档碎片
   * @param fragment
   */
  compile(fragment) {
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 如果是元素，需要解析指令
        this.compileElement(node)
      }
      if (this.isTextNode(node)) {
        // 如果是文本节点，需要解析指令需要解析插值表达式
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length > 0) {
        //如果当前节点还有子节点 需要递归解析
        this.compile(node)
      }
    })
  }

  /**
   * 解析html标签
   * @param node
   */
  compileElement(node) {
    //1 获取到当前节点下的所有属性
    let attributes = node.attributes
    this.toArray(attributes).forEach(attr => {
      let attrName = attr.name
      //2 解析vue指令（以v-on开头的指令）
      if (this.isDirective(attrName)) {
        //指令类型
        let type = attrName.slice(2)
        //指令值
        let expr = attr.value

        if (this.isEventDirective(type)) {
          CompileUtil['enentHandler'](node, this.vm, type, expr)
        } else {
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })

  }

  /**
   * 解析文本节点
   * @param node
   */
  compileText(node) {
    CompileUtil.mustache(node, this.vm)
  }

  /*工具方法*/
  /**
   * 转化为数组
   * @param likeArray
   * @returns {*[]}
   */
  toArray(likeArray) {
    return [].slice.call(likeArray)
  }

  /**
   * nodeType:节点类型 1：元素节点 3：文本节点
   * @param node
   */
  isElementNode(node) {
    return node.nodeType === 1
  }

  isTextNode(node) {
    return node.nodeType === 3
  }

  /**
   * 判断是否为v-开头的指令
   * @param attr
   * @returns {boolean}
   */
  isDirective(attr) {
    return attr.startsWith("v-")
  }

  /**
   * 判断是否是事件指令
   * @param attr
   * @returns {boolean}
   */
  isEventDirective(attr) {
    return attr.split(':')[0] === 'on'
  }
}


//util 将编译的方法提取出来 方便增删改查
let CompileUtil = {
  //处理文本
  mustache(node, vm) {
    let text = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(text)) {
      //通过正则分组 取到内容 将原来的美容替换为data里的数据
      let expr = RegExp.$1
      node.textContent = text.replace(reg, this.getVMValue(vm, expr))
      new Watcher(vm, expr, newVlue => {
        node.textContent = text.replace(reg, newVlue)
      })
    }
  },

  //处理v-text
  text(node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)

    //通过watcher监听expr的数据变化，一旦改变执行回调
    new Watcher(vm, expr, newVlue => {
      node.textContent = newVlue
    })
  },
  //处理v-html
  html(node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
    new Watcher(vm, expr, newVlue => {
      node.innerHTML = newVlue
    })
  },
  //处理v-model
  model(node, vm, expr) {
    let that = this
    node.value = this.getVMValue(vm, expr)

    //实现双向数据绑定，给node注册input事件，当前元素value值发生改变，data里数据也要改变
    node.addEventListener('input', function () {
      console.log(this.value)
      that.setVMValue(vm, expr, this.value)
    })

    new Watcher(vm, expr, newVlue => {
      node.value = newVlue
    })
  },
  //处理事件
  enentHandler(node, vm, type, expr) {
    let eventType = type.split(":")[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) node.addEventListener(eventType, fn.bind(vm))
  },
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
  },
  /**
   * 获取VM中的数据 （主要解决对象中的数据）
   * @param vm
   * @param expr
   * @returns {*}
   */
  setVMValue(vm, expr, value) {
    let data = vm.$data
    // debugger
    let arr = expr.split('.')
    arr.forEach((key, i) => {
      if (i < arr.length - 1) {
        data = data[key]
      } else {
        data[key] = value
      }
    })
  }
}
