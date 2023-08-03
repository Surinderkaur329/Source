document.addEventListener('deviceready', initStore);


function initStore() {
  if (!window.store) {


    console.log('Store not available');
    return;
  }
store.get('week_id');

  store.verbosity = store.INFO;
  store.register({
    id:    'week_id',
    alias: 'my_consumable1',
    type:   store.CONSUMABLE
  });


  store.order('my_consumable1');

  store.error(function(error) {

  window.localStorage.setItem("purchaseToken", token);
alert('ERROR ' + error.code + ': ' + error.message);

      window.location="index.html";
  });

  store.when('my_consumable1').updated();
  store.when('my_consumable1').approved(function(p) {

 // alert("approved");
 window.localStorage.setItem("purchaseToken", 'token');

   // p.verify();
window.location="index.html";

  });
  store.when('my_consumable1').verified(finishPurchase);

  store.refresh();
}





function purchaseConsumable1() {
  store.order('my_consumable1');
}

function finishPurchase(p) {
//alert(JSON.stringify(p));
  //window.localStorage.goldCoins = (window.localStorage.goldCoins | 0) + 10;
 // p.finish();
 // refreshGoldCoinsUI();

 localStorage.purchaseToken="1";
 //window.localStorage.setItem("purchaseToken", token);

 window.location="index.html";




}