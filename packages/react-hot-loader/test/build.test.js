/* eslint-disable camelcase */
import { REGENERATE_METHOD as REGENERATE_METHOD_std } from 'react-stand-in'
import { REGENERATE_METHOD as REGENERATE_METHOD_rhl } from '../src/internal/constants'

describe('Consistency tests', () => {
  it('Should be constant con', () => {
    expect(REGENERATE_METHOD_rhl).toBe(REGENERATE_METHOD_std)
  })
})
