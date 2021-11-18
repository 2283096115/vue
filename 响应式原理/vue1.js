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

function Watcher(data, exp, cb) {
  this.data = data
  this.exp = exp
  this.cb = cb
  this.value = this.get(data, exp)
}

Watcher.prototype.get = function () {
  Dep.target = this
  const value = this.data[this.exp]
  Dep.target = null
  return value
}
Watcher.prototype.update = function () {
  const oldVal = this.value
  const newVal = this.data[this.exp]
  if (oldVal !== newVal) {
    this.cb()
  }
}

function SelfVue(options) {
  const {data, el, exp} = options
  this.data = data
  el.innerHTML = data[exp]
  observe(data)
  new Watcher(data, exp, function() {
    el.innerHTML = data[exp]
  })
}