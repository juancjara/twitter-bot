function Promise(fn) {
  
  var next = null;
  var onError = null;

  function resolve(value) {
    setTimeout(function() {
      next(value);
    },1);
  }

  function rejected(msgError) {
    setTimeout(function() {
      onError(msgError);
    },1);
  }
  
  this.error = function(cb) {
    onError = cb;
  }

  this.then = function(cb) {
    next = cb;
    return this;
  }

  fn(resolve, rejected);
}

function Promise1(fn) {  
  var state = 'pending';
  var value;
  var deferred;

  function resolve(newValue) {
    value = newValue;
    state = 'resolved';

    if(deferred) {
      handle(deferred);
    }
  }

  function handle(onResolved) {
    if(state === 'pending') {
      deferred = onResolved;
      return;
    }

    onResolved(value);
  }

  this.then = function(onResolved) {
    handle(onResolved);
    return this;
  };

  fn(resolve);
}

new Promise1(function(resolve, rejected) {
  console.log('before')
    setTimeout(function() {
      console.log('zzz');
      resolve('yeah!');
    }, 1000);
  }).then(function(gg) {
    console.log('then before code', gg)
  }).then(function(gg) {
    console.log('then before code', gg)
  })
