// 实现一个类，用来创建vue实例0000
class Vue {
  constructor(options = {}) {
    // 给vue实例添加属性
    this.$el = options.el;
    this.$data = options.data;
    this.$methods = options.methods;

    // 监视data中的数据
    new Observer(this.$data);

    // 将data和methods代理到vue实例中
    this.proxy(this.$data);
    this.proxy(this.$methods);

    // 调用compile编译模板 编译模板需要模板和数据
    new Compile(this.$el, this);
  }

  proxy(data) {
    Object.keys(data).forEach(key => {
      console.log(key);
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get() {
          return data[key];
        },
        set(newValue) {
          if (data[key] === newValue) return;
          data[key] = newValue;
        }
      })
    })
  }
}