import config from '../config';
describe('Stripe config', () => {
  it('exports a config object', () => {
    expect(typeof config).toBe('object');
  });
});
