export default class ComponentMap {
  constructor(useWeakMap) {
    if (useWeakMap) {
      this.wm = new WeakMap()
    } else {
      this.slots = {}
    }
  }

  getSlot(type) {
    const key = type.displayName || type.name || 'Unknown'
    if (!this.slots[key]) {
      this.slots[key] = []
    }
    return this.slots[key]
  }

  get(type) {
    if (this.wm) {
      return this.wm.get(type)
    }

    const slot = this.getSlot(type)
    for (let i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return slot[i].value
      }
    }

    return undefined
  }

  set(type, value) {
    if (this.wm) {
      this.wm.set(type, value)
    } else {
      const slot = this.getSlot(type)
      for (let i = 0; i < slot.length; i++) {
        if (slot[i].key === type) {
          slot[i].value = value
          return
        }
      }
      slot.push({ key: type, value })
    }
  }

  has(type) {
    if (this.wm) {
      return this.wm.has(type)
    }

    const slot = this.getSlot(type)
    for (let i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return true
      }
    }
    return false
  }
}