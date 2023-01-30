import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | picasa-auto-image', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<PicasaAutoImage />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <PicasaAutoImage>
        template block text
      </PicasaAutoImage>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
