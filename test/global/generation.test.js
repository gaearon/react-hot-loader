import * as generation from '../../src/global/generation'

describe('generation', () => {
  it('should maintain generation counter', () => {
    expect(generation.get()).toBe(0)
    generation.increment()
    expect(generation.get()).toBe(1)
  })
})
