import React from 'react'
import { areComponentsEqual, setConfig } from '../../src/index.prod'

describe('utils (prod)', () => {
  describe('#areComponentsEqual', () => {
    it('should test if two components are equal', () => {
      const Comp1 = () => <div />
      const Comp2 = () => <div />
      expect(areComponentsEqual(Comp1, Comp1)).toBe(true)
      expect(areComponentsEqual(Comp1, Comp2)).toBe(false)
    })
  })

  describe('#setConfig', () => {
    it('should be a function', () => {
      expect(setConfig).toEqual(expect.any(Function))
    })
  })
})
