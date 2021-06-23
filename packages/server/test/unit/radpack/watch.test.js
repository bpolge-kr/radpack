import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { id, Server, createClass } = t.context;
  const url = 'http://test/' + id;
  t.context.urls = [url];
  t.context.options = { tts: 1 };
  t.context.cache = { url, jsonString: JSON.stringify({}) };
  t.context._loadJson = () => {};
  t.context.instance = new (createClass(Server, {
    _getCache: () => t.context.cache,
    _loadJson: (url) => t.context._loadJson(url),
    _setRegister: () => {},
    _fetchRegister: () => {}
  }))();
  let count = 0;
  t.context.sut = (index = 0, urls = t.context.urls, options = t.context.options) => {
    if (count++) {
      return; // only run once for testing
    }
    return t.context.instance._watch(index, urls, options);
  };
});

test('fetches url', async t => {
  const { sut, instance } = t.context;
  t.is(instance._loadJson.calls.length, 0);
  sut();
  await new Promise(resolve => setTimeout(resolve, 1));
  t.is(instance._loadJson.calls.length, 1);
  t.is(instance._fetchRegister.calls.length, 0);
});

test('fetches register on change', async t => {
  const { sut, cache, instance } = t.context;
  t.is(instance._loadJson.calls.length, 0);
  t.is(instance._setRegister.calls.length, 0);
  t.is(instance._fetchRegister.calls.length, 0);
  t.context._loadJson = () => {
    cache.jsonString = JSON.stringify({ new: true });
  };
  sut();
  await new Promise(resolve => setTimeout(resolve, 1));
  t.is(instance._loadJson.calls.length, 1);
  t.is(instance._setRegister.calls.length, 1);
  t.is(instance._fetchRegister.calls.length, 1);
});
