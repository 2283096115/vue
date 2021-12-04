// 重写响应式原理
function observe(data) {
  if (!data || typeof data !== 'object') {
    return 
  } else {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        let element = data[key];
        if (!element && typeof data === 'object') {
          observe(element)
        } else {
          const dep = new Dep()
          Object.defineProperty(data, key, {
            configurable: true,
            enumerable: true,
            get: function () {
              if (Dep.target) {
                dep.addSub(Dep.target)
              }
              return element
            },
            set: function(newVal) {
              element = newVal
              dep.notify()
            }
          })
        }
      }
    }
  }
}

function Dep() {
  this.subs = []
}
Dep.target = null

Dep.prototype.addSub = function(watcher) {
  this.subs.push(watcher)
}

Dep.prototype.notify = function() {
  this.subs.forEach(item => {
    item.update()
  })
}

function Watcher(vm, exp, cb) {
  this.vm = vm
  this.exp = exp
  this.cb = cb
  this.value = this.get(vm, exp)
}

Watcher.prototype.get = function () {
  Dep.target = this
  const value = this.vm[this.exp]
  Dep.target = null
  return value
}
Watcher.prototype.update = function () {
  const oldVal = this.value
  const newVal = this.vm[this.exp]
  if (oldVal !== newVal) {
    this.cb.call(this.vm, newVal, oldVal)
  }
}

function Compile(el, vm) {
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  init: function () {
    
    this.compileElement(this.el);
  },
  compileElement: function(el) {
    var reg = /\{\{(.*)\}\}/;
    var childNodes = el.childNodes
    Array.from(childNodes).forEach(item => {
      const text = item.textContent
      // 如果是node 则需要对其属性遍历，判断是否有指令，如果是text，则需要修改器值，并且需要加入到watcher，如果有子节点，要回调
      if (item.nodeType == 1) {
        const attributes = item.attributes
        Array.from(attributes).forEach(attr => {
          // const name = attr.name
          if (attr.name === 'v-model') {
            item.addEventListener('input', e => {
              const newValue = e.target.value
              if (newValue !== this.vm[attr.value]) {
                this.vm[attr.value] = newValue
              }
            })
          }
        })
      } else if(item.nodeType === 3 && reg.test(text)) {
        item.textContent = this.vm[reg.exec(text)[1]]
        new Watcher(this.vm, reg.exec(text)[1], function(value, oldValue) {
          item.textContent = value
        })
      }
      if (item.childNodes && item.childNodes.length > 0) {
        this.compileElement(item)
      }
    })
  }
}


function SelfVue(options) {
  const {data, el} = options
  this.data = data
  this.vm = this
  Object.keys(this.data).forEach(key => {
    this.proxyKeys(key);
  });
  observe(data)
  new Compile(el, this)
  // new Watcher(vm, exp, function() {
  //   el.innerHTML = data[exp]
  // })
}

SelfVue.prototype = {
  proxyKeys: function (key) {
      var self = this;
      Object.defineProperty(this, key, {
          enumerable: false,
          configurable: true,
          get: function proxyGetter() {
              return self.data[key];
          },
          set: function proxySetter(newVal) {
              self.data[key] = newVal;
          }
      });
  }
}