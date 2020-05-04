/**
 * 编译模板的类
 * 参数1 el 模板选择器或者模板dom
 * 参数2 vm vue实例
 */
class Compile {
  constructor(el, vm) {
    // 给实例增加属性
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.vm = vm;

    // 1. 将模板数据放到内存中 fragement
    let fragement = this.node2fragement(this.el);
    // 2. 编译内存中的模板
    this.compile(fragement);
    // 3. 将编译好的模板重新插入到页面模板
    this.el.appendChild(fragement);
  }

  /** 核心方法 */
  // 将模板数据放到内存中
  node2fragement(node) {
    let childNodes = node.childNodes;
    // 创建一个空的fragement
    let fragement = document.createDocumentFragment();
    this.toArray(childNodes).forEach(node => {
      fragement.appendChild(node);
    })
    return fragement;
  }

  // 编译模板
  compile(fragement) {
    // 获取内存中需要编译的子节点
    let childNodes = fragement.childNodes;
    this.toArray(childNodes).forEach(node => {
      // 如果是标签节点，编译指令
      if (this.isElementNode(node)) {
        this.compileElement(node);
      }
      // 如果是文本节点，编译插值表达式
      if (this.isTextNode(node)) {
        this.compileText(node);
      }
      // 如果当前节点下还有子节点，递归继续解析
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    })
  }

  // 编译标签节点指令
  compileElement(node) {
    // 获取标签上所有属性
    let attributes = node.attributes;
    this.toArray(attributes).forEach(attr => {
      let attrName = attr.name;
      // console.log(attrName, expr);
      // 判断是否是指令
      if (this.isDirective(attrName)) {
        // 对指令进行解析
        let type = attrName.slice(2);
        let expr = attr.value;
        // if (type === 'text') {
        //   // node.textContent = this.vm.$data[expr];
        //   compileUtil.text(node, this.vm, expr);
        // }
        // if (type === 'html') {
        //   // node.innerHTML = this.vm.$data[expr];
        //   compileUtil.html(node, this.vm, expr);
        // }
        if (this.isEvent(type)) {
          // 事件指令
          // 给对应元素注册时间
          // node.addEventListener(eventType, this.vm.$methods[expr].bind(this.vm));
          compileUtil.eventHandler(node, type, this.vm, expr);
        } else {
          // 普通指令
          compileUtil[type](node, this.vm, expr);
        }
      }
    })
  }
  // 编译文本节点插值表达式
  compileText(node) {
    compileUtil.mustache(node, this.vm);
  }

  /** 功能方法 */
  toArray(likeArray) {
    return [].slice.call(likeArray);
  }
  isElementNode(node) {
    return node.nodeType === 1;
  }
  isTextNode(node) {
    return node.nodeType === 3;
  }
  isDirective(attrName) {
    return attrName.startsWith('v-');
  }
  isEvent(type) {
    return type.split(':')[0] === 'on';
  }

}

const compileUtil = {
  text(node, vm, expr) {
    node.textContent = this.getVMData(vm, expr);
    new Watcher(vm, expr, newValue => {
      node.textContent = newValue;
    })
  },
  html(node, vm, expr) {
    node.innerHTML = this.getVMData(vm, expr);
    new Watcher(vm, expr, newValue => {
      node.innerHTML = newValue;
    })
  },
  model(node, vm, expr) {
    let self = this;
    node.value = this.getVMData(vm, expr);
    // 当输入文本框发生变化时，更改数据
    node.addEventListener('input', function () {
      // 更新数据
      self.setVMData(vm, expr, this.value);
    })
    new Watcher(vm, expr, newValue => {
      node.value = newValue;
    })
  },
  eventHandler(node, type, vm, expr) {
    let eventType = type.split(':')[1];
    node.addEventListener(eventType, vm.$methods[expr].bind(vm));
  },
  mustache(node, vm) {
    let txt = node.textContent;
    // 仅对插值表达式进行处理
    let reg = /\{\{(.+)\}\}/;
    if (reg.test(txt)) {
      // node.textContent = txt.replace(reg, vm.$data[RegExp.$1])
      let expr = RegExp.$1;
      node.textContent = txt.replace(reg, this.getVMData(vm, expr));
      new Watcher(vm, expr, newValue => {
        node.textContent = txt.replace(reg, newValue);
      })
    }
  },
  getVMData(vm, expr) {
    let data = vm.$data;
    expr.split('.').forEach(item => {
      data = data[item]
    })
    return data;
  },
  // value 要设置的值
  setVMData(vm, expr, value) {
    let data = vm.$data;
    let arr = expr.split(".");
    arr.forEach((key, index) => {
      if (index < arr.length - 1) {
        data = data[key]
      } else {
        data[key] = value;
      }
    })
  }
}