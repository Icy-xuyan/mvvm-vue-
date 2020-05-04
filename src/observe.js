/**
 * observer用于给data中的所有数据添加getter和setter
 * 方便在获取和设置data数据的时候 实现我们自己的逻辑
 */
class Observer {
  constructor(data) {
    this.data = data;
    this.walk(data);
  }

  /** 核心方法 */
  // 遍历data中的所有数据 都加上getter和setter
  walk(data) {
    // 首先做个筛选，遍历的数据必须是个对象
    if (!data || typeof data != 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      // 对每个数据进行劫持
      this.defineReactive(data, key, data[key]);
      // 如果是复杂数据类型，还要对该数据进行处理
      this.walk(data[key]);
    })
  }

  // 数据劫持
  defineReactive(obj, key, value) {
    let that = this;
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newValue) {
        // 如果修改的数据和之前的一样
        if (newValue === value) {
          return;
        }
        value = newValue;
        // 如果修改的是个复杂数据类型，也需要响应式处理
        that.walk(value);
        // 在数据发生改变的时候调用watcher的update方法
        dep.notify();
      }
    })
  }
}