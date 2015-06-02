var utils = require('../helpers/utils');

var theater = {
  getList: function(cb) {
    var cinemas = [
      {
        id: 0,
        realName: 'AMC Empire 25',
        simpleName: 'amcempire25',
        type: 'cinema'
      },
      {
        id: 1,
        realName: 'Alamo Drafthouse Littleton',
        simpleName: 'alamodrafthouselittleton',
        type: 'cinema'
      }
    ];
    return cb(null, cinemas);
  },
  format: function(params) {
    var cinema = {
      id: 'c' + params.id,
      realName: params.name,
      simpleName: utils.cleanText(params.name)
    }
    return cinema;
  },
  findOne: function(clue) {
    return 'Theater B';
  }
}

module.exports = theater;