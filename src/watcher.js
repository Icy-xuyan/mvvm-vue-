/**
 * watcher模块负责把compile和observer模块关联起来
 */
class Watcher {
  // vm vue实例
  // expr data中的数据名称
  // callback 数据一旦发生了改变，需要调用的回调函数
  constructor(vm, expr, callback) {
    this.vm = vm;
    this.expr = expr;
    this.callback = callback;
    // this即新创建的watcher对象 将其存储进Dep
    Dep.target = this;
    this.oldValue = this.getVMData(vm, expr);
    // 清空Dep.target
    Dep.target = null;
  }

  // 对外暴露的方法，用于更新页面
  update() {
    // 对比更新前后的数据，如果有变化，就调用callback
    let oldValue = this.oldValue;
    let newValue = this.getVMData(this.vm, this.expr);
    if (oldValue !== newValue) {
      this.callback(newValue, oldValue);
    }
  }

  // 获取vm的data中的数据值
  getVMData(vm, expr) {
    let data = vm.$data;
    expr.split('.').forEach(key => {
      data = data[key]
    })
    return data;
  }
}

// Dep对watcher进行统一管理
class Dep {
  constructor() {
    // 订阅者数据
    this.sub = [];
  }

  // 添加订阅者
  addSub(watcher) {
    this.sub.push(watcher)
  }

  // 统一发布
  notify() {
    this.sub.forEach(sub => {
      sub.update();
    })
  }
}