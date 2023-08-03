document.addEventListener('deviceready', initStore);
document.addEventListener('deviceready', refreshGoldCoinsUI);

function initStore() {

alert(window.store);
console.log(window.store);
  if (!window.store) {


    console.log('Store not available');
    return;
  }


  store.verbosity = store.INFO;
  store.register({
    id:    'week_id',
    alias: 'my_consumable1',
    type:   store.CONSUMABLE
  });


  store.order('my_consumable1');

  store.error(function(error) {
alert('ERROR ' + error.code + ': ' + error.message);
    console.log('ERROR ' + error.code + ': ' + error.message);
  });

  store.when('my_consumable1').updated(refreshProductUI);
  store.when('my_consumable1').approved(function(p) {
    p.verify();
  });
  store.when('my_consumable1').verified(finishPurchase);

  store.refresh();
}

function refreshGoldCoinsUI() {
  document.getElementById('gold-coins').innerHTML =
    'Gold: <strong>' + (window.localStorage.goldCoins | 0) + '</strong>';
}

function refreshProductUI(product) {
  const info = product.loaded
  ? `<h1>${product.title}</h1>` +
    `<p>${product.description}</p>` +
    `<p>${product.price}</p>`
  : '<p>Retrieving info...</p>';
  const button = product.canPurchase
  ? '<button onclick="purchaseConsumable1()">Buy Now!</button>'
  : '';
  const el = document.getElementById('consumable1-purchase');
  el.innerHTML = info + button;
}

function purchaseConsumable1() {
  store.order('my_consumable1');
}

function finishPurchase(p) {
  window.localStorage.goldCoins = (window.localStorage.goldCoins | 0) + 10;
  p.finish();
  refreshGoldCoinsUI();
}